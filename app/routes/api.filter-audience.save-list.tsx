/**
 * API Route for Saving Customer Lists
 * 
 * Handles saving customer segment lists to the database
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { saveCustomerList, updateSavedList } from "../services/saved-lists.server";
import type { FilterData } from "../components/filter-audience/types";

/**
 * Action function to save a customer list
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const listName = formData.get("listName");
    const filtersJson = formData.get("filters");
    const customerIdsJson = formData.get("customerIds");
    const source = formData.get("source") as string;
    const listId = formData.get("listId") as string | null;

    // Validate input
    if (!listName || typeof listName !== "string" || !listName.trim()) {
      return Response.json(
        { error: "List name is required" },
        { status: 400 }
      );
    }

    if (!filtersJson || typeof filtersJson !== "string") {
      return Response.json(
        { error: "Invalid filters data" },
        { status: 400 }
      );
    }

    const filters: FilterData = JSON.parse(filtersJson);
    const customerIds = customerIdsJson
      ? (JSON.parse(customerIdsJson as string) as string[])
      : undefined;

    // Validate and set source (default to "filter-audience" if not provided)
    const validSource = ["ai-search", "filter-audience", "manual"].includes(source)
      ? (source as "ai-search" | "filter-audience" | "manual")
      : "filter-audience";

    // If listId is provided, update existing list; otherwise create new
    let savedList;
    if (listId) {
      // Update existing list
      savedList = await updateSavedList(
        shop,
        listId,
        {
          listName: listName.trim(),
          queryData: filters,
          customerIds,
        }
      );

      if (!savedList) {
        return Response.json(
          { error: "List not found or access denied" },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        list: savedList,
        message: "List updated successfully",
      });
    } else {
      // Create new list
      savedList = await saveCustomerList(
        shop,
        listName.trim(),
        filters,
        customerIds,
        validSource
      );

      return Response.json({
        success: true,
        list: savedList,
        message: "List saved successfully",
      });
    }
  } catch (error: any) {
    console.error("[Save List API] Error:", error);
    return Response.json(
      { error: error.message || "Failed to save list" },
      { status: 500 }
    );
  }
};

