/**
 * API Route for AI Chat
 *
 * Handles communication with N8N webhook for AI chatbot
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { sendChatMessage } from "../services/ai-search.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Authenticate the request
  const { session } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const message = formData.get("message");
    const sessionId = formData.get("sessionId");
    // specific shopId from request or fallback to authenticated shop
    const shopId = formData.get("shopId")?.toString() || session.shop;

    if (!message || typeof message !== "string") {
      return Response.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return Response.json(
        { success: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Call the N8N webhook service
    const result = await sendChatMessage(message, sessionId, shopId);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      response: result.response,
    });
  } catch (error) {
    console.error("[AI Chat API] Error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while processing your request",
      },
      { status: 500 },
    );
  }
};
