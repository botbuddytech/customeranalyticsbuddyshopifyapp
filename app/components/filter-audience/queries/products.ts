/**
 * Products Query Builder
 * 
 * This file contains the query logic for filtering customers by products, collections, and categories.
 * 
 * Query Structure:
 * - Fetches customers with their orders and line items
 * - Filters customers who have purchased the selected products/collections/categories
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

import type { AdminGraphQL } from "../../../services/dashboard.server";

export interface ProductsFilter {
  products: string[]; // Product titles
  collections: string[]; // Collection titles
  categories: string[]; // Product type/category names
}

/**
 * Build GraphQL query fragment for products filtering
 * 
 * This returns the fields needed in the customer query to filter by products
 * 
 * Note: We limit to 10 orders and 10 line items per order to keep query cost low.
 * This should be sufficient to determine if a customer has purchased the selected products.
 */
export function buildProductsQueryFragment(): string {
  return `
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          lineItems(first: 10) {
            edges {
              node {
                product {
                  id
                  title
                  productType
                }
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Get product IDs from product titles
 * This helper function fetches product IDs based on titles
 */
export async function getProductIdsByTitles(
  admin: AdminGraphQL,
  productTitles: string[]
): Promise<string[]> {
  if (!productTitles || productTitles.length === 0) {
    return [];
  }

  try {
    const productIds: string[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && productIds.length < productTitles.length * 2) {
      // Fetch products to match titles
      const query = cursor
        ? `
          query {
            products(first: 250, after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                title
              }
            }
          }
        `
        : `
          query {
            products(first: 250) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                title
              }
            }
          }
        `;

      const response = await admin.graphql(query);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        console.error("[Get Product IDs] GraphQL errors:", json.errors);
        break;
      }

      const products = json.data?.products?.nodes || [];
      
      products.forEach((product: any) => {
        if (productTitles.includes(product.title)) {
          productIds.push(product.id);
        }
      });

      hasNextPage = json.data?.products?.pageInfo?.hasNextPage || false;
      cursor = json.data?.products?.pageInfo?.endCursor || null;
    }

    return productIds;
  } catch (error) {
    console.error("[Get Product IDs] Error:", error);
    return [];
  }
}

/**
 * Get collection IDs from collection titles
 */
export async function getCollectionIdsByTitles(
  admin: AdminGraphQL,
  collectionTitles: string[]
): Promise<string[]> {
  if (!collectionTitles || collectionTitles.length === 0) {
    return [];
  }

  try {
    const collectionIds: string[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && collectionIds.length < collectionTitles.length * 2) {
      const query = cursor
        ? `
          query {
            collections(first: 250, after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                title
              }
            }
          }
        `
        : `
          query {
            collections(first: 250) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                title
              }
            }
          }
        `;

      const response = await admin.graphql(query);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        console.error("[Get Collection IDs] GraphQL errors:", json.errors);
        break;
      }

      const collections = json.data?.collections?.nodes || [];
      
      collections.forEach((collection: any) => {
        if (collectionTitles.includes(collection.title)) {
          collectionIds.push(collection.id);
        }
      });

      hasNextPage = json.data?.collections?.pageInfo?.hasNextPage || false;
      cursor = json.data?.collections?.pageInfo?.endCursor || null;
    }

    return collectionIds;
  } catch (error) {
    console.error("[Get Collection IDs] Error:", error);
    return [];
  }
}

/**
 * Filter customers by products, collections, and categories
 * 
 * This function filters the already-fetched customers based on their purchase history
 */
export function filterByProducts(
  customers: any[],
  filter: ProductsFilter,
  productIds: string[] = [],
  collectionIds: string[] = []
): any[] {
  if (
    (!filter.products || filter.products.length === 0) &&
    (!filter.collections || filter.collections.length === 0) &&
    (!filter.categories || filter.categories.length === 0)
  ) {
    return customers; // No filter applied, return all
  }

  return customers.filter((customer: any) => {
    // Get all products from customer's orders
    const customerProducts: Set<string> = new Set();
    const customerProductTitles: Set<string> = new Set();
    const customerProductTypes: Set<string> = new Set();

    // Extract products from orders
    const orders = customer.orders?.edges || [];
    orders.forEach((orderEdge: any) => {
      const lineItems = orderEdge.node?.lineItems?.edges || [];
      lineItems.forEach((lineItemEdge: any) => {
        const product = lineItemEdge.node?.product;
        if (product) {
          if (product.id) {
            customerProducts.add(product.id);
          }
          if (product.title) {
            customerProductTitles.add(product.title);
          }
          if (product.productType) {
            customerProductTypes.add(product.productType);
          }
        }
      });
    });

    // Check if customer matches ANY of the selected items (OR logic)
    // Since filter.products contains mixed items (products, collections, categories),
    // we check against all three types
    let matches = false;

    // Check product IDs (if we have them from title lookup)
    if (productIds.length > 0) {
      matches = matches || productIds.some((productId) =>
        customerProducts.has(productId)
      );
    }

    // Check product titles (for products selected by title)
    if (filter.products && filter.products.length > 0) {
      matches = matches || filter.products.some((item) =>
        customerProductTitles.has(item)
      );
    }

    // Check product types (for categories)
    if (filter.categories && filter.categories.length > 0) {
      matches = matches || filter.categories.some((category) =>
        customerProductTypes.has(category)
      );
    }

    // Also check if any selected item matches a product type (in case it's a category)
    if (filter.products && filter.products.length > 0) {
      matches = matches || filter.products.some((item) =>
        customerProductTypes.has(item)
      );
    }

    return matches;
  });
}

/**
 * Helper to extract all products from a customer's orders
 */
export function getCustomerProducts(customer: any): Array<{
  id: string;
  title: string;
  productType: string | null;
}> {
  const products: Array<{ id: string; title: string; productType: string | null }> = [];
  const seen = new Set<string>();

  const orders = customer.orders?.edges || [];
  orders.forEach((orderEdge: any) => {
    const lineItems = orderEdge.node?.lineItems?.edges || [];
    lineItems.forEach((lineItemEdge: any) => {
      const product = lineItemEdge.node?.product || lineItemEdge.node?.variant?.product;
      if (product && product.id && !seen.has(product.id)) {
        seen.add(product.id);
        products.push({
          id: product.id,
          title: product.title || "Unknown",
          productType: product.productType || null,
        });
      }
    });
  });

  return products;
}

