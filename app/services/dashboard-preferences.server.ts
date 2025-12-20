import db from "../db.server";
import { type DashboardVisibility } from "../components/dashboard/dashboardConfig";

/**
 * Dashboard Preferences Service
 * 
 * Handles saving and loading dashboard visibility preferences for each merchant.
 * Each merchant (shop) has their own saved preferences in Supabase.
 */

/**
 * Get dashboard preferences for a shop
 * Returns default preferences if none exist
 */
export async function getDashboardPreferences(
  shop: string
): Promise<DashboardVisibility | null> {
  try {
    const preferences = await db.dashboardPreferences.findUnique({
      where: { shop },
    });

    if (preferences && preferences.visibilityConfig) {
      try {
        console.log(`[Dashboard Preferences] Found saved config for ${shop}`);
        return JSON.parse(preferences.visibilityConfig) as DashboardVisibility;
      } catch (e) {
        console.error(
          `[Dashboard Preferences] Error parsing preferences for shop ${shop}:`,
          e,
        );
        return null;
      }
    }

    console.log(`[Dashboard Preferences] No saved config found for ${shop} - returning null`);
    return null;
  } catch (error) {
    console.error(
      `[Dashboard Preferences] Error fetching preferences for shop ${shop}:`,
      error,
    );
    return null;
  }
}

/**
 * Save dashboard preferences for a shop
 */
export async function saveDashboardPreferences(
  shop: string,
  visibility: DashboardVisibility,
): Promise<void> {
  try {
    await db.dashboardPreferences.upsert({
      where: { shop },
      update: {
        visibilityConfig: JSON.stringify(visibility),
        updatedAt: new Date(),
      },
      create: {
        shop,
        visibilityConfig: JSON.stringify(visibility),
      },
    });
  } catch (error) {
    console.error(
      `[Dashboard Preferences] Error saving preferences for shop ${shop}:`,
      error,
    );
    throw error;
  }
}

/**
 * Get default dashboard preferences
 */
function getDefaultPreferences(): DashboardVisibility {
  return {
    customersOverview: {
      enabled: true,
      cards: {
        totalCustomers: true,
        newCustomers: true,
        returningCustomers: true,
        inactiveCustomers: true,
      },
    },
    purchaseOrderBehavior: {
      enabled: true,
      cards: {
        codOrders: true,
        prepaidOrders: true,
        cancelledOrders: true,
        abandonedCarts: true,
      },
    },
    engagementPatterns: {
      enabled: true,
      cards: {
        discountUsers: true,
        wishlistUsers: true,
        reviewers: true,
        emailSubscribers: true,
      },
    },
  };
}

