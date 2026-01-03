/**
 * API Route for Generating Customer Segments
 * 
 * Handles filtering customers based on selected criteria
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { filterCustomers } from "../components/filter-audience/query";
import type { FilterData } from "../components/filter-audience/types";

/**
 * Action function to generate customer segment based on filters
 * 
 * This function:
 * 1. Receives filter data from the frontend
 * 2. Uses the modular query compiler to build and execute the query
 * 3. Returns filtered customer results
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const filtersJson = formData.get("filters");

    if (!filtersJson || typeof filtersJson !== "string") {
      return Response.json(
        { error: "Invalid filters data" },
        { status: 400 }
      );
    }

    const filters: FilterData = JSON.parse(filtersJson);

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
      return Response.json({
        success: true,
        matchCount: 0,
        filters,
        customers: [],
        message: "Please select at least one filter to generate a segment.",
      });
    }

    // Filter customers using the modular query system
    // This will compile all active filters into one optimized query
    const result = await filterCustomers(admin, filters);

    if (result.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      matchCount: result.total,
      filters,
      customers: result.customers,
    });
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      console.log(
        "[Generate Segment API] Protected customer data access denied - user needs to request access in Partner Dashboard"
      );
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }

    console.error("[Generate Segment API] Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate segment" },
      { status: 500 }
    );
  }
};

