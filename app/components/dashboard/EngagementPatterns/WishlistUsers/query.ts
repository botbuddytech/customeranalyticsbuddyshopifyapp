import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Wishlist Users Query Logic
 *
 * Identifies customers who purchased items they saved to their wishlist within the date range.
 * 
 * NOTE: Shopify doesn't have native wishlist support. This implementation checks for:
 * - Orders with wishlist-related tags (e.g., "wishlist", "from-wishlist")
 * - Orders with wishlist-related notes or custom attributes
 * - Orders with line items that match wishlist patterns
 * 
 * If your store uses a wishlist app, you may need to integrate with that app's API.
 */
export async function getWishlistUsersQuery(
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

  // Helper function to get wishlist users count for a date range
  async function getWishlistUsersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
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
                  tags
                  note
                  customAttributes {
                    key
                    value
                  }
                  customer {
                    id
                  }
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
                  tags
                  note
                  customAttributes {
                    key
                    value
                  }
                  customer {
                    id
                  }
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
        allOrders = [...allOrders, ...orders];

        hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
        cursor = json.data?.orders?.pageInfo?.endCursor || null;
      }

      // Get unique customers who purchased from wishlist
      // Check for wishlist indicators: tags, notes, or custom attributes
      const wishlistCustomerIds = new Set<string>();
      allOrders.forEach((order: any) => {
        if (!order.customer?.id) return;

        // Check tags for wishlist indicators
        const tags = order.tags || [];
        const hasWishlistTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("wishlist") ||
          tag.toLowerCase().includes("from-wishlist") ||
          tag.toLowerCase().includes("wishlist-purchase")
        );

        // Check note for wishlist indicators
        const note = order.note || "";
        const hasWishlistNote = note.toLowerCase().includes("wishlist");

        // Check custom attributes for wishlist indicators
        const customAttributes = order.customAttributes || [];
        const hasWishlistAttribute = customAttributes.some(
          (attr: any) =>
            attr.key?.toLowerCase().includes("wishlist") ||
            attr.value?.toLowerCase().includes("wishlist")
        );

        // If any wishlist indicator is found, add customer
        if (hasWishlistTag || hasWishlistNote || hasWishlistAttribute) {
          wishlistCustomerIds.add(order.customer.id);
        }
      });

      return wishlistCustomerIds.size;
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
  // For "today": 1 point (today only)
  // For other ranges: 2 points (start date and end date)
  // - Start point: Wishlist users on that specific day
  // - End point: Wishlist users in the full range (startDate to endDate)
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    try {
      if (dateRange === "today") {
        // For "today", get wishlist users for today only
        const count = await getWishlistUsersForRange(date, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      } else if (i === 0) {
        // First date point is the start date - get wishlist users on that specific day
        const count = await getWishlistUsersForRange(date, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      } else {
        // Second date point is the end date - get wishlist users in the full range (startDate to endDate)
        const count = await getWishlistUsersForRange(startDate, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      }
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

  // Calculate total count: Unique customers who purchased from wishlist WITHIN the date range
  const totalCount = await getWishlistUsersForRange(startDate, endDate);

  return {
    count: totalCount,
    dataPoints,
  };
}

