import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Abandoned Carts Query Logic
 *
 * Identifies orders that reached the payment page but didn't complete.
 * These are orders with financial status indicating they reached payment but were abandoned:
 * - PENDING: Payment is pending
 * - AUTHORIZED: Payment was authorized but not captured/completed
 * - PARTIALLY_PAID: Partial payment but not completed
 *
 * NOTE: This requires order data access permissions.
 */
export async function getAbandonedCartsQuery(
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

  // Helper function to get abandoned carts count for a date range
  async function getAbandonedCartsForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      let allAbandonedCarts: any[] = [];
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
        
        // Filter for abandoned carts: orders that reached payment page but didn't complete
        // These are orders that:
        // 1. Have PENDING, AUTHORIZED, or PARTIALLY_PAID status (reached payment but not completed)
        // 2. Have payment gateway information (indicating they reached the payment page)
        // 3. Are not cancelled (cancelled orders are tracked separately in CancelledOrders)
        // This represents orders where customer went to payment page but abandoned/cancelled
        const abandonedCarts = orders.filter(
          (o: any) =>
            (o.displayFinancialStatus === "PENDING" ||
              o.displayFinancialStatus === "AUTHORIZED" ||
              o.displayFinancialStatus === "PARTIALLY_PAID") &&
            !o.cancelledAt && // Exclude cancelled orders
            o.paymentGatewayNames && // Must have payment gateway info (reached payment page)
            o.paymentGatewayNames.length > 0 // Confirms they reached payment gateway
        );

        allAbandonedCarts = [...allAbandonedCarts, ...abandonedCarts];

        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;
      }

      return allAbandonedCarts.length;
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

  // Build dataPoints (for chart)
  for (const date of dates) {
    if (!date) {
      // Skip if date is undefined
      continue;
    }
    try {
      const count = await getAbandonedCartsForRange(date, date);
      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count,
      });
    } catch (error: any) {
      if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
        throw error;
      }
      // On error, push 0 for this date point
      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: 0,
      });
    }
  }

  // Calculate total count (use end date count as the main count)
  const totalCount = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].count : 0;

  return {
    count: totalCount,
    dataPoints,
  };
}

