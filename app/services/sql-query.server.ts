/**
 * GraphQL Query Service
 * 
 * Executes GraphQL queries against Shopify Admin API
 * Note: This service only accepts GraphQL queries, not SQL
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

    // Reject SQL queries - check if it starts with SELECT, INSERT, UPDATE, DELETE, etc.
    const sqlKeywords = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|EXEC|EXECUTE)\s+/i;
    if (sqlKeywords.test(formattedQuery)) {
      return {
        success: false,
        error: "SQL queries are not supported. Please use GraphQL queries instead. Example: { products(first: 10) { edges { node { title } } } }",
      };
    }

    // Validate it's a GraphQL query (should contain { } or be a GraphQL operation)
    const hasGraphQLStructure = /[\{\}]/.test(formattedQuery) || 
                                 /^\s*(query|mutation|subscription)\s+/i.test(formattedQuery);
    
    if (!hasGraphQLStructure) {
      return {
        success: false,
        error: "Invalid GraphQL query format. GraphQL queries should contain curly braces { } or start with 'query', 'mutation', or 'subscription'.",
      };
    }

    // Auto-wrap query if it doesn't have 'query {' wrapper
    // Check if query starts with 'query', 'mutation', or 'subscription' keyword
    const hasOperationKeyword = /^\s*(query|mutation|subscription)\s+/i.test(formattedQuery);
    
    if (!hasOperationKeyword) {
      // If query starts with '{', just prepend 'query' keyword
      if (formattedQuery.trim().startsWith("{")) {
        formattedQuery = `query ${formattedQuery}`;
      } else {
        // Otherwise, wrap the query in 'query { }' block
        formattedQuery = `query {\n  ${formattedQuery}\n}`;
      }
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

