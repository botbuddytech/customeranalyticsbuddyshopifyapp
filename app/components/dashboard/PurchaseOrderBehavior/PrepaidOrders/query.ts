import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Prepaid Orders Query Logic
 *
 * Uses GraphQL queries to get:
 * - total prepaid orders in a date range (orders with PAID or PARTIALLY_REFUNDED status)
 * - data points for charting (today = 1 point, others = 2 points: start & end)
 */
export async function getPrepaidOrdersQuery(
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

  async function getPrepaidOrdersForRange(
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
      const prepaidOrders = orders.filter(
        (o: any) =>
          o.displayFinancialStatus === "PAID" ||
          o.displayFinancialStatus === "PARTIALLY_REFUNDED"
      ).length;

      return prepaidOrders;
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

  // Build dataPoints
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
      const prepaidOrders = orders.filter(
        (o: any) =>
          o.displayFinancialStatus === "PAID" ||
          o.displayFinancialStatus === "PARTIALLY_REFUNDED"
      ).length;

      const dateString = date.toISOString().split("T")[0];
      dataPoints.push({
        date: dateString,
        count: prepaidOrders,
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

  // Final total count
  let finalPrepaidOrders = 0;
  try {
    finalPrepaidOrders = await getPrepaidOrdersForRange(startDate, endDate);
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
    finalPrepaidOrders = 0;
  }

  return {
    count: finalPrepaidOrders,
    dataPoints,
  };
}

