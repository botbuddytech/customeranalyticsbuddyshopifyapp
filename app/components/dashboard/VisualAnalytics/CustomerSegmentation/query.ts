import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Customer Segmentation Query Logic
 *
 * Gets order type distribution for pie chart:
 * - COD Orders
 * - Prepaid Orders
 * - Cancelled Orders
 * - Abandoned Carts
 *
 * NOTE:
 * - Requires `read_orders` scope.
 * - If your app isn't approved for protected order data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getCustomerSegmentationQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
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

  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  // Helper function to get all orders for a date range
  async function getAllOrdersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<any[]> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      let allOrders: any[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const query = cursor
          ? `
            query {
              orders(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  displayFinancialStatus
                  cancelledAt
                  paymentGatewayNames
                }
              }
            }
          `
          : `
            query {
              orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  displayFinancialStatus
                  cancelledAt
                  paymentGatewayNames
                }
              }
            }
          `;

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
        allOrders = allOrders.concat(orders);

        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;
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

  // Helper function to get abandoned checkouts
  async function getAbandonedCheckoutsForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      let allCheckouts: any[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const query = cursor
          ? `
            query {
              checkouts(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  paymentGatewayNames
                  completedAt
                }
              }
            }
          `
          : `
            query {
              checkouts(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  paymentGatewayNames
                  completedAt
                }
              }
            }
          `;

        const response = await admin.graphql(query);
        const json = await response.json();

        if (json.errors && json.errors.length > 0) {
          // Checkouts might not be available, return 0
          return 0;
        }

        const checkouts = json.data?.checkouts?.nodes || [];
        allCheckouts = allCheckouts.concat(checkouts);

        hasNextPage = json.data?.checkouts?.pageInfo?.hasNextPage || false;
        cursor = json.data?.checkouts?.pageInfo?.endCursor || null;
      }

      // Filter abandoned carts (checkouts with payment gateway but no completion)
      const abandonedCarts = allCheckouts.filter(
        (checkout: any) =>
          checkout.paymentGatewayNames &&
          checkout.paymentGatewayNames.length > 0 &&
          !checkout.completedAt
      );

      return abandonedCarts.length;
    } catch (error: any) {
      // If checkouts are not available, return 0
      return 0;
    }
  }

  try {
    // Fetch all orders in the date range
    const allOrders = await getAllOrdersForRange(startDate, endDate);

    // Count COD orders (PENDING, PARTIALLY_PAID, or AUTHORIZED status)
    const codOrders = allOrders.filter(
      (o: any) =>
        o.displayFinancialStatus === "PENDING" ||
        o.displayFinancialStatus === "PARTIALLY_PAID" ||
        o.displayFinancialStatus === "AUTHORIZED"
    ).length;

    // Count prepaid orders (PAID or PARTIALLY_REFUNDED status)
    const prepaidOrders = allOrders.filter(
      (o: any) =>
        o.displayFinancialStatus === "PAID" ||
        o.displayFinancialStatus === "PARTIALLY_REFUNDED"
    ).length;

    // Count cancelled orders
    const cancelledOrders = allOrders.filter(
      (o: any) => o.cancelledAt !== null
    ).length;

    // Get abandoned carts count
    const abandonedCarts = await getAbandonedCheckoutsForRange(startDate, endDate);

    return {
      codOrders,
      prepaidOrders,
      cancelledOrders,
      abandonedCarts,
    };
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
    console.error(
      "[Customer Segmentation Query] Error fetching data:",
      error.message || error
    );
    // Return default values on error
    return {
      codOrders: 0,
      prepaidOrders: 0,
      cancelledOrders: 0,
      abandonedCarts: 0,
    };
  }
}

