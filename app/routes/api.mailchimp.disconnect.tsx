import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { disconnectMailchimp } from "../services/mailchimp.server";

/**
 * API Route for Disconnecting Mailchimp
 * 
 * Handles disconnecting Mailchimp integration for a shop
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    await disconnectMailchimp(shop);

    return Response.json({
      success: true,
      message: "Mailchimp disconnected successfully",
    });
  } catch (error: any) {
    console.error("[Disconnect Mailchimp] Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to disconnect Mailchimp",
      },
      { status: 500 }
    );
  }
};
