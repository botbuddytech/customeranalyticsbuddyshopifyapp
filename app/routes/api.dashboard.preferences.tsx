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
    const formData = await request.formData();
    const preferencesJson = formData.get("preferences");

    if (!preferencesJson || typeof preferencesJson !== "string") {
      return Response.json(
        { error: "Invalid preferences data" },
        { status: 400 },
      );
    }

    const preferences = JSON.parse(preferencesJson);
    await saveDashboardPreferences(shop, preferences);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error(
      `[Dashboard Preferences API] Error saving preferences:`,
      error,
    );
    return Response.json(
      { error: "Failed to save preferences" },
      { status: 500 },
    );
  }
};

