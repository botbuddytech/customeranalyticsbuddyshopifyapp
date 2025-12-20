import { getSupabaseForShop } from "./supabase-jwt.server";
import { type DashboardVisibility } from "../components/dashboard/dashboardConfig";

/**
 * Dashboard Preferences Service
 *
 * Handles saving and loading dashboard visibility preferences for each merchant.
 * Each merchant (shop) has their own saved preferences in Supabase.
 *
 * Uses Supabase with RLS (Row Level Security) for automatic shop filtering.
 */

/**
 * Get dashboard preferences for a shop
 * RLS automatically filters by shop from JWT
 */
export async function getDashboardPreferences(
  shop: string,
): Promise<DashboardVisibility | null> {
  try {
    const supabase = getSupabaseForShop(shop);

    const { data, error } = await supabase
      .from("dashboard_preferences")
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        console.log(
          `[Dashboard Preferences] No saved config found for ${shop} - returning null`,
        );
        return null;
      }
      console.error(
        `[Dashboard Preferences] Supabase error for shop ${shop}:`,
        error,
      );
      return null;
    }

    if (data && data.visibilityConfig) {
      try {
        console.log(`[Dashboard Preferences] Found saved config for ${shop}`);
        return JSON.parse(data.visibilityConfig) as DashboardVisibility;
      } catch (e) {
        console.error(
          `[Dashboard Preferences] Error parsing preferences for shop ${shop}:`,
          e,
        );
        return null;
      }
    }

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
 * Uses upsert to create or update
 */
export async function saveDashboardPreferences(
  shop: string,
  visibility: DashboardVisibility,
): Promise<void> {
  try {
    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    // First check if record exists
    const { data: existing } = await supabase
      .from("dashboard_preferences")
      .select("id, createdAt")
      .single();

    const { error } = await supabase.from("dashboard_preferences").upsert(
      {
        id: existing?.id || crypto.randomUUID(),
        shop,
        visibilityConfig: JSON.stringify(visibility),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      },
      {
        onConflict: "shop",
      },
    );

    if (error) {
      console.error(
        `[Dashboard Preferences] Supabase error saving for shop ${shop}:`,
        error,
      );
      throw error;
    }
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

