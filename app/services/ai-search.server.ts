/**
 * AI Search Service
 * 
 * Handles communication with N8N webhook for AI chatbot functionality
 * 
 * Note: Environment variables should be set in your .env file or deployment environment.
 * For Shopify apps, you can also use: shopify app env pull
 */

interface ChatRequest {
  message: string;
  sessionId: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Send a message to the N8N webhook and get AI response
 * 
 * @param message - The user's message/query
 * @param sessionId - Unique session identifier for the conversation
 * @returns Promise with the AI response text or error
 */
export async function sendChatMessage(
  message: string,
  sessionId: string,
): Promise<ChatResponse> {
  // Try multiple possible environment variable names (case variations)
  const webhookUrl =
    process.env.N8N_prod_url ||
    process.env.N8N_PROD_URL ||
    process.env.N8N_PROD_WEBHOOK_URL ||
    process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    // Log available env vars for debugging (only in development)
    if (process.env.NODE_ENV !== "production") {
      const envKeys = Object.keys(process.env).filter((key) =>
        key.toUpperCase().includes("N8N"),
      );
      console.warn(
        "[AI Search Service] N8N webhook URL not found. Available N8N-related env vars:",
        envKeys.length > 0 ? envKeys : "none",
      );
    }

    return {
      success: false,
      error:
        "N8N webhook URL is not configured. Please set one of the following in your .env file:\n" +
        "- N8N_prod_url\n" +
        "- N8N_PROD_URL\n" +
        "- N8N_PROD_WEBHOOK_URL\n" +
        "- N8N_WEBHOOK_URL\n\n" +
        "After setting the variable, restart your development server.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        sessionId: sessionId,
      } as ChatRequest),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook request failed with status ${response.status}: ${response.statusText}`,
      };
    }

    // Response is plain text, not JSON
    const responseText = await response.text();

    return {
      success: true,
      response: responseText.trim(),
    };
  } catch (error) {
    console.error("Error calling N8N webhook:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to AI service. Please try again.",
    };
  }
}

