/**
 * API Route for Fetching Customer Details
 * 
 * Fetches customer details from Shopify using saved customer IDs from the database
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getSavedListById } from "../services/saved-lists.server";
import type { AdminGraphQL } from "../services/dashboard.server";

/**
 * Action function to fetch customer details by list ID
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const listId = formData.get("listId");

    if (!listId || typeof listId !== "string") {
      return Response.json(
        { error: "List ID is required" },
        { status: 400 }
      );
    }

    // Get the saved list
    const savedList = await getSavedListById(shop, listId);

    if (!savedList) {
      return Response.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Use saved customer IDs to fetch customer details directly
    // This is more efficient than re-running the query
    if (!savedList.customerIds || savedList.customerIds.length === 0) {
      return Response.json({
        success: true,
        customers: [],
        total: 0,
      });
    }

    // Fetch customers by their IDs
    const customers = await fetchCustomersByIds(admin, savedList.customerIds);

    return Response.json({
      success: true,
      customers,
      total: customers.length,
    });
  } catch (error: any) {
    console.error("[Get Customers API] Error:", error);
    
    if (
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected customer data")
    ) {
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }

    return Response.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
};

/**
 * Fetch customers from Shopify by their IDs
 * Uses the saved customer IDs from the database
 */
async function fetchCustomersByIds(
  admin: AdminGraphQL,
  customerIds: string[]
): Promise<Array<{
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
}>> {
  const customers: any[] = [];

  // Fetch customers in batches to avoid rate limits
  const batchSize = 10;
  
  for (let i = 0; i < customerIds.length; i += batchSize) {
    const batch = customerIds.slice(i, i + batchSize);
    
    // Fetch each customer in the batch
    const customerPromises = batch.map(async (customerId) => {
      try {
        // Ensure the ID is in the correct format (gid://shopify/Customer/...)
        const formattedId = customerId.startsWith("gid://")
          ? customerId
          : `gid://shopify/Customer/${customerId}`;

        const query = `
          query {
            customer(id: "${formattedId}") {
              id
              displayName
              email
              createdAt
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              defaultAddress {
                country
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
          // Skip this customer if there's an error (might be deleted)
          return null;
        }

        const customer = json.data?.customer;
        if (customer) {
          return {
            id: customer.id,
            name: customer.displayName || "N/A",
            email: customer.email || "N/A",
            country: customer.defaultAddress?.country || "Unknown",
            createdAt: customer.createdAt
              ? new Date(customer.createdAt).toLocaleDateString()
              : "N/A",
            numberOfOrders: customer.numberOfOrders || 0,
            totalSpent: customer.amountSpent
              ? `${parseFloat(customer.amountSpent.amount).toFixed(2)} ${customer.amountSpent.currencyCode}`
              : "0.00",
          };
        }
        return null;
      } catch (error: any) {
        if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
          throw error;
        }
        // Skip this customer if there's an error (might be deleted)
        console.error(`[Get Customers] Error fetching customer ${customerId}:`, error);
        return null;
      }
    });

    // Wait for batch to complete
    try {
      const batchResults = await Promise.all(customerPromises);
      const validCustomers = batchResults.filter((c) => c !== null);
      customers.push(...validCustomers);
    } catch (error: any) {
      if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        throw error;
      }
      // Continue with next batch if there's an error
      console.error(`[Get Customers] Error in batch ${i}:`, error);
    }
  }

  return customers;
}


