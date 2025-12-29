/**
 * SQL Query Service
 * 
 * Executes GraphQL queries against Shopify Admin API
 * Note: Shopify doesn't support SQL directly, so we use GraphQL
 */

import type { AdminGraphQL } from "./dashboard.server";

export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Execute a GraphQL query against Shopify
 * 
 * @param admin - Shopify Admin GraphQL client
 * @param query - GraphQL query string
 * @returns Query result with data or error
 */
export async function executeShopifyQuery(
  admin: AdminGraphQL,
  query: string
): Promise<QueryResult> {
  try {
    // Validate query is not empty
    if (!query || !query.trim()) {
      return {
        success: false,
        error: "Query cannot be empty",
      };
    }

    let formattedQuery = query.trim();

    // Auto-wrap query if it doesn't have 'query {' wrapper
    // Check if query starts with 'query' keyword
    if (!formattedQuery.match(/^\s*query\s*\{/i)) {
      // Wrap the query in 'query { }' block
      formattedQuery = `query {\n  ${formattedQuery}\n}`;
    }

    // Execute the GraphQL query
    const response = await admin.graphql(formattedQuery);
    const json = await response.json();

    // Check for GraphQL errors
    if (json.errors && json.errors.length > 0) {
      const errorMessages = json.errors
        .map((err: any) => err.message || "Unknown error")
        .join("; ");

      return {
        success: false,
        error: errorMessages,
      };
    }

    // Return the data
    return {
      success: true,
      data: json.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to execute query",
    };
  }
}

