/**
 * Onboarding Progress Service
 *
 * Handles saving and loading onboarding progress for stores
 */

import { getSupabaseForShop } from "./supabase-jwt.server";
import { getShopInfo } from "./shop-info.server";
import type { AdminGraphQL } from "./dashboard.server";

export interface OnboardingProgress {
  shop: string;
  email: string | null;
  contact: string | null;
  completedSteps: number[];
  isCompleted: boolean;
}

/**
 * Get onboarding progress for a shop
 */
export async function getOnboardingProgress(
  shop: string,
): Promise<OnboardingProgress | null> {
  try {
    const supabase = getSupabaseForShop(shop);
    const { data, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("shop", shop)
      .single();

    if (error && error.code !== "PGRST116") {
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      shop: data.shop,
      email: data.email,
      contact: data.contact,
      completedSteps: data.completedSteps || [],
      isCompleted: data.isCompleted || false,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Save or update onboarding progress for a shop
 */
export async function saveOnboardingProgress(
  shop: string,
  completedSteps: number[],
  admin?: AdminGraphQL,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseForShop(shop);

    // Fetch shop info if admin is provided and email/contact are not set
    let email: string | null = null;
    let contact: string | null = null;

    if (admin) {
      try {
        const shopInfo = await getShopInfo(admin, shop);
        email = shopInfo.email || null;
        contact = shopInfo.email || null;
      } catch (error) {
        // Silently fail - email/contact are optional
      }
    }

    // Check if all steps are completed (assuming 4 steps total)
    const totalSteps = 4;
    const isCompleted = completedSteps.length >= totalSteps;

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from("onboarding_progress")
      .select("id")
      .eq("shop", shop)
      .single();

    // Ignore "not found" errors (PGRST116)

    if (existing) {
      // Update existing record
      // Use camelCase as per Prisma schema (no @map on fields means camelCase)
      const updateData: any = {
        completedSteps,
        isCompleted,
        updatedAt: new Date().toISOString(),
        ...(email && { email }),
        ...(contact && { contact }),
      };
      
      const { error } = await supabase
        .from("onboarding_progress")
        .update(updateData)
        .eq("shop", shop);

      if (error) {
        return { 
          success: false, 
          error: `Update failed: ${error.message || JSON.stringify(error)}` 
        };
      }
      return { success: true };
    } else {
      // Create new record
      // Use camelCase as per Prisma schema (no @map on fields means camelCase)
      const now = new Date().toISOString();
      const insertData: any = {
        id: crypto.randomUUID(),
        shop,
        email,
        contact,
        completedSteps,
        isCompleted,
        createdAt: now,
        updatedAt: now,
      };
      const { error } = await supabase
        .from("onboarding_progress")
        .insert(insertData)
        .select();

      if (error) {
        return { 
          success: false, 
          error: `Insert failed: ${error.message || JSON.stringify(error)}` 
        };
      }
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Exception: ${errorMessage}` 
    };
  }
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(
  shop: string,
  admin?: AdminGraphQL,
): Promise<boolean> {
  const totalSteps = 4;
  return saveOnboardingProgress(shop, [1, 2, 3, 4], admin);
}

