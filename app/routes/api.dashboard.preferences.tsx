import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getDashboardPreferences,
  saveDashboardPreferences,
} from "../services/dashboard-preferences.server";

/**
 * API Route for Dashboard Preferences
 * 
 * GET: Load saved preferences for the current shop
 * POST: Save preferences for the current shop
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const preferences = await getDashboardPreferences(shop);
    return Response.json({ preferences });
  } catch (error: any) {
    console.error(
      `[Dashboard Preferences API] Error loading preferences:`,
      error,
    );
    return Response.json(
      { error: "Failed to load preferences" },
      { status: 500 },
    );
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    console.log(`[Dashboard Preferences API] Saving preferences for shop: ${shop}`);
    const formData = await request.formData();
    const preferencesJson = formData.get("preferences");

    if (!preferencesJson || typeof preferencesJson !== "string") {
      console.error(`[Dashboard Preferences API] Invalid preferences data`);
      return Response.json(
        { error: "Invalid preferences data" },
        { status: 400 },
      );
    }

    const preferences = JSON.parse(preferencesJson);
    console.log(`[Dashboard Preferences API] Parsed preferences:`, preferences);
    await saveDashboardPreferences(shop, preferences);
    console.log(`[Dashboard Preferences API] Preferences saved successfully`);

    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(
      `[Dashboard Preferences API] Error saving preferences:`,
      error,
    );
    return Response.json(
      { error: "Failed to save preferences", success: false },
      { status: 500 },
    );
  }
};

