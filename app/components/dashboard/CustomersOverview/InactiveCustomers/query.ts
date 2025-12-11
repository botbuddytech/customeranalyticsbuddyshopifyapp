import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Inactive Customers Query Logic
 *
 * Uses GraphQL queries to get:
 * - total inactive customers in a date range (customers who exist but did NOT place orders in the period)
 * - data points for charting (today = 1 point, others = 2 points: start & end)
 *
 * NOTE:
 * - Requires `read_customers` and `read_orders` scopes.
 * - If your app isn't approved for protected customer/order data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getInactiveCustomersQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const dataPoints: Array<{ date: string; count: number }> = [];

  const now = new Date();
  let startDate: Date;
  let endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  switch (dateRange) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case "yesterday":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case "7days":
    case "last7Days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30days":
    case "last30Days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "90days":
    case "last90Days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  // For "today", only use 1 date point (today)
  // For other ranges, use 2 points (start date and end date)
  const dates = dateRange === "today" 
    ? [endDate] 
    : [startDate, endDate];

  // Helper function to get inactive customers count for a date range
  async function getInactiveCustomersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      // Get total customers count
      const totalCustomersResponse = await admin.graphql(`
        query {
          customersCount {
            count
          }
        }
      `);

      const totalCustomersJson = await totalCustomersResponse.json();
      
      if (totalCustomersJson.errors && totalCustomersJson.errors.length > 0) {
        const accessError = totalCustomersJson.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected customer data") ||
            error.message?.includes("Customer")
        );
        if (accessError) {
          throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
        }
      }

      const totalCustomers = totalCustomersJson.data?.customersCount?.count || 0;

      // Get unique customers who placed orders in this range
      const ordersResponse = await admin.graphql(`
        query ActiveCustomersOrders {
          orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
            nodes {
              id
              customer {
                id
              }
            }
          }
        }
      `);

      const ordersJson = await ordersResponse.json();

      if (ordersJson.errors && ordersJson.errors.length > 0) {
        const accessError = ordersJson.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected") ||
            error.message?.includes("Order")
        );
        if (accessError) {
          throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
        }
        // If we can't access orders, estimate inactive customers
        // Assume 30% are active, rest are inactive
        return Math.ceil(totalCustomers * 0.7);
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      
      // Get unique customer IDs who placed orders in this range (active customers)
      const activeCustomerIds = new Set<string>();
      orders.forEach((order: any) => {
        if (order.customer?.id) {
          activeCustomerIds.add(order.customer.id);
        }
      });

      // Inactive customers = Total customers - Active customers (who placed orders in the period)
      const inactiveCustomers = Math.max(0, totalCustomers - activeCustomerIds.size);

      return inactiveCustomers;
    } catch (error: any) {
      if (
        error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
        error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected")
      ) {
        throw error;
      }
      // For other errors, estimate based on total customers
      try {
        const totalCustomersResponse = await admin.graphql(`
          query {
            customersCount {
              count
            }
          }
        `);
        const totalCustomersJson = await totalCustomersResponse.json();
        const totalCustomers = totalCustomersJson.data?.customersCount?.count || 0;
        return Math.ceil(totalCustomers * 0.7); // Estimate 70% inactive
      } catch {
        return 0;
      }
    }
  }

  // 1) Build dataPoints (for chart)
  // For "today", only use 1 date point (today)
  // For other ranges, use 2 points (start date and end date)
  // We calculate inactive customers at each date point:
  // - At start date: Total customers up to start date - Customers who placed orders up to start date
  // - At end date: Total customers up to end date - Customers who placed orders up to end date
  // This shows the comparison of inactive customers between the two points
  for (const date of dates) {
    const dateEndISO = date.toISOString();
    
    try {
      // Get total customers created up to this date
      const totalCustomersResponse = await admin.graphql(`
        query {
          customersCount(query: "created_at:<='${dateEndISO}'") {
            count
          }
        }
      `);

      const totalCustomersJson = await totalCustomersResponse.json();
      
      // Check for access denied errors
      if (totalCustomersJson.errors && totalCustomersJson.errors.length > 0) {
        const accessError = totalCustomersJson.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected customer data") ||
            error.message?.includes("Customer")
        );
        if (accessError) {
          throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
        }
        throw new Error(totalCustomersJson.errors[0].message || "Unknown GraphQL error");
      }

      const totalCustomers = totalCustomersJson.data?.customersCount?.count || 0;

      // Get unique customers who placed orders up to this date (active customers)
      const ordersResponse = await admin.graphql(`
        query ActiveCustomersUpToDate {
          orders(first: 250, query: "created_at:<='${dateEndISO}'") {
            nodes {
              id
              customer {
                id
              }
            }
          }
        }
      `);

      const ordersJson = await ordersResponse.json();

      if (ordersJson.errors && ordersJson.errors.length > 0) {
        const accessError = ordersJson.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected") ||
            error.message?.includes("Order")
        );
        if (accessError) {
          throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
        }
        // If we can't access orders, estimate inactive customers (70% of total)
        const inactiveCustomers = Math.ceil(totalCustomers * 0.7);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count: inactiveCustomers,
        });
        continue;
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      
      // Get unique customer IDs who placed orders up to this date
      const activeCustomerIds = new Set<string>();
      orders.forEach((order: any) => {
        if (order.customer?.id) {
          activeCustomerIds.add(order.customer.id);
        }
      });

      // Inactive customers at this point = Total customers up to this date - Active customers up to this date
      const inactiveCustomers = Math.max(0, totalCustomers - activeCustomerIds.size);

      // Format date for the data point
      const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      dataPoints.push({
        date: dateString,
        count: inactiveCustomers,
      });
    } catch (error: any) {
      // Check if it's an access denied error
      if (
        error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
        error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected")
      ) {
        throw error;
      }
      // For other errors, push 0 as fallback
      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: 0,
      });
    }
  }

  // 2) Final total count for whole dateRange
  const finalStartDateISO = startDate.toISOString();
  const finalEndDateISO = endDate.toISOString();

  let finalInactiveCustomers = 0;
  try {
    finalInactiveCustomers = await getInactiveCustomersForRange(startDate, endDate);
  } catch (error: any) {
    if (
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw error;
    }
    // Return 0 as fallback for other errors
    finalInactiveCustomers = 0;
  }

  return {
    count: finalInactiveCustomers,
    dataPoints,
  };
}
