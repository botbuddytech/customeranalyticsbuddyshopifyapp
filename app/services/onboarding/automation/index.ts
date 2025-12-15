/**
 * Onboarding Task Automation Service
 * 
 * This service orchestrates the automation checks for all onboarding tasks.
 * It checks each task's completion criteria and automatically marks tasks as complete
 * when the criteria are met.
 */

import type { AdminGraphQL } from "../../dashboard.server";
import db from "../../../db.server";

// Import automation logic for each task
import { checkTaskCompletion as checkTask1 } from "./use-ai-to-generate-first-customer-segment";
import { checkTaskCompletion as checkTask2 } from "./filter-customers-manually-using-audience-traits";
import { checkTaskCompletion as checkTask3 } from "./send-first-whatsapp-or-email-campaign";
import { checkTaskCompletion as checkTask4 } from "./first-list-saved";

export interface AutomationContext {
  shop: string;
  admin: AdminGraphQL;
}

/**
 * Task configuration mapping
 */
const TASK_AUTOMATION_MAP: Record<number, (context: AutomationContext) => Promise<boolean>> = {
  1: checkTask1, // "Use AI to generate your first customer segment"
  2: checkTask2, // "Filter customers manually using 20+ audience traits"
  3: checkTask3, // "Send your first WhatsApp or Email campaign"
  4: checkTask4, // "First list saved"
};

/**
 * Check all tasks and auto-complete them if criteria are met
 * 
 * @param shop - Shop identifier
 * @param admin - Admin GraphQL client
 * @returns Updated auto-completed steps array
 */
export async function checkAndUpdateAutomation(
  shop: string,
  admin: AdminGraphQL
): Promise<string[]> {
  try {
    const context: AutomationContext = { shop, admin };

    // Get current config
    // Note: If autoCompletedSteps column doesn't exist yet, this will use empty array
    const config = await db.config.findUnique({
      where: { shop },
    });

    const currentCompletedSteps = config?.completedSteps || [];
    // Handle case where autoCompletedSteps field might not exist in DB yet
    const currentAutoCompletedSteps = (config as any)?.autoCompletedSteps || [];
    const newAutoCompletedSteps: string[] = [...currentAutoCompletedSteps];

    // Check each task
    for (const [taskIdStr, checkFunction] of Object.entries(TASK_AUTOMATION_MAP)) {
      const taskId = parseInt(taskIdStr, 10);
      const taskIdString = String(taskId);

      // Skip if already auto-completed
      if (currentAutoCompletedSteps.includes(taskIdString)) {
        continue;
      }

      // Skip if already manually completed
      if (currentCompletedSteps.includes(taskIdString)) {
        continue;
      }

      // Check if task should be auto-completed
      try {
        const shouldAutoComplete = await checkFunction(context);

        console.log(`[Automation] Task ${taskId} check result: ${shouldAutoComplete}`);

        if (shouldAutoComplete) {
          // Add to auto-completed steps
          if (!newAutoCompletedSteps.includes(taskIdString)) {
            newAutoCompletedSteps.push(taskIdString);
            console.log(`[Automation] Task ${taskId} will be auto-completed`);
          }

          // Add to completed steps if not already there
          if (!currentCompletedSteps.includes(taskIdString)) {
            currentCompletedSteps.push(taskIdString);
          }
        }
      } catch (error) {
        console.error(`Error checking automation for task ${taskId}:`, error);
        // Continue with other tasks even if one fails
      }
    }

    // Update database if there are changes
    if (newAutoCompletedSteps.length !== currentAutoCompletedSteps.length) {
      try {
        console.log(`[Automation] Updating database: ${currentAutoCompletedSteps.length} -> ${newAutoCompletedSteps.length} auto-completed steps`);
        await db.config.upsert({
          where: { shop },
          update: {
            completedSteps: currentCompletedSteps,
            autoCompletedSteps: newAutoCompletedSteps,
            updatedAt: new Date(),
          },
          create: {
            shop,
            completedSteps: currentCompletedSteps,
            autoCompletedSteps: newAutoCompletedSteps,
          },
        });
        console.log(`[Automation] Database updated successfully`);
      } catch (dbError) {
        console.error("Error updating automation in database:", dbError);
        // Return current state if update fails
        return currentAutoCompletedSteps;
      }
    } else {
      console.log(`[Automation] No changes to auto-completed steps`);
    }

    return newAutoCompletedSteps;
  } catch (error) {
    console.error("Fatal error in checkAndUpdateAutomation:", error);
    // Return empty array on fatal error to prevent breaking the page
    return [];
  }
}

