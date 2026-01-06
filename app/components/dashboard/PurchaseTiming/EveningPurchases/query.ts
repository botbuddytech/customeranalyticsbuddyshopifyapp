import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Evening Purchases Query Logic
 *
 * Gets orders placed between 6 PM - 12 AM (evening hours: 18:00 - 23:59).
 * Returns count and data points for charting (today = 1 point, others = 2 points: start & end)
 *
 * NOTE:
 * - Requires `read_orders` scope.
 * - If your app isn't approved for protected order data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getEveningPurchasesQuery(
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

  async function getEveningPurchasesForRange(rangeStart: Date, rangeEnd: Date): Promise<number> {
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

      // Filter orders placed between 6 PM - 12 AM (evening hours: 18:00 - 23:59)
      return allOrders.filter((o: any) => {
        const hour = new Date(o.createdAt).getUTCHours();
        return hour >= 18 && hour < 24;
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

      // Filter orders placed between 6 PM - 12 AM (evening hours: 18:00 - 23:59)
      const eveningPurchases = allOrders.filter((o: any) => {
        const hour = new Date(o.createdAt).getUTCHours();
        return hour >= 18 && hour < 24;
      }).length;

      dataPoints.push({ date: date.toISOString().split("T")[0], count: eveningPurchases });
    } catch (error: any) {
      if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" || error.message?.includes("not approved") || error.message?.includes("protected")) {
        throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
      }
      dataPoints.push({ date: date.toISOString().split("T")[0], count: 0 });
    }
  }

  let finalCount = 0;
  try {
    finalCount = await getEveningPurchasesForRange(startDate, endDate);
  } catch (error: any) {
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" || error.message?.includes("not approved") || error.message?.includes("protected")) {
      throw new Error("PROTECTED_ORDER_DATA_ACCESS_DENIED");
    }
  }

  return { count: finalCount, dataPoints };
}

