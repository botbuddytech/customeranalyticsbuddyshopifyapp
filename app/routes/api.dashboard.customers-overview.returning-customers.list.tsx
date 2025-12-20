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
 * API Route for Returning Customers List Data
 *
 * Fetches returning customers (customers who placed orders in the date range AND have placed orders before)
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

    // Step 1: Get all orders in the date range (same as query.ts line 91-120)
    let allOrdersInRange: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allOrdersInRange.length < 1000) {
      const ordersQuery = cursor
        ? `
          query ReturningCustomersOrders {
            orders(first: 250, after: "${cursor}", query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                customer {
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
                createdAt
              }
            }
          }
        `
        : `
          query ReturningCustomersOrders {
            orders(first: 250, query: "created_at:>='${rangeStartISO}' created_at:<='${rangeEndISO}'") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                customer {
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
                createdAt
              }
            }
          }
        `;

      const ordersResponse = await admin.graphql(ordersQuery);
      const ordersJson: any = await ordersResponse.json();

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
        throw new Error(ordersJson.errors[0].message || "Unknown GraphQL error");
      }

      const orders = ordersJson.data?.orders?.nodes || [];
      allOrdersInRange = [...allOrdersInRange, ...orders];

      hasNextPage = ordersJson.data?.orders?.pageInfo?.hasNextPage || false;
      cursor = ordersJson.data?.orders?.pageInfo?.endCursor || null;
    }

    // Step 2: Get unique customer IDs from orders in this range (same as query.ts line 122-128)
    const customerIds = new Set<string>();
    const customerMap = new Map<string, any>(); // Store customer data

    allOrdersInRange.forEach((order: any) => {
      if (order.customer?.id) {
        const customerId = order.customer.id;
        customerIds.add(customerId);
        // Store customer data (use the first occurrence)
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, order.customer);
        }
      }
    });

    if (customerIds.size === 0) {
      return Response.json({
        customers: [],
        total: 0,
      });
    }

    // Step 3: For each customer, check if they have orders before the range start (same as query.ts line 139-167)
    const returningCustomers: any[] = [];
    const customerIdArray = Array.from(customerIds);

    for (const customerId of customerIdArray) {
      try {
        // Check if this customer has orders before the range start
        const previousOrdersResponse = await admin.graphql(`
          query PreviousOrders {
            orders(first: 1, query: "customer_id:${customerId} created_at:<'${rangeStartISO}'") {
              nodes {
                id
              }
            }
          }
        `);

        const previousOrdersJson: any = await previousOrdersResponse.json();

        if (previousOrdersJson.errors && previousOrdersJson.errors.length > 0) {
          // Skip this customer if we can't check their previous orders
          continue;
        }

        const previousOrders = previousOrdersJson.data?.orders?.nodes || [];
        if (previousOrders.length > 0) {
          // This is a returning customer - add to the list
          const customerData = customerMap.get(customerId);
          if (customerData) {
            returningCustomers.push(customerData);
          }
        }
      } catch (error: any) {
        // Skip this customer if there's an error
        continue;
      }
    }

    // Format customer data for table
    const formattedCustomers = returningCustomers.map((customer) => ({
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
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
      console.log(
        "[Returning Customers List API] Protected order data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: "PROTECTED_ORDER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

