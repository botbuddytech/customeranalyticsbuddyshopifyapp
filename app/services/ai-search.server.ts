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
  shopId: string;
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
 * @param shopId - The shopify shop ID
 * @returns Promise with the AI response text or error
 */
export async function sendChatMessage(
  message: string,
  sessionId: string,
  shopId: string,
): Promise<ChatResponse> {
  // Try multiple possible environment variable names (case variations)
  const webhookUrl = process.env.N8N_prod_url;

  if (!webhookUrl) {
    return {
      success: false,
      error:
        "N8N webhook URL is not configured. Please set one of the following in your .env file:\n"
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
        shopId: shopId,
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

