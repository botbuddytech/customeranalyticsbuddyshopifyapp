/**
 * AI Search Service
 * 
 * Handles communication with N8N webhook for AI chatbot functionality
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
  const webhookUrl = process.env.N8N_prod_url;

  if (!webhookUrl) {
    return {
      success: false,
      error: "N8N webhook URL is not configured. Please set N8N_prod_url in your .env file.",
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

