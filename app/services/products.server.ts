/**
 * Products Service
 * 
 * Fetches products and collections from Shopify for use in filters
 */

import type { AdminGraphQL } from "./dashboard.server";

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  productType: string | null;
  vendor: string | null;
  status: string;
  collections?: {
    nodes: Array<{
      id: string;
      title: string;
    }>;
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
}

/**
 * Get all products from Shopify
 */
export async function getProducts(
  admin: AdminGraphQL
): Promise<ShopifyProduct[]> {
  try {
    const allProducts: ShopifyProduct[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allProducts.length < 500) {
      // Limit to 500 products for performance
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
                handle
                productType
                vendor
                status
                collections(first: 10) {
                  nodes {
                    id
                    title
                  }
                }
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
                handle
                productType
                vendor
                status
                collections(first: 10) {
                  nodes {
                    id
                    title
                  }
                }
              }
            }
          }
        `;

      const response = await admin.graphql(query);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        console.error("[Get Products] GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const products = json.data?.products?.nodes || [];
      allProducts.push(...products);

      hasNextPage = json.data?.products?.pageInfo?.hasNextPage || false;
      cursor = json.data?.products?.pageInfo?.endCursor || null;
    }

    return allProducts;
  } catch (error) {
    console.error("[Get Products] Error fetching products:", error);
    throw error;
  }
}

/**
 * Get all collections from Shopify
 */
export async function getCollections(
  admin: AdminGraphQL
): Promise<ShopifyCollection[]> {
  try {
    const allCollections: ShopifyCollection[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allCollections.length < 250) {
      // Limit to 250 collections
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
                handle
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
                handle
              }
            }
          }
        `;

      const response = await admin.graphql(query);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        console.error("[Get Collections] GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const collections = json.data?.collections?.nodes || [];
      allCollections.push(...collections);

      hasNextPage = json.data?.collections?.pageInfo?.hasNextPage || false;
      cursor = json.data?.collections?.pageInfo?.endCursor || null;
    }

    return allCollections;
  } catch (error) {
    console.error("[Get Collections] Error fetching collections:", error);
    throw error;
  }
}

/**
 * Get product types (categories) from products
 */
export async function getProductTypes(
  admin: AdminGraphQL
): Promise<string[]> {
  try {
    const products = await getProducts(admin);
    const productTypes = new Set<string>();

    products.forEach((product) => {
      if (product.productType) {
        productTypes.add(product.productType);
      }
    });

    return Array.from(productTypes).sort();
  } catch (error) {
    console.error("[Get Product Types] Error:", error);
    return [];
  }
}

/**
 * Get all unique shipping method titles from orders
 */
export async function getUniqueShippingMethods(
  admin: AdminGraphQL
): Promise<string[]> {
  try {
    const shippingMethods = new Set<string>();
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && shippingMethods.size < 50) {
      // Limit to 50 unique shipping methods
      const query = cursor
        ? `
          query {
            orders(first: 250, after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                shippingLines {
                  title
                }
              }
            }
          }
        `
        : `
          query {
            orders(first: 250) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                shippingLines {
                  title
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
            error.message?.includes("protected order data") ||
            error.message?.includes("Order")
        );
        if (accessError) {
          console.error("[Get Shipping Methods] Protected data access denied");
          return [];
        }
        console.error("[Get Shipping Methods] GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const orders = json.data?.orders?.nodes || [];
      
      orders.forEach((order: any) => {
        const shippingLines = order.shippingLines || [];
        shippingLines.forEach((line: any) => {
          const title = line?.title;
          if (title && title.trim() !== "") {
            shippingMethods.add(title);
          }
        });
      });

      hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
      cursor = json.data?.orders?.pageInfo?.endCursor || null;
    }

    return Array.from(shippingMethods).sort();
  } catch (error) {
    console.error("[Get Shipping Methods] Error fetching shipping methods:", error);
    return [];
  }
}

/**
 * Get all unique payment gateway names from orders
 */
export async function getUniquePaymentGateways(
  admin: AdminGraphQL
): Promise<string[]> {
  try {
    const paymentGateways = new Set<string>();
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && paymentGateways.size < 50) {
      // Limit to 50 unique payment gateways
      const query = cursor
        ? `
          query {
            orders(first: 250, after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                paymentGatewayNames
              }
            }
          }
        `
        : `
          query {
            orders(first: 250) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                paymentGatewayNames
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
            error.message?.includes("protected order data") ||
            error.message?.includes("Order")
        );
        if (accessError) {
          console.error("[Get Payment Gateways] Protected data access denied");
          // Return empty array if access is denied
          return [];
        }
        console.error("[Get Payment Gateways] GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const orders = json.data?.orders?.nodes || [];
      
      orders.forEach((order: any) => {
        const gatewayNames = order.paymentGatewayNames || [];
        gatewayNames.forEach((gateway: string) => {
          if (gateway && gateway.trim() !== "") {
            paymentGateways.add(gateway);
          }
        });
      });

      hasNextPage = json.data?.orders?.pageInfo?.hasNextPage || false;
      cursor = json.data?.orders?.pageInfo?.endCursor || null;
    }

    return Array.from(paymentGateways).sort();
  } catch (error) {
    console.error("[Get Payment Gateways] Error fetching payment gateways:", error);
    return [];
  }
}

/**
 * Get all unique countries from customers
 */
export async function getUniqueCountries(
  admin: AdminGraphQL
): Promise<string[]> {
  try {
    const countries = new Set<string>();
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && countries.size < 200) {
      // Limit to 200 unique countries for performance
      const query = cursor
        ? `
          query {
            customers(first: 250, after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                defaultAddress {
                  country
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
                defaultAddress {
                  country
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
          console.error("[Get Countries] Protected data access denied");
          // Return empty array if access is denied
          return [];
        }
        console.error("[Get Countries] GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const customers = json.data?.customers?.nodes || [];
      
      customers.forEach((customer: any) => {
        const country = customer.defaultAddress?.country;
        if (country && country.trim() !== "") {
          countries.add(country);
        }
      });

      hasNextPage = json.data?.customers?.pageInfo?.hasNextPage || false;
      cursor = json.data?.customers?.pageInfo?.endCursor || null;
    }

    return Array.from(countries).sort();
  } catch (error) {
    console.error("[Get Countries] Error fetching countries:", error);
    return [];
  }
}

