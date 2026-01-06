/**
 * API Route: Check Usage Limits
 * 
 * Checks if a shop can perform a specific action before allowing it
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  canPerformAction,
  getUsageTracking,
  getUsageLimits,
} from "../services/usage-tracking.server";

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

    // Check if action is allowed
    const canPerform = await canPerformAction(shop, actionType);

    // Get current usage and limits for response
    const tracking = await getUsageTracking(shop);
    const limits = await getUsageLimits();

    return Response.json({
      allowed: canPerform.allowed,
      reason: canPerform.reason,
      usage: {
        totalChatsCreated: tracking.totalChatsCreated,
        totalListsGenerated: tracking.totalListsGenerated,
        totalListsSaved: tracking.totalListsSaved,
        totalExports: tracking.totalExports,
        isBlocked: tracking.isBlocked,
      },
      limits: {
        maxChats: limits.maxChats,
        maxListsGenerated: limits.maxListsGenerated,
        maxListsSaved: limits.maxListsSaved,
        maxExports: limits.maxExports,
        isActive: limits.isActive,
      },
    });
  } catch (error) {
    console.error("Error checking usage limits:", error);
    return Response.json(
      { error: "Failed to check usage limits" },
      { status: 500 }
    );
  }
};

