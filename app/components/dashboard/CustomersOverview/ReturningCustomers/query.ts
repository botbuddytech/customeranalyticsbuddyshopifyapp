import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Returning Customers Query Logic - OPTIMIZED VERSION
 *
 * Key optimizations:
 * 1. Single query to fetch ALL orders (with pagination)
 * 2. In-memory processing instead of multiple API calls per customer
 * 3. Efficient data structures for O(1) lookups
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

  /**
   * OPTIMIZATION: Fetch ALL orders once with pagination
   * This replaces multiple individual queries
   */
  async function fetchAllOrders(): Promise<Array<{ id: string; customerId: string; createdAt: string }>> {
    const allOrders: Array<{ id: string; customerId: string; createdAt: string }> = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    try {
      while (hasNextPage) {
        const query = cursor
          ? `query AllOrders {
              orders(first: 250, after: "${cursor}") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  customer {
                    id
                  }
                  createdAt
                }
              }
            }`
          : `query AllOrders {
              orders(first: 250) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  customer {
                    id
                  }
                  createdAt
                }
              }
            }`;

        const response = await admin.graphql(query);
        const json = await response.json();

        if (json.errors && json.errors.length > 0) {
          const accessError = json.errors.find(
            (error: any) =>
              error.message?.includes("not approved") ||
              error.message?.includes("protected") ||
              error.message?.includes("Order")
          );
          if (accessError) {
            throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
          }
          throw new Error(json.errors[0].message || "Unknown GraphQL error");
        }

        const orders = json.data?.orders?.nodes || [];
        orders.forEach((order: any) => {
          if (order.customer?.id) {
            allOrders.push({
              id: order.id,
              customerId: order.customer.id,
              createdAt: order.createdAt,
            });
          }
        });

        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;

        // Safety break to prevent infinite loops (adjust based on your store size)
        if (allOrders.length > 10000) {
          break;
        }
      }

      return allOrders;
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

  /**
   * OPTIMIZATION: Process all orders in memory
   * Group orders by customer and sort by date
   */
  try {
    const allOrders = await fetchAllOrders();

    // Group orders by customer
    const customerOrders = new Map<string, Date[]>();
    allOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      if (!customerOrders.has(order.customerId)) {
        customerOrders.set(order.customerId, []);
      }
      customerOrders.get(order.customerId)!.push(orderDate);
    });

    // Sort each customer's orders by date
    for (const [customerId, orders] of customerOrders.entries()) {
      orders.sort((a, b) => a.getTime() - b.getTime());
    }

    // 1) Build dataPoints (for chart)
    for (const date of dates) {
      let returningCount = 0;

      // Count customers who have multiple orders up to this date
      for (const [customerId, orders] of customerOrders.entries()) {
        const ordersUpToDate = orders.filter((orderDate) => orderDate <= date);
        if (ordersUpToDate.length > 1) {
          returningCount++;
        }
      }

      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: returningCount,
      });
    }

    // 2) Final total count for whole dateRange
    // Count customers who placed orders in the range AND have orders before the range
    let finalReturningCustomers = 0;

    for (const [customerId, orders] of customerOrders.entries()) {
      // Check if customer has orders in the date range
      const ordersInRange = orders.filter(
        (orderDate) => orderDate >= startDate && orderDate <= endDate
      );

      if (ordersInRange.length > 0) {
        // Check if customer has orders before the range
        const ordersBeforeRange = orders.filter((orderDate) => orderDate < startDate);
        if (ordersBeforeRange.length > 0) {
          finalReturningCustomers++;
        }
      }
    }

    return {
      count: finalReturningCustomers,
      dataPoints,
    };
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }

    // Return default values on error
    return {
      count: 0,
      dataPoints: dates.map((date) => ({
        date: date.toISOString().split("T")[0],
        count: 0,
      })),
    };
  }
}