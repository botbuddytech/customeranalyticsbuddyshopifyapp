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
 * API Route for Reviewers List Data
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const { startDate, endDate } = calculateDateRange(dateRange);
    const rangeStartISO = startDate.toISOString();
    const rangeEndISO = endDate.toISOString();

    let allOrders: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    const reviewerCustomerIds = new Set<string>();

    // First, get all orders with review indicators in the date range
    while (hasNextPage && allOrders.length < 1000) {
      const ordersQuery = cursor
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

      const response = await admin.graphql(ordersQuery);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        const accessError = json.errors.find(
          (error: any) =>
            error.message?.includes("not approved") ||
            error.message?.includes("protected") ||
            error.message?.includes("Order")
        );
        if (accessError) {
          return Response.json(
            { error: "PROTECTED_ORDER_DATA_ACCESS_DENIED" },
            { status: 403 }
          );
        }
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const orders = json.data?.orders?.nodes || [];
      
      // Filter for review orders and collect customer IDs
      orders.forEach((order: any) => {
        if (!order.customer?.id) return;

        // Check tags for review indicators
        const tags = order.tags || [];
        const hasReviewTag = tags.some((tag: string) =>
          tag.toLowerCase().includes("review") ||
          tag.toLowerCase().includes("reviewed") ||
          tag.toLowerCase().includes("has-review") ||
          tag.toLowerCase().includes("review-submitted")
        );

        // Check note for review indicators
        const note = order.note || "";
        const hasReviewNote = note.toLowerCase().includes("review");

        // Check custom attributes for review indicators
        const customAttributes = order.customAttributes || [];
        const hasReviewAttribute = customAttributes.some(
          (attr: any) =>
            attr.key?.toLowerCase().includes("review") ||
            attr.value?.toLowerCase().includes("review")
        );

        // If any review indicator is found, add customer
        if (hasReviewTag || hasReviewNote || hasReviewAttribute) {
          reviewerCustomerIds.add(order.customer.id);
        }
      });

      allOrders = [...allOrders, ...orders];
      hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
      cursor = json.data?.orders?.pageInfo?.endCursor || null;
    }

    // Now fetch customer details for unique reviewers
    const customerIdsArray = Array.from(reviewerCustomerIds);
    let customerCursor: string | null = null;
    let customersHasNextPage = true;
    let allCustomers: any[] = [];

    while (customersHasNextPage && allCustomers.length < 1000) {
      const customersQuery = customerCursor
        ? `
          query {
            customers(first: 250, after: "${customerCursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                displayName
                email
                createdAt
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
            customers(first: 250) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                displayName
                email
                createdAt
                numberOfOrders
                amountSpent {
                  amount
                  currencyCode
                }
              }
            }
          }
        `;

      const customersResponse = await admin.graphql(customersQuery);
      const customersJson = await customersResponse.json();

      if (customersJson.errors && customersJson.errors.length > 0) {
        const accessError = customersJson.errors.find(
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
        throw new Error(customersJson.errors[0].message || "Unknown GraphQL error");
      }

      const customers = customersJson.data?.customers?.nodes || [];
      // Filter to only include reviewers
      const reviewerCustomers = customers.filter((customer: any) =>
        reviewerCustomerIds.has(customer.id)
      );
      allCustomers = [...allCustomers, ...reviewerCustomers];

      customersHasNextPage = customersJson.data?.customers?.pageInfo?.hasNextPage || false;
      customerCursor = customersJson.data?.customers?.pageInfo?.endCursor || null;

      // If we've found all reviewers, break
      if (allCustomers.length >= reviewerCustomerIds.size) {
        break;
      }
    }

    // Filter to only the reviewers we found
    const filteredCustomers = allCustomers.filter((customer: any) =>
      reviewerCustomerIds.has(customer.id)
    );

    const formattedCustomers = filteredCustomers.map((customer) => ({
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
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED"
    ) {
      console.log(
        "[Reviewers List API] Protected data access denied",
      );
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }
    throw error;
  }
};

