import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Behavioral Breakdown Query Logic
 *
 * Gets engagement metrics for bar chart:
 * - Discount Users
 * - Wishlist Users
 * - Reviewers
 * - Email Subscribers
 *
 * NOTE:
 * - Requires `read_orders` and `read_customers` scopes.
 * - If your app isn't approved for protected data,
 *   Shopify will return an error and we'll return default values.
 */
export async function getBehavioralBreakdownQuery(
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

  // Helper function to get discount users count (using same logic as DiscountUsers query)
  async function getDiscountUsersForRange(
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
                  totalDiscountsSet {
                    shopMoney {
                      amount
                    }
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
                  totalDiscountsSet {
                    shopMoney {
                      amount
                    }
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

      // Get unique customers who used discounts
      const discountCustomerIds = new Set<string>();
      allOrders.forEach((order: any) => {
        const discountAmount = parseFloat(
          order.totalDiscountsSet?.shopMoney?.amount || "0"
        );
        if (discountAmount > 0 && order.customer?.id) {
          discountCustomerIds.add(order.customer.id);
        }
      });

      return discountCustomerIds.size;
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

  // Helper function to get wishlist users count (using same logic as WishlistUsers query)
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
      const wishlistCustomerIds = new Set<string>();
      allOrders.forEach((order: any) => {
        if (!order.customer?.id) return;

        const tags = order.tags || [];
        const hasWishlistTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("wishlist") ||
          tag.toLowerCase().includes("from-wishlist") ||
          tag.toLowerCase().includes("wishlist-purchase")
        );

        const note = order.note || "";
        const hasWishlistNote = note.toLowerCase().includes("wishlist");

        const customAttributes = order.customAttributes || [];
        const hasWishlistAttribute = customAttributes.some(
          (attr: any) =>
            attr.key?.toLowerCase().includes("wishlist") ||
            attr.value?.toLowerCase().includes("wishlist")
        );

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

  // Helper function to get reviewers count (using same logic as Reviewers query)
  async function getReviewersForRange(
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

      // Get unique customers who submitted reviews
      const reviewerCustomerIds = new Set<string>();
      allOrders.forEach((order: any) => {
        if (!order.customer?.id) return;

        const tags = order.tags || [];
        const hasReviewTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("review") ||
          tag.toLowerCase().includes("reviewed") ||
          tag.toLowerCase().includes("has-review") ||
          tag.toLowerCase().includes("review-submitted")
        );

        const note = order.note || "";
        const hasReviewNote = note.toLowerCase().includes("review");

        const customAttributes = order.customAttributes || [];
        const hasReviewAttribute = customAttributes.some(
          (attr: any) =>
            attr.key?.toLowerCase().includes("review") ||
            attr.value?.toLowerCase().includes("review")
        );

        if (hasReviewTag || hasReviewNote || hasReviewAttribute) {
          reviewerCustomerIds.add(order.customer.id);
        }
      });

      return reviewerCustomerIds.size;
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

  // Helper function to get email subscribers count (using same logic as EmailSubscribers query)
  async function getEmailSubscribersForRange(
    rangeStart: Date,
    rangeEnd: Date
  ): Promise<number> {
    const rangeStartISO = rangeStart.toISOString();
    const rangeEndISO = rangeEnd.toISOString();

    try {
      let allCustomers: any[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const query = cursor
          ? `
            query {
              customers(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  email
                  tags
                  emailMarketingConsent {
                    marketingState
                    marketingOptInLevel
                    consentUpdatedAt
                  }
                }
              }
            }
          `
          : `
            query {
              customers(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  email
                  tags
                  emailMarketingConsent {
                    marketingState
                    marketingOptInLevel
                    consentUpdatedAt
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
              error.message?.includes("protected customer data") ||
              error.message?.includes("Customer")
          );
          if (accessError) {
            throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
          }
          throw new Error(json.errors[0].message || "Unknown GraphQL error");
        }

        const customers = json.data?.customers?.nodes || [];
        allCustomers = [...allCustomers, ...customers];

        hasNextPage = json.data?.customers?.pageInfo?.hasNextPage || false;
        cursor = json.data?.customers?.pageInfo?.endCursor || null;
      }

      // Get unique customers who subscribed to email
      const subscriberCustomerIds = new Set<string>();
      allCustomers.forEach((customer: any) => {
        if (!customer.id || !customer.email) return;

        const tags = customer.tags || [];
        const hasEmailTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("email-subscriber") ||
          tag.toLowerCase().includes("newsletter") ||
          tag.toLowerCase().includes("subscribed") ||
          tag.toLowerCase().includes("email-subscription")
        );

        const emailConsent = customer.emailMarketingConsent;
        const hasEmailConsent = emailConsent && (
          emailConsent.marketingState === "SUBSCRIBED" ||
          emailConsent.marketingOptInLevel === "SINGLE_OPT_IN" ||
          emailConsent.marketingOptInLevel === "CONFIRMED_OPT_IN" ||
          emailConsent.marketingOptInLevel === "UNKNOWN"
        );

        if (hasEmailTag || hasEmailConsent) {
          subscriberCustomerIds.add(customer.id);
        }
      });

      return subscriberCustomerIds.size;
    } catch (error: any) {
      if (
        error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected customer data")
      ) {
        throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
      }
      throw error;
    }
  }

  try {
    // Fetch all metrics in parallel
    const [discountUsers, wishlistUsers, reviewers, emailSubscribers] = await Promise.all([
      getDiscountUsersForRange(startDate, endDate),
      getWishlistUsersForRange(startDate, endDate),
      getReviewersForRange(startDate, endDate),
      getEmailSubscribersForRange(startDate, endDate),
    ]);

    return {
      discountUsers,
      wishlistUsers,
      reviewers,
      emailSubscribers,
    };
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected")
    ) {
      throw error;
    }
    console.error(
      "[Behavioral Breakdown Query] Error fetching data:",
      error.message || error
    );
    // Return default values on error
    return {
      discountUsers: 0,
      wishlistUsers: 0,
      reviewers: 0,
      emailSubscribers: 0,
    };
  }
}

