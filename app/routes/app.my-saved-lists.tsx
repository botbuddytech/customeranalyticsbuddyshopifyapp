/**
 * My Saved Lists Page for AI Audience Insight Shopify App
 *
 * This page displays and manages saved customer segments created from:
 * - AI Search Analyzer queries
 * - Filter Audience configurations
 * - Manual customer selections
 *
 * Features:
 * - View all saved customer lists/segments
 * - Search and filter saved lists
 * - Export customer data (CSV, Excel)
 * - Delete or archive old lists
 * - View detailed customer information
 * - Create campaigns from saved lists
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData } from "react-router";
import { Page, Frame, Toast } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { MySavedLists } from "../components/my-saved-lists";
import type { LoaderData, ActionData } from "../components/my-saved-lists/types";
import { getSavedLists, deleteSavedList, updateSavedList } from "../services/saved-lists.server";
import { mapToSavedLists } from "../services/saved-lists-mapper.server";
import { useState, useEffect } from "react";

// ==========================================
// Server-side Functions
// ==========================================

/**
 * Loader Function - Fetch Saved Customer Lists
 *
 * Retrieves all saved customer segments from the database via Prisma.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Fetch saved lists from database
    const prismaLists = await getSavedLists(shop);
    
    // Map to component format
    const savedLists = mapToSavedLists(prismaLists);

    // Calculate recent activity stats
    const totalCustomers = savedLists.reduce((sum, list) => sum + list.customerCount, 0);
    const activeLists = savedLists.filter(list => list.status === "active").length;

    return {
      savedLists,
      totalLists: savedLists.length,
      recentActivity: {
        listsCreated: savedLists.length,
        customersExported: totalCustomers,
        campaignsSent: 0 // TODO: Calculate from campaigns table when implemented
      }
    };
  } catch (error) {
    console.error("[My Saved Lists] Error loading lists:", error);
    // Return empty data on error
    return {
      savedLists: [],
      totalLists: 0,
      recentActivity: {
        listsCreated: 0,
        customersExported: 0,
        campaignsSent: 0
      }
    };
  }
};

/**
 * Action Function - Handle List Operations
 *
 * Handles CRUD operations for saved customer lists.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();

  // Coerce form values to strings
  const actionType = String(formData.get("actionType") || "");
  const listId = String(formData.get("listId") || "");

  // Validate actionType is present
  if (!actionType) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Action type is required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Validate actionType is one of the allowed actions
  const allowedActions = ["deleteList", "archiveList", "unarchiveList", "exportList", "duplicateList"];
  if (!allowedActions.includes(actionType)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Invalid action type. Must be one of: ${allowedActions.join(", ")}`
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Validate listId is present
  if (!listId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "List ID is required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    switch (actionType) {
      case "deleteList":
        const deleted = await deleteSavedList(shop, listId);
        if (!deleted) {
          return {
            success: false,
            message: "List not found or you don't have permission to delete it",
            type: "delete"
          };
        }

        return {
          success: true,
          message: "Customer list deleted successfully",
          type: "delete"
        };

      case "archiveList":
        const archived = await updateSavedList(shop, listId, {
          status: "archived"
        });
        
        if (!archived) {
          return {
            success: false,
            message: "List not found or you don't have permission to archive it",
            type: "archive"
          };
        }

        return {
          success: true,
          message: "Customer list archived successfully",
          type: "archive"
        };

      case "unarchiveList":
        const unarchived = await updateSavedList(shop, listId, {
          status: "active"
        });
        
        if (!unarchived) {
          return {
            success: false,
            message: "List not found or you don't have permission to unarchive it",
            type: "unarchive"
          };
        }

        return {
          success: true,
          message: "Customer list unarchived successfully",
          type: "unarchive"
        };

      case "exportList":
        const format = String(formData.get("format") || "");

        // Validate format is present
        if (!format) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Export format is required"
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        // Validate format is a supported value
        const supportedFormats = ["csv", "json", "excel"];
        if (!supportedFormats.includes(format)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: `Invalid export format. Must be one of: ${supportedFormats.join(", ")}`
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        // In a real app, generate and download file
        console.log("Exporting list:", listId, "as", format);

        return {
          success: true,
          message: `Customer list exported as ${format}`,
          type: "export"
        };

      case "duplicateList":
        // In a real app, create copy in database
        console.log("Duplicating list:", listId);

        return {
          success: true,
          message: "Customer list duplicated successfully",
          type: "duplicate"
        };

      default:
        // This should never be reached due to validation above
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid action type"
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while processing your request"
    };
  }
};

/**
 * My Saved Lists Page Component
 *
 * Route handler that loads data and renders the main component
 */
export default function MySavedListsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Toast state for success/error messages
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Show toast messages based on action results
  useEffect(() => {
    if (actionData) {
      setToastMessage(actionData.message);
      setToastError(!actionData.success);
      setToastActive(true);
    }
  }, [actionData]);

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="My Saved Lists" />
        
        {/* Toast for success/error messages */}
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <MySavedLists loaderData={loaderData} />
      </Page>
    </Frame>
  );
}
