/**
 * Automation Logic for Task 4: "First list saved"
 * 
 * This file contains the logic to automatically mark this task as complete
 * when the criteria are met.
 * 
 * Task ID: 4
 * Task Name: "First list saved"
 */

import type { AdminGraphQL } from "../../dashboard.server";
import db from "../../../db.server";

export interface AutomationContext {
  shop: string;
  admin: AdminGraphQL;
}

/**
 * Check if the task should be auto-completed
 * 
 * This task is automatically completed when the user saves their first customer list.
 * It checks if at least one saved list exists in the database for this shop.
 * 
 * @param context - Context containing shop and admin GraphQL client
 * @returns true if the task should be auto-completed, false otherwise
 */
export async function checkTaskCompletion(context: AutomationContext): Promise<boolean> {
  const { shop } = context;

  try {
    // Check if at least one saved list exists for this shop
    // We check for any list (active or archived) since the task is about saving the first list
    // Use findFirst with select: { id: true } for better performance than count
    const firstList = await db.savedCustomerList.findFirst({
      where: {
        shop: shop,
      },
      select: {
        id: true,
      },
    });

    const hasList = firstList !== null;
    
    // Debug logging
    console.log(`[Automation Task 4] Shop: ${shop}, Has saved list: ${hasList}`);
    
    // Task is complete if at least one list has been saved
    return hasList;
  } catch (error) {
    console.error(`[Automation] Error checking first list saved for shop ${shop}:`, error);
    // Return false on error to prevent false positives
    return false;
  }
}

