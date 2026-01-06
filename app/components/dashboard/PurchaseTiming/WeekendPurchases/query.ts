import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Weekend Purchases Query Logic
 *
 * Gets orders placed on Saturday (6) or Sunday (0).
 * Returns count and data points for charting (today = 1 point, others = 2 points: start & end)
 */
export async function getWeekendPurchasesQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const dataPoints: Array<{ date: string; count: number }> = [];
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

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
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  const dates = dateRange === "today" ? [endDate] : [startDate, endDate];

  async function getWeekendPurchasesForRange(rangeStart: Date, rangeEnd: Date): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      let allOrders: any[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const query = cursor
          ? `query { orders(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") { pageInfo { hasNextPage endCursor } nodes { id createdAt } } }`
          : `query { orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") { pageInfo { hasNextPage endCursor } nodes { id createdAt } } }`;

        const response = await admin.graphql(query);
        const json = await response.json();

        if (json.errors?.length > 0) {
          const accessError = json.errors.find((e: any) => e.message?.includes("not approved") || e.message?.includes("protected") || e.message?.includes("Order"));
          if (accessError) throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
          throw new Error(json.errors[0].message || "Unknown GraphQL error");
        }

        allOrders = [...allOrders, ...(json.data?.orders?.nodes || [])];
        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;
      }

      return allOrders.filter((o: any) => {
        const day = new Date(o.createdAt).getUTCDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length;
    } catch (error: any) {
      if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" || error.message?.includes("not approved") || error.message?.includes("protected")) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
      }
      throw error;
    }
  }

  for (const date of dates) {
    const dateEndISO = date.toISOString();
    try {
      let allOrders: any[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const query = cursor
          ? `query { orders(first: 250, after: "${cursor}", query: "created_at:<='${dateEndISO}'") { pageInfo { hasNextPage endCursor } nodes { id createdAt } } }`
          : `query { orders(first: 250, query: "created_at:<='${dateEndISO}'") { pageInfo { hasNextPage endCursor } nodes { id createdAt } } }`;

        const response = await admin.graphql(query);
        const json = await response.json();

        if (json.errors?.length > 0) {
          const accessError = json.errors.find((e: any) => e.message?.includes("not approved") || e.message?.includes("protected") || e.message?.includes("Order"));
          if (accessError) throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
          throw new Error(json.errors[0].message || "Unknown GraphQL error");
        }

        allOrders = [...allOrders, ...(json.data?.orders?.nodes || [])];
        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;
      }

      const weekendPurchases = allOrders.filter((o: any) => {
        const day = new Date(o.createdAt).getUTCDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length;

      dataPoints.push({ date: date.toISOString().split("T")[0], count: weekendPurchases });
    } catch (error: any) {
      if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" || error.message?.includes("not approved") || error.message?.includes("protected")) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
      }
      dataPoints.push({ date: date.toISOString().split("T")[0], count: 0 });
    }
  }

  let finalCount = 0;
  try {
    finalCount = await getWeekendPurchasesForRange(startDate, endDate);
  } catch (error: any) {
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" || error.message?.includes("not approved") || error.message?.includes("protected")) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
  }

  return { count: finalCount, dataPoints };
}

