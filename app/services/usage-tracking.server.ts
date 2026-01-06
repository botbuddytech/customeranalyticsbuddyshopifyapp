/**
 * Usage Tracking Service
 * 
 * Tracks usage for each shop and enforces global limits
 */

import prisma from "../db.server";

export interface UsageLimits {
  maxChats: number;
  maxListsGenerated: number;
  maxListsSaved: number;
  maxExports: number;
  isActive: boolean;
}

export interface UsageTracking {
  shop: string;
  totalChatsCreated: number;
  totalListsGenerated: number;
  totalListsSaved: number;
  totalExports: number;
  isBlocked: boolean;
}

/**
 * Get or create global usage limits
 * There should only be one record in this table
 */
export async function getUsageLimits(): Promise<UsageLimits> {
  let limits = await prisma.usageLimits.findFirst();

  // If no limits exist, create default ones
  if (!limits) {
    limits = await prisma.usageLimits.create({
      data: {
        maxChats: 10,
        maxListsGenerated: 20,
        maxListsSaved: 15,
        maxExports: 10,
        isActive: true,
      },
    });
  }

  return {
    maxChats: limits.maxChats,
    maxListsGenerated: limits.maxListsGenerated,
    maxListsSaved: limits.maxListsSaved,
    maxExports: limits.maxExports,
    isActive: limits.isActive,
  };
}

/**
 * Get or create usage tracking for a shop
 */
export async function getUsageTracking(shop: string): Promise<UsageTracking> {
  let tracking = await prisma.usageTracking.findUnique({
    where: { shop },
  });

  if (!tracking) {
    tracking = await prisma.usageTracking.create({
      data: {
        shop,
        totalChatsCreated: 0,
        totalListsGenerated: 0,
        totalListsSaved: 0,
        totalExports: 0,
        isBlocked: false,
      },
    });
  }

  return {
    shop: tracking.shop,
    totalChatsCreated: tracking.totalChatsCreated,
    totalListsGenerated: tracking.totalListsGenerated,
    totalListsSaved: tracking.totalListsSaved,
    totalExports: tracking.totalExports,
    isBlocked: tracking.isBlocked,
  };
}

/**
 * Check if shop can perform an action based on limits
 */
export async function canPerformAction(
  shop: string,
  action: "chat" | "listGenerated" | "listSaved" | "export",
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUsageLimits();
  const tracking = await getUsageTracking(shop);

  // If limits are disabled, allow all actions
  if (!limits.isActive) {
    return { allowed: true };
  }

  // If shop is blocked, deny all actions
  if (tracking.isBlocked) {
    return {
      allowed: false,
      reason: "Your account has been blocked due to exceeding usage limits.",
    };
  }

  // Check specific limits
  switch (action) {
    case "chat":
      if (tracking.totalChatsCreated >= limits.maxChats) {
        return {
          allowed: false,
          reason: `You have reached the maximum limit of ${limits.maxChats} chats. Please upgrade your plan to create more chats.`,
        };
      }
      break;

    case "listGenerated":
      if (tracking.totalListsGenerated >= limits.maxListsGenerated) {
        return {
          allowed: false,
          reason: `You have reached the maximum limit of ${limits.maxListsGenerated} generated lists. Please upgrade your plan to generate more lists.`,
        };
      }
      break;

    case "listSaved":
      if (tracking.totalListsSaved >= limits.maxListsSaved) {
        return {
          allowed: false,
          reason: `You have reached the maximum limit of ${limits.maxListsSaved} saved lists. Please upgrade your plan to save more lists.`,
        };
      }
      break;

    case "export":
      if (tracking.totalExports >= limits.maxExports) {
        return {
          allowed: false,
          reason: `You have reached the maximum limit of ${limits.maxExports} exports. Please upgrade your plan to export more lists.`,
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Increment usage counter for a shop
 */
export async function incrementUsage(
  shop: string,
  action: "chat" | "listGenerated" | "listSaved" | "export",
): Promise<void> {
  const limits = await getUsageLimits();
  const tracking = await getUsageTracking(shop);

  // Check if action is allowed before incrementing
  const canPerform = await canPerformAction(shop, action);
  if (!canPerform.allowed && limits.isActive) {
    // Block the shop if they try to exceed limits
    await prisma.usageTracking.update({
      where: { shop },
      data: { isBlocked: true },
    });
    throw new Error(canPerform.reason || "Usage limit exceeded");
  }

  // Increment the appropriate counter
  const updateData: Partial<UsageTracking> = {};
  let shouldBlock = false;

  switch (action) {
    case "chat":
      updateData.totalChatsCreated = tracking.totalChatsCreated + 1;
      if (limits.isActive && updateData.totalChatsCreated >= limits.maxChats) {
        shouldBlock = true;
      }
      break;

    case "listGenerated":
      updateData.totalListsGenerated = tracking.totalListsGenerated + 1;
      if (
        limits.isActive &&
        updateData.totalListsGenerated >= limits.maxListsGenerated
      ) {
        shouldBlock = true;
      }
      break;

    case "listSaved":
      updateData.totalListsSaved = tracking.totalListsSaved + 1;
      if (
        limits.isActive &&
        updateData.totalListsSaved >= limits.maxListsSaved
      ) {
        shouldBlock = true;
      }
      break;

    case "export":
      updateData.totalExports = tracking.totalExports + 1;
      if (limits.isActive && updateData.totalExports >= limits.maxExports) {
        shouldBlock = true;
      }
      break;
  }

  await prisma.usageTracking.update({
    where: { shop },
    data: {
      ...updateData,
      isBlocked: shouldBlock,
    },
  });
}

/**
 * Update global usage limits (admin function)
 */
export async function updateUsageLimits(
  limits: Partial<UsageLimits>,
): Promise<UsageLimits> {
  let existing = await prisma.usageLimits.findFirst();

  if (!existing) {
    existing = await prisma.usageLimits.create({
      data: {
        maxChats: limits.maxChats ?? 10,
        maxListsGenerated: limits.maxListsGenerated ?? 20,
        maxListsSaved: limits.maxListsSaved ?? 15,
        maxExports: limits.maxExports ?? 10,
        isActive: limits.isActive ?? true,
      },
    });
  } else {
    existing = await prisma.usageLimits.update({
      where: { id: existing.id },
      data: {
        maxChats: limits.maxChats ?? existing.maxChats,
        maxListsGenerated: limits.maxListsGenerated ?? existing.maxListsGenerated,
        maxListsSaved: limits.maxListsSaved ?? existing.maxListsSaved,
        maxExports: limits.maxExports ?? existing.maxExports,
        isActive: limits.isActive ?? existing.isActive,
      },
    });
  }

  return {
    maxChats: existing.maxChats,
    maxListsGenerated: existing.maxListsGenerated,
    maxListsSaved: existing.maxListsSaved,
    maxExports: existing.maxExports,
    isActive: existing.isActive,
  };
}

/**
 * Reset usage tracking for a shop (admin function)
 */
export async function resetUsageTracking(shop: string): Promise<void> {
  await prisma.usageTracking.update({
    where: { shop },
    data: {
      totalChatsCreated: 0,
      totalListsGenerated: 0,
      totalListsSaved: 0,
      totalExports: 0,
      isBlocked: false,
    },
  });
}

