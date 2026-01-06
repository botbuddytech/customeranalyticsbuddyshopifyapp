/**
 * Shop Information Service
 * 
 * Fetches shop/merchant information from Shopify Admin API
 * Can be reused across the app to get merchant name and email
 */

import type { AdminGraphQL } from "./dashboard.server";

export interface ShopInfo {
  name: string;
  email: string;
  shop: string; // Shop domain (e.g., "store.myshopify.com")
}

/**
 * Fetch shop information (name and contact email) from Shopify
 * 
 * @param admin - Shopify Admin GraphQL client
 * @param shop - Shop domain (e.g., "store.myshopify.com")
 * @returns Shop information including name and email
 */
export async function getShopInfo(
  admin: AdminGraphQL,
  shop: string,
): Promise<ShopInfo> {
  try {
    const response = await admin.graphql(`
      query ShopInfo {
        shop {
          name
          contactEmail
        }
      }
    `);

    const json = await response.json();
    
    if (json.errors && json.errors.length > 0) {
      console.error("[Shop Info] GraphQL errors:", json.errors);
      // Return fallback values on error
      return {
        name: shop,
        email: "",
        shop,
      };
    }

    const shopData = json.data?.shop;
    
    return {
      name: shopData?.name || shop,
      email: shopData?.contactEmail || "",
      shop,
    };
  } catch (error) {
    console.error("[Shop Info] Error fetching shop info:", error);
    // Return fallback values on error
    return {
      name: shop,
      email: "",
      shop,
    };
  }
}

