/**
 * Filter Audience Query Logic
 * 
 * Main query function that uses the modular query compiler system.
 * 
 * This file orchestrates the query building and filtering process:
 * 1. Uses queryCompiler to build the final GraphQL query
 * 2. Fetches customers from Shopify
 * 3. Applies all filters using the compiler's filter functions
 * 4. Returns formatted results
 */

import type { AdminGraphQL } from "../../services/dashboard.server";
import type { FilterData } from "./types";
import {
  buildCustomerQuery,
  applyAllFilters,
  formatCustomerData,
} from "./queries/queryCompiler";

export interface FilteredCustomer {
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
}

export interface FilterCustomersResult {
  customers: FilteredCustomer[];
  total: number;
  error?: string;
}

/**
 * Filter customers based on all active filters
 * 
 * This is the main entry point that:
 * 1. Builds the optimized GraphQL query using all active filters
 * 2. Fetches customers from Shopify with pagination
 * 3. Applies all filters to the fetched customers
 * 4. Returns formatted results
 */
export async function filterCustomers(
  admin: AdminGraphQL,
  filters: FilterData
): Promise<FilterCustomersResult> {
  try {
    // Check if any filters are active
    const hasActiveFilters = (() => {
      // Check array-based filters
      const hasArrayFilters = Object.entries(filters).some(([key, value]) => {
        if (key === "amountSpent" || key === "customerCreatedFrom" || key === "graphqlQuery") {
          return false; // Skip these, check separately
        }
        return value != null && Array.isArray(value) && value.length > 0;
      });
      
      // Check amountSpent filter
      const hasAmountSpentFilter = filters.amountSpent != null &&
        filters.amountSpent.amount != null &&
        filters.amountSpent.operator != null;
      
      // Check customerCreatedFrom filter
      const hasCustomerCreatedFromFilter = filters.customerCreatedFrom != null &&
        filters.customerCreatedFrom.trim() !== "";
      
      return hasArrayFilters || hasAmountSpentFilter || hasCustomerCreatedFromFilter;
    })();

    if (!hasActiveFilters) {
      return {
        customers: [],
        total: 0,
      };
    }

    // Fetch all customers with pagination
    let allCustomers: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allCustomers.length < 1000) {
      // Limit to 1000 customers max for performance
      // Build the query with all active filter fragments
      const query = buildCustomerQuery(filters, cursor);

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

    // Apply all filters to the fetched customers
    const filteredCustomers = await applyAllFilters(allCustomers, filters, admin);

    // Format customer data
    const formattedCustomers: FilteredCustomer[] = filteredCustomers.map(
      formatCustomerData
    );

    return {
      customers: formattedCustomers,
      total: formattedCustomers.length,
    };
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

/**
 * Legacy function for backward compatibility
 * Filters customers by countries only
 */
export async function filterCustomersByCountries(
  admin: AdminGraphQL,
  countries: string[]
): Promise<FilterCustomersResult> {
  const filters: FilterData = {
    location: countries,
    products: [],
    timing: [],
    device: [],
    payment: [],
    delivery: [],
  };

  return filterCustomers(admin, filters);
}

