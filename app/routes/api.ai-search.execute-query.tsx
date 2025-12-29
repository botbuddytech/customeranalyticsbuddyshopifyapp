/**
 * API Route for Executing SQL/GraphQL Queries
 * 
 * Executes queries against Shopify Admin API
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { executeShopifyQuery } from "../services/sql-query.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();
    const query = formData.get("query");

    if (!query || typeof query !== "string") {
      return Response.json(
        {
          success: false,
          error: "Query is required",
        },
        { status: 400 }
      );
    }

    // Execute the query
    const result = await executeShopifyQuery(admin, query);

    return Response.json(result);
  } catch (error: any) {
    console.error("Query execution error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to execute query",
      },
      { status: 500 }
    );
  }
};

