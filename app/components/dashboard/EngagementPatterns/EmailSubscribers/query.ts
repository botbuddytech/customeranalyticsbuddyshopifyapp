import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Email Subscribers Query Logic
 *
 * Identifies customers who subscribed with email while creating their account within the date range.
 * 
 * Checks for email subscription indicators:
 * - Customer tags (e.g., "email-subscriber", "newsletter", "subscribed")
 * - emailMarketingConsent field (if available in API)
 * - Customer metafields or custom attributes
 */
export async function getEmailSubscribersQuery(
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

  // Helper function to get email subscribers count for a date range
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
      // Check for email subscription indicators: tags, emailMarketingConsent
      const subscriberCustomerIds = new Set<string>();
      allCustomers.forEach((customer: any) => {
        if (!customer.id || !customer.email) return;

        // Check tags for email subscription indicators
        const tags = customer.tags || [];
        const hasEmailTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("email-subscriber") ||
          tag.toLowerCase().includes("newsletter") ||
          tag.toLowerCase().includes("subscribed") ||
          tag.toLowerCase().includes("email-subscription")
        );

        // Check emailMarketingConsent for subscription
        const emailConsent = customer.emailMarketingConsent;
        const hasEmailConsent = emailConsent && (
          emailConsent.marketingState === "SUBSCRIBED" ||
          emailConsent.marketingOptInLevel === "SINGLE_OPT_IN" ||
          emailConsent.marketingOptInLevel === "CONFIRMED_OPT_IN" ||
          emailConsent.marketingOptInLevel === "UNKNOWN"
        );

        // If any email subscription indicator is found, add customer
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

  // Build dataPoints (for chart)
  // For "today": 1 point (today only)
  // For other ranges: 2 points (start date and end date)
  // - Start point: Email subscribers on that specific day
  // - End point: Email subscribers in the full range (startDate to endDate)
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    try {
      if (dateRange === "today") {
        // For "today", get email subscribers for today only
        const count = await getEmailSubscribersForRange(date, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      } else if (i === 0) {
        // First date point is the start date - get email subscribers on that specific day
        const count = await getEmailSubscribersForRange(date, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      } else {
        // Second date point is the end date - get email subscribers in the full range (startDate to endDate)
        const count = await getEmailSubscribersForRange(startDate, date);
        const dateString = date.toISOString().split("T")[0];
        dataPoints.push({
          date: dateString,
          count,
        });
      }
    } catch (error: any) {
      if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
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

  // Calculate total count: Unique customers who subscribed to email WITHIN the date range
  const totalCount = await getEmailSubscribersForRange(startDate, endDate);

  return {
    count: totalCount,
    dataPoints,
  };
}

