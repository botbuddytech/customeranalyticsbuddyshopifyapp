import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * Calculate date range - EXACT same logic as in query.ts
 * This ensures the modal uses the same date filtering as the count query
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
 * API Route for Inactive Customers List Data
 *
 * Fetches inactive customers (customers who exist but did NOT place orders in the date range)
 * Uses the EXACT same logic as query.ts to ensure consistency
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    // Use the EXACT same date calculation as query.ts
    const { startDate, endDate } = calculateDateRange(dateRange);
    const rangeStartISO = startDate.toISOString();
    const rangeEndISO = endDate.toISOString();

    // Step 1: Get all customers (same as query.ts line 95-117)
    let allCustomers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allCustomers.length < 1000) {
      // Limit to 1000 customers max for performance
      const customersQuery = cursor
        ? `
          query {
            customers(first: 250, after: "${cursor}") {
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
      allCustomers = [...allCustomers, ...customers];

      hasNextPage = customersJson.data?.customers?.pageInfo?.hasNextPage || false;
      cursor = customersJson.data?.customers?.pageInfo?.endCursor || null;
    }

    // Step 2: Get unique customers who placed orders in the date range (active customers)
    // Same logic as query.ts line 120-158
    let activeCustomerIds = new Set<string>();
    let ordersHasNextPage = true;
    let ordersCursor: string | null = null;

    while (ordersHasNextPage) {
      const ordersQuery = ordersCursor
        ? `
          query ActiveCustomersOrders {
            orders(first: 250, after: "${ordersCursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                customer {
                  id
                }
              }
            }
          }
        `
        : `
          query ActiveCustomersOrders {
            orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                customer {
                  id
                }
              }
            }
          }
        `;

      const ordersResponse = await admin.graphql(ordersQuery);
      const ordersJson = await ordersResponse.json();

      if (ordersJson.errors && ordersJson.errors.length > 0) {
        const accessError = ordersJson.errors.find(
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
        // If we can't access orders, we can't determine active customers
        // Return empty list
        break;
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      orders.forEach((order: any) => {
        if (order.customer?.id) {
          activeCustomerIds.add(order.customer.id);
        }
      });

      ordersHasNextPage = ordersJson.data?.orders?.pageInfo?.hasNextPage || false;
      ordersCursor = ordersJson.data?.orders?.pageInfo?.endCursor || null;
    }

    // Step 3: Filter out active customers to get inactive customers
    // Inactive customers = All customers - Active customers (who placed orders in the period)
    const inactiveCustomers = allCustomers.filter(
      (customer) => !activeCustomerIds.has(customer.id)
    );

    // Format customer data for table
    const formattedCustomers = inactiveCustomers.map((customer) => ({
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
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED"
    ) {
      console.log(
        "[Inactive Customers List API] Protected data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }
    throw error;
  }
};

