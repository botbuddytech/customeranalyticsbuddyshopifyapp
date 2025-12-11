import type { AdminGraphQL } from "../../../../services/dashboard.server";
import { calculateDateRange } from "../../../../services/dashboard.server";

/**
 * COD Orders Query Logic
 *
 * Uses GraphQL queries to get:
 * - total COD orders in a date range (orders with PENDING, PARTIALLY_PAID, or AUTHORIZED status)
 * - data points for charting (today = 1 point, others = 2 points: start & end)
 *
 * NOTE:
 * - Requires `read_orders` scope.
 * - If your app isn't approved for protected order data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getCODOrdersQuery(
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

  // Helper function to get COD orders count for a date range
  async function getCODOrdersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      const response = await admin.graphql(`
        query {
          orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
            nodes {
              id
              displayFinancialStatus
            }
          }
        }
      `);

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
      const codOrders = orders.filter(
        (o: any) =>
          o.displayFinancialStatus === "PENDING" ||
          o.displayFinancialStatus === "PARTIALLY_PAID" ||
          o.displayFinancialStatus === "AUTHORIZED"
      ).length;

      return codOrders;
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
    const dateEndISO = date.toISOString();

    try {
      const response = await admin.graphql(`
        query {
          orders(first: 250, query: "created_at:<='${dateEndISO}'") {
            nodes {
              id
              displayFinancialStatus
            }
          }
        }
      `);

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
      const codOrders = orders.filter(
        (o: any) =>
          o.displayFinancialStatus === "PENDING" ||
          o.displayFinancialStatus === "PARTIALLY_PAID" ||
          o.displayFinancialStatus === "AUTHORIZED"
      ).length;

      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: codOrders,
      });
    } catch (error: any) {
      if (
        error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected")
      ) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
      }
      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: 0,
      });
    }
  }

  // Final total count for whole dateRange
  let finalCODOrders = 0;
  try {
    finalCODOrders = await getCODOrdersForRange(startDate, endDate);
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
    finalCODOrders = 0;
  }

  return {
    count: finalCODOrders,
    dataPoints,
  };
}

