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
    console.log(`[Dashboard Preferences] Starting save for shop: ${shop}`);
    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    // First check if record exists
    console.log(`[Dashboard Preferences] Checking for existing record...`);
    const { data: existing, error: selectError } = await supabase
      .from("dashboard_preferences")
      .select("id, createdAt")
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine for new records
      console.error(
        `[Dashboard Preferences] Error checking existing record for shop ${shop}:`,
        selectError,
      );
      // Continue anyway - we'll try to insert
    }

    console.log(
      `[Dashboard Preferences] Existing record:`,
      existing ? `Found (id: ${existing.id})` : "None (new record)",
    );

    const recordToSave = {
      id: existing?.id || crypto.randomUUID(),
      shop,
      visibilityConfig: JSON.stringify(visibility),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    console.log(
      `[Dashboard Preferences] Attempting upsert with data:`,
      JSON.stringify(recordToSave, null, 2),
    );

    const { data: upsertData, error: upsertError } = await supabase
      .from("dashboard_preferences")
      .upsert(recordToSave, {
        onConflict: "shop",
      })
      .select();

    if (upsertError) {
      console.error(
        `[Dashboard Preferences] Supabase upsert error for shop ${shop}:`,
        upsertError,
      );
      console.error(
        `[Dashboard Preferences] Error details:`,
        JSON.stringify(upsertError, null, 2),
      );
      throw new Error(
        `Failed to save preferences: ${upsertError.message || "Unknown error"}`,
      );
    }

    console.log(
      `[Dashboard Preferences] Successfully saved preferences for shop ${shop}`,
    );
    console.log(`[Dashboard Preferences] Upsert result:`, upsertData);
  } catch (error) {
    console.error(
      `[Dashboard Preferences] Error saving preferences for shop ${shop}:`,
      error,
    );
    if (error instanceof Error) {
      console.error(`[Dashboard Preferences] Error message:`, error.message);
      console.error(`[Dashboard Preferences] Error stack:`, error.stack);
    }
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

