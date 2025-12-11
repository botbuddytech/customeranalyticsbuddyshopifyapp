import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import type { AdminGraphQL } from "../services/dashboard.server";

/**
 * API Route for Total Customers List Data
 *
 * Fetches customer list with details for the selected date range
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
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

    // For total customers, we want all customers created up to the end date
    const endDateISO = endDate.toISOString();

    // Fetch customers with pagination
    let allCustomers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allCustomers.length < 1000) {
      // Limit to 1000 customers max for performance
      const query = cursor
        ? `
          query {
            customers(first: 250, after: "${cursor}", query: "created_at:<='${endDateISO}'") {
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
                totalSpent {
                  amount
                  currencyCode
                }
              }
            }
          }
        `
        : `
          query {
            customers(first: 250, query: "created_at:<='${endDateISO}'") {
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
                totalSpent {
                  amount
                  currencyCode
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

    // Format customer data for table
    const formattedCustomers = allCustomers.map((customer) => ({
      id: customer.id,
      name: customer.displayName || "N/A",
      email: customer.email || "N/A",
      createdAt: customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : "N/A",
      numberOfOrders: customer.numberOfOrders || 0,
      totalSpent: customer.totalSpent
        ? `${parseFloat(customer.totalSpent.amount).toFixed(2)} ${customer.totalSpent.currencyCode}`
        : "0.00",
    }));

    return Response.json({
      customers: formattedCustomers,
      total: formattedCustomers.length,
    });
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      console.log(
        "[Total Customers List API] Protected customer data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

