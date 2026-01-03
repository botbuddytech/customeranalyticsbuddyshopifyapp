/**
 * Subscription Service
 *
 * Handles fetching current Shopify subscription information
 */

import type { AdminGraphQL } from "./dashboard.server";

export interface ShopifySubscription {
  name: string;
  status: string;
}

/**
 * Get the current active subscription from Shopify
 */
export async function getCurrentShopifySubscription(
  admin: AdminGraphQL,
): Promise<ShopifySubscription | null> {
  try {
    const response = await admin.graphql(`
      query AppCurrentSubscription {
        appInstallation {
          activeSubscriptions {
            name
            status
          }
        }
      }
    `);

    const json = await response.json();
    const activeSub =
      json.data?.appInstallation?.activeSubscriptions?.[0] || null;

    if (activeSub?.name) {
      return {
        name: activeSub.name as string,
        status: activeSub.status as string,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current plan name from Shopify
 * Returns the subscription name or null if not found
 */
export async function getCurrentPlanName(
  admin: AdminGraphQL,
): Promise<string | null> {
  const subscription = await getCurrentShopifySubscription(admin);
  return subscription?.name || null;
}

