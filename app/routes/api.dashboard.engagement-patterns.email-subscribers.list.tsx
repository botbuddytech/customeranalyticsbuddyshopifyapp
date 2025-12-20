import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * Calculate date range - EXACT same logic as in query.ts
 */
function calculateDateRange(dateRange: string): { startDate: Date; endDate: Date } {
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

  return { startDate, endDate };
}

/**
 * API Route for Email Subscribers List Data
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const { startDate, endDate } = calculateDateRange(dateRange);
    const rangeStartISO = startDate.toISOString();
    const rangeEndISO = endDate.toISOString();

    let allCustomers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    // Fetch customers created within the date range
    while (hasNextPage && allCustomers.length < 1000) {
      const customersQuery = cursor
        ? `
          query {
            customers(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                displayName
                email
                createdAt
                tags
                emailMarketingConsent {
                  marketingState
                  marketingOptInLevel
                  consentUpdatedAt
                }
                numberOfOrders
                amountSpent {
                  amount
                  currencyCode
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
                displayName
                email
                createdAt
                tags
                emailMarketingConsent {
                  marketingState
                  marketingOptInLevel
                  consentUpdatedAt
                }
                numberOfOrders
                amountSpent {
                  amount
                  currencyCode
                }
              }
            }
          }
        `;

      const response = await admin.graphql(customersQuery);
      const json: any = await response.json();

      if (json.errors && json.errors.length > 0) {
        const accessError = json.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected customer data") ||
            error.message?.includes("Customer")
        );
        if (accessError) {
          return Response.json(
            { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
            { status: 403 }
          );
        }
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const customers = json.data?.customers?.nodes || [];
      allCustomers = [...allCustomers, ...customers];

      hasNextPage = json.data?.customers?.pageInfo?.hasNextPage || false;
      cursor = json.data?.customers?.pageInfo?.endCursor || null;
    }

    // Filter to only include email subscribers
    const subscriberCustomers = allCustomers.filter((customer: any) => {
      if (!customer.id || !customer.email) return false;

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

      // If any email subscription indicator is found, include customer
      return hasEmailTag || hasEmailConsent;
    });

    const formattedCustomers = subscriberCustomers.map((customer) => ({
      id: customer.id,
      name: customer.displayName || "N/A",
      email: customer.email || "N/A",
      createdAt: customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : "N/A",
      numberOfOrders: customer.numberOfOrders || 0,
      totalSpent: customer.amountSpent
        ? `${parseFloat(customer.amountSpent.amount).toFixed(2)} ${customer.amountSpent.currencyCode}`
        : "0.00",
    }));

    return Response.json({
      customers: formattedCustomers,
      total: formattedCustomers.length,
    });
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      console.log(
        "[Email Subscribers List API] Protected customer data access denied",
      );
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }
    throw error;
  }
};

