/**
 * Shopify Admin API Client for Seeding
 *
 * This is a standalone client that doesn't use Prisma.
 * It uses environment variables for authentication.
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_SEED_STORE || "";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_SEED_ACCESS_TOKEN || "";
const API_VERSION = "2025-01"; // Update as needed

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  console.error("❌ Missing environment variables:");
  console.error("   - SHOPIFY_SEED_STORE: Your store domain (e.g., your-store.myshopify.com)");
  console.error("   - SHOPIFY_SEED_ACCESS_TOKEN: Admin API access token");
  process.exit(1);
}

const GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const REST_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}`;

/**
 * Make a GraphQL request to Shopify Admin API
 */
export async function shopifyGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify GraphQL Error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(`Shopify GraphQL Error: ${JSON.stringify(json.errors, null, 2)}`);
  }

  return json.data as T;
}

/**
 * Make a REST request to Shopify Admin API
 */
export async function shopifyREST<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${REST_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify REST Error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Delay utility to respect rate limits
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log with timestamp and emoji
 */
export function log(emoji: string, message: string): void {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(`[${timestamp}] ${emoji} ${message}`);
}

export { SHOPIFY_STORE_DOMAIN, API_VERSION };

