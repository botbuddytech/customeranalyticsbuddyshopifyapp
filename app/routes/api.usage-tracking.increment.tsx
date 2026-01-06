/**
 * API Route: Increment Usage
 * 
 * Increments usage counter for a shop after an action is performed
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { incrementUsage } from "../services/usage-tracking.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as
      | "chat"
      | "listGenerated"
      | "listSaved"
      | "export";

    if (!actionType) {
      return Response.json(
        { error: "actionType is required" },
        { status: 400 }
      );
    }

    // Increment usage (this will also check limits and block if needed)
    await incrementUsage(shop, actionType);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error incrementing usage:", error);
    return Response.json(
      {
        error: error.message || "Failed to increment usage",
        blocked: error.message?.includes("limit exceeded") || false,
      },
      { status: 500 }
    );
  }
};

