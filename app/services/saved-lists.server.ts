/**
 * Saved Customer Lists Service
 *
 * Handles saving and loading customer segment lists for each merchant.
 * Each merchant (shop) can have multiple saved lists.
 *
 * Uses Supabase with RLS (Row Level Security) for automatic shop filtering.
 */

import { getSupabaseForShop } from "./supabase-jwt.server";
import type { FilterData } from "../components/filter-audience/types";

export interface SavedCustomerList {
  id: string;
  shop: string;
  listName: string;
  queryData: FilterData;
  customerIds?: string[];
  source: "ai-search" | "filter-audience" | "manual";
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

// Database row type (snake_case from Supabase)
interface SavedCustomerListRow {
  id: string;
  shop: string;
  listName: string;
  queryData: string;
  customerIds: string[];
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform database row to application type
 */
function transformRow(row: SavedCustomerListRow): SavedCustomerList {
  return {
    id: row.id,
    shop: row.shop,
    listName: row.listName,
    queryData: JSON.parse(row.queryData) as FilterData,
    customerIds: row.customerIds,
    source: (row.source || "filter-audience") as
      | "ai-search"
      | "filter-audience"
      | "manual",
    status: (row.status || "active") as "active" | "archived",
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

/**
 * Get all saved lists for a shop
 * RLS automatically filters by shop from JWT
 */
export async function getSavedLists(
  shop: string,
): Promise<SavedCustomerList[]> {
  try {
    const supabase = getSupabaseForShop(shop);

    const { data, error } = await supabase
      .from("saved_customer_lists")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error(`[Saved Lists] Supabase error for shop ${shop}:`, error);
      return [];
    }

    return (data || []).map(transformRow);
  } catch (error) {
    console.error(
      `[Saved Lists] Error fetching lists for shop ${shop}:`,
      error,
    );
    return [];
  }
}

/**
 * Get a specific saved list by ID
 * RLS automatically filters by shop from JWT
 */
export async function getSavedListById(
  shop: string,
  listId: string,
): Promise<SavedCustomerList | null> {
  try {
    const supabase = getSupabaseForShop(shop);

    const { data, error } = await supabase
      .from("saved_customer_lists")
      .select("*")
      .eq("id", listId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      console.error(
        `[Saved Lists] Supabase error fetching list ${listId}:`,
        error,
      );
      return null;
    }

    return transformRow(data);
  } catch (error) {
    console.error(
      `[Saved Lists] Error fetching list ${listId} for shop ${shop}:`,
      error,
    );
    return null;
  }
}

/**
 * Save a new customer list
 */
export async function saveCustomerList(
  shop: string,
  listName: string,
  queryData: FilterData,
  customerIds?: string[],
  source: "ai-search" | "filter-audience" | "manual" = "filter-audience",
): Promise<SavedCustomerList> {
  try {
    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("saved_customer_lists")
      .insert({
        id: crypto.randomUUID(),
        shop,
        listName,
        queryData: JSON.stringify(queryData),
        customerIds: customerIds || [],
        source,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      console.error(`[Saved Lists] Supabase error saving list:`, error);
      throw error;
    }

    return transformRow(data);
  } catch (error) {
    console.error(`[Saved Lists] Error saving list for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Update an existing saved list
 * RLS automatically ensures only shop's own lists can be updated
 */
export async function updateSavedList(
  shop: string,
  listId: string,
  updates: {
    listName?: string;
    queryData?: FilterData;
    customerIds?: string[];
    status?: "active" | "archived";
  },
): Promise<SavedCustomerList | null> {
  try {
    const supabase = getSupabaseForShop(shop);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.listName !== undefined) {
      updateData.listName = updates.listName;
    }

    if (updates.queryData !== undefined) {
      updateData.queryData = JSON.stringify(updates.queryData);
    }

    if (updates.customerIds !== undefined) {
      updateData.customerIds = updates.customerIds;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    const { data, error } = await supabase
      .from("saved_customer_lists")
      .update(updateData)
      .eq("id", listId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found (RLS blocked or doesn't exist)
        return null;
      }
      console.error(
        `[Saved Lists] Supabase error updating list ${listId}:`,
        error,
      );
      throw error;
    }

    return transformRow(data);
  } catch (error) {
    console.error(
      `[Saved Lists] Error updating list ${listId} for shop ${shop}:`,
      error,
    );
    throw error;
  }
}

/**
 * Delete a saved list
 * RLS automatically ensures only shop's own lists can be deleted
 */
export async function deleteSavedList(
  shop: string,
  listId: string,
): Promise<boolean> {
  try {
    const supabase = getSupabaseForShop(shop);

    const { error, count } = await supabase
      .from("saved_customer_lists")
      .delete()
      .eq("id", listId);

    if (error) {
      console.error(
        `[Saved Lists] Supabase error deleting list ${listId}:`,
        error,
      );
      throw error;
    }

    // If count is 0, the list didn't exist or RLS blocked it
    return (count ?? 0) > 0 || !error;
  } catch (error) {
    console.error(
      `[Saved Lists] Error deleting list ${listId} for shop ${shop}:`,
      error,
    );
    throw error;
  }
}

