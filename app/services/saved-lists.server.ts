/**
 * Saved Customer Lists Service
 * 
 * Handles saving and loading customer segment lists for each merchant.
 * Each merchant (shop) can have multiple saved lists.
 */

import db from "../db.server";
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

/**
 * Get all saved lists for a shop
 */
export async function getSavedLists(shop: string): Promise<SavedCustomerList[]> {
  try {
    const lists = await db.savedCustomerList.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });

    return lists.map((list) => ({
      id: list.id,
      shop: list.shop,
      listName: list.listName,
      queryData: JSON.parse(list.queryData) as FilterData,
      customerIds: list.customerIds,
      source: (list.source || "filter-audience") as "ai-search" | "filter-audience" | "manual",
      status: (list.status || "active") as "active" | "archived",
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
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
 */
export async function getSavedListById(
  shop: string,
  listId: string
): Promise<SavedCustomerList | null> {
  try {
    const list = await db.savedCustomerList.findFirst({
      where: {
        id: listId,
        shop, // Ensure the list belongs to this shop
      },
    });

    if (!list) {
      return null;
    }

    return {
      id: list.id,
      shop: list.shop,
      listName: list.listName,
      queryData: JSON.parse(list.queryData) as FilterData,
      customerIds: list.customerIds,
      source: (list.source || "filter-audience") as "ai-search" | "filter-audience" | "manual",
      status: (list.status || "active") as "active" | "archived",
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
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
  source: "ai-search" | "filter-audience" | "manual" = "filter-audience"
): Promise<SavedCustomerList> {
  try {
    const savedList = await db.savedCustomerList.create({
      data: {
        shop,
        listName,
        queryData: JSON.stringify(queryData),
        customerIds: customerIds || [],
        source,
        status: "active",
      },
    });

    return {
      id: savedList.id,
      shop: savedList.shop,
      listName: savedList.listName,
      queryData: JSON.parse(savedList.queryData) as FilterData,
      customerIds: savedList.customerIds,
      source: (savedList.source || "filter-audience") as "ai-search" | "filter-audience" | "manual",
      status: (savedList.status || "active") as "active" | "archived",
      createdAt: savedList.createdAt,
      updatedAt: savedList.updatedAt,
    };
  } catch (error) {
    console.error(
      `[Saved Lists] Error saving list for shop ${shop}:`,
      error,
    );
    throw error;
  }
}

/**
 * Update an existing saved list
 */
export async function updateSavedList(
  shop: string,
  listId: string,
  updates: {
    listName?: string;
    queryData?: FilterData;
    customerIds?: string[];
    status?: "active" | "archived";
  }
): Promise<SavedCustomerList | null> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
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

    const updatedList = await db.savedCustomerList.update({
      where: {
        id: listId,
      },
      data: updateData,
    });

    // Verify the list belongs to this shop
    if (updatedList.shop !== shop) {
      return null;
    }

    return {
      id: updatedList.id,
      shop: updatedList.shop,
      listName: updatedList.listName,
      queryData: JSON.parse(updatedList.queryData) as FilterData,
      customerIds: updatedList.customerIds,
      source: (updatedList.source || "filter-audience") as "ai-search" | "filter-audience" | "manual",
      status: (updatedList.status || "active") as "active" | "archived",
      createdAt: updatedList.createdAt,
      updatedAt: updatedList.updatedAt,
    };
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
 */
export async function deleteSavedList(
  shop: string,
  listId: string
): Promise<boolean> {
  try {
    // First verify the list belongs to this shop
    const list = await db.savedCustomerList.findFirst({
      where: {
        id: listId,
        shop,
      },
    });

    if (!list) {
      return false;
    }

    await db.savedCustomerList.delete({
      where: {
        id: listId,
      },
    });

    return true;
  } catch (error) {
    console.error(
      `[Saved Lists] Error deleting list ${listId} for shop ${shop}:`,
      error,
    );
    throw error;
  }
}

