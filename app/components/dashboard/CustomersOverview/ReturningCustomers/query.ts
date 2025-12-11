import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Returning Customers Query Logic
 *
 * Uses GraphQL queries to get:
 * - total returning customers in a date range (customers who placed orders in the range AND have placed orders before)
 * - data points for charting (today = 1 point, others = 2 points: start & end)
 *
 * NOTE:
 * - Requires `read_orders` scope.
 * - If your app isn't approved for protected order data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getReturningCustomersQuery(
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

  const dates = dateRange === "today" ? [endDate] : [startDate, endDate];

  // Helper function to get returning customers count for a date range
  async function getReturningCustomersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      // Get all orders in the date range
      const ordersResponse = await admin.graphql(`
        query ReturningCustomersOrders {
          orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
            nodes {
              id
              customer {
                id
              }
              createdAt
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
        throw new Error(ordersJson.errors[0].message || "Unknown GraphQL error");
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      
      // Get unique customer IDs from orders in this range
      const customerIds = new Set<string>();
      orders.forEach((order: any) => {
        if (order.customer?.id) {
          customerIds.add(order.customer.id);
        }
      });

      if (customerIds.size === 0) {
        return 0;
      }

      // For each customer, check if they have orders before the range start
      let returningCount = 0;
      const customerIdArray = Array.from(customerIds);

      // Process customers in batches to avoid query limits
      for (const customerId of customerIdArray) {
        try {
          // Check if this customer has orders before the range start
          const previousOrdersResponse = await admin.graphql(`
            query PreviousOrders {
              orders(first: 1, query: "customer_id:${customerId} created_at:<'${rangeStartISO}'") {
                nodes {
                  id
                }
              }
            }
          `);

          const previousOrdersJson = await previousOrdersResponse.json();
          
          if (previousOrdersJson.errors && previousOrdersJson.errors.length > 0) {
            // Skip this customer if we can't check their previous orders
            continue;
          }

          const previousOrders = previousOrdersJson.data?.orders?.nodes || [];
          if (previousOrders.length > 0) {
            returningCount++;
          }
        } catch (error: any) {
          // Skip this customer if there's an error
          continue;
        }
      }

      return returningCount;
    } catch (error: any) {
      if (
        error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected")
      ) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
      }
      throw error;
    }
  }

  // 1) Build dataPoints (for chart)
  // For "today", only use 1 date point (today)
  // For other ranges, use 2 points (start date and end date)
  // We calculate cumulative returning customers up to each date point
  // A returning customer at a point in time is one who has placed multiple orders up to that date
  for (const date of dates) {
    const dateEndISO = date.toISOString();
    
    try {
      // Get all orders up to this date
      const ordersResponse = await admin.graphql(`
        query OrdersUpToDate {
          orders(first: 250, query: "created_at:<='${dateEndISO}'") {
            nodes {
              id
              customer {
                id
              }
              createdAt
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
        throw new Error(ordersJson.errors[0].message || "Unknown GraphQL error");
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      
      // Count orders per customer to find returning customers (customers with multiple orders)
      const customerOrderCount = new Map<string, number>();
      
      orders.forEach((order: any) => {
        if (order.customer?.id) {
          const customerId = order.customer.id;
          const currentCount = customerOrderCount.get(customerId) || 0;
          customerOrderCount.set(customerId, currentCount + 1);
        }
      });

      // Count customers who have more than 1 order (returning customers)
      let returningCount = 0;
      for (const [customerId, orderCount] of customerOrderCount.entries()) {
        if (orderCount > 1) {
          returningCount++;
        }
      }

      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: returningCount,
      });
    } catch (error: any) {
      if (
        error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected")
      ) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
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

  let finalReturningCustomers = 0;
  try {
    finalReturningCustomers = await getReturningCustomersForRange(startDate, endDate);
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
    // Return 0 as fallback for other errors
    finalReturningCustomers = 0;
  }

  return {
    count: finalReturningCustomers,
    dataPoints,
  };
}
