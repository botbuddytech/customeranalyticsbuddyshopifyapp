import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

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
    const discountCustomerIds = new Set<string>();

    // First, get all orders with discounts in the date range
    while (hasNextPage) {
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

      const response = await admin.graphql(ordersQuery);
      const json: any = await response.json();

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
      orders.forEach((order: any) => {
        const discountAmount = parseFloat(
          order.totalDiscountsSet?.shopMoney?.amount || "0"
        );
        if (discountAmount > 0 && order.customer?.id) {
          discountCustomerIds.add(order.customer.id);
        }
      });

      hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
      cursor = json.data?.orders?.pageInfo?.endCursor || null;
    }

    // Now fetch customer details for unique discount users
    const customerIdsArray = Array.from(discountCustomerIds);
    let customerCursor: string | null = null;
    let customersHasNextPage = true;

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
      const customersJson: any = await customersResponse.json();

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
      // Filter to only include discount users
      const discountCustomers = customers.filter((customer: any) =>
        discountCustomerIds.has(customer.id)
      );
      allCustomers = [...allCustomers, ...discountCustomers];

      customersHasNextPage = customersJson.data?.customers?.pageInfo?.hasNextPage || false;
      customerCursor = customersJson.data?.customers?.pageInfo?.endCursor || null;

      // If we've found all discount customers, break
      if (allCustomers.length >= discountCustomerIds.size) {
        break;
      }
    }

    // Filter to only the discount customers we found
    const filteredCustomers = allCustomers.filter((customer: any) =>
      discountCustomerIds.has(customer.id)
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
        "[Discount Users List API] Protected data access denied",
      );
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }
    throw error;
  }
};

