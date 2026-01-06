/**
 * API Route: Auto-complete Onboarding Step
 * 
 * Marks an onboarding step as auto-completed in Supabase
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getSupabaseForShop } from "../services/supabase-jwt.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const stepId = formData.get("stepId");

    if (!stepId) {
      return Response.json(
        { error: "stepId is required" },
        { status: 400 }
      );
    }

    const stepNumber = parseInt(stepId.toString(), 10);
    if (isNaN(stepNumber) || stepNumber < 1) {
      return Response.json(
        { error: "Invalid stepId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    // Get current config to check if step is already completed
    const { data: currentConfig } = await supabase
      .from("onboardingtaskdata")
      .select("id, completedSteps, autoCompletedSteps, createdAt")
      .single();

    const currentCompletedSteps: string[] = currentConfig?.completedSteps || [];
    const currentAutoCompletedSteps: string[] = currentConfig?.autoCompletedSteps || [];
    const stepIdString = stepNumber.toString();

    // Check if step is already completed
    if (currentCompletedSteps.includes(stepIdString)) {
      // Step already completed, just ensure it's in auto-completed list
      if (!currentAutoCompletedSteps.includes(stepIdString)) {
        const updatedAutoCompleted = [...currentAutoCompletedSteps, stepIdString];
        await supabase
          .from("onboardingtaskdata")
          .upsert(
            {
              id: currentConfig?.id || crypto.randomUUID(),
              shop,
              completedSteps: currentCompletedSteps,
              autoCompletedSteps: updatedAutoCompleted,
              createdAt: currentConfig?.createdAt || now,
              updatedAt: now,
            },
            {
              onConflict: "shop",
            },
          );
      }
      return Response.json({ success: true, alreadyCompleted: true });
    }

    // Add step to both completedSteps and autoCompletedSteps
    const updatedCompletedSteps = [...currentCompletedSteps, stepIdString];
    const updatedAutoCompletedSteps = [...currentAutoCompletedSteps, stepIdString];

    // Upsert the record
    const { error } = await supabase
      .from("onboardingtaskdata")
      .upsert(
        {
          id: currentConfig?.id || crypto.randomUUID(),
          shop,
          completedSteps: updatedCompletedSteps,
          autoCompletedSteps: updatedAutoCompletedSteps,
          createdAt: currentConfig?.createdAt || now,
          updatedAt: now,
        },
        {
          onConflict: "shop",
        },
      );

    if (error) {
      console.error("Error auto-completing step:", error);
      return Response.json(
        { error: "Failed to auto-complete step" },
        { status: 500 }
      );
    }

    return Response.json({ 
      success: true,
      completedSteps: updatedCompletedSteps,
      autoCompletedSteps: updatedAutoCompletedSteps,
    });
  } catch (error) {
    console.error("Error in auto-complete-step:", error);
    return Response.json(
      { error: "Failed to auto-complete step" },
      { status: 500 }
    );
  }
};

