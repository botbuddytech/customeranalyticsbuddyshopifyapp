import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { AISearchAnalyzerPage } from "../components/ai-search-analyzer";
import { getShopInfo } from "../services/shop-info.server";
import { getCurrentPlanName } from "../services/subscription.server";
import { UpgradeBanner } from "../components/UpgradeBanner";

import db from "../db.server";

interface LoaderData {
  apiKey: string;
  shopInfo: {
    name: string;
    email: string;
    shop: string;
  };
  history: any[];
  currentPlan: string | null;
  isDevMode: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shopInfo = await getShopInfo(admin, session.shop);
  const currentPlan = await getCurrentPlanName(admin);

  // Check if dev mode is enabled
  const enableAllFeatures = process.env.ENABLE_ALL_FEATURES;
  let isDevMode = false;
  if (enableAllFeatures === "true") {
    isDevMode = true;
  } else if (enableAllFeatures === "false") {
    isDevMode = false;
  } else if (process.env.NODE_ENV === "development") {
    isDevMode = true;
  }

  // Fetch chat history from Prisma
  const chatSessions = await db.chatSession.findMany({
    where: { shopId: session.shop },
    include: { messages: true },
    orderBy: { createdAt: "desc" },
  });

  // Transform to frontend ChatHistory format
  const history = chatSessions.map((session) => {
    // 1. Map messages first to get usable objects
    const sortedMessages = [...session.messages].sort(
      (a: any, b: any) => Number(a.id) - Number(b.id),
    );

    const messages = sortedMessages.map((m: any) => {
      let msgData: any; // Re-added variable declaration

      // Helper to strip markdown code blocks
      const cleanJsonString = (str: string): string => {
        let cleaned = str.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned
            .replace(/^```(json)?\s*/, "")
            .replace(/\s*```$/, "");
        }
        return cleaned;
      };

      try {
        if (typeof m.message === "string") {
          let potentialJson = cleanJsonString(m.message);
          msgData = JSON.parse(potentialJson);

          // Handle double-stringified JSON (common in some DB setups)
          if (typeof msgData === "string") {
            try {
              let innerJson = cleanJsonString(msgData);
              // Only try parsing again if it looks like an object/array
              if (innerJson.startsWith("{") || innerJson.startsWith("[")) {
                msgData = JSON.parse(innerJson);
              }
            } catch (e) {}
          }
        } else {
          msgData = m.message;
        }
      } catch (e) {
        msgData = { message: m.message };
      }

      let role: "user" | "assistant" = "user"; // Default to user
      let content = "";

      // Helper to find specific keys deeply
      const findKey = (obj: any, key: string): any => {
        if (!obj || typeof obj !== "object") return undefined;
        if (obj[key]) return obj[key];
        if (obj.json && obj.json[key]) return obj.json[key];
        if (obj.body && obj.body[key]) return obj.body[key];
        if (obj.data && obj.data[key]) return obj.data[key];
        return undefined;
      };

      if (typeof msgData === "string") {
        role = "user";
        content = msgData;
      } else if (msgData && typeof msgData === "object") {
        // Check for Assistant 'reply'
        const reply = findKey(msgData, "reply");

        if (reply) {
          role = "assistant";
          content = reply;
          // Extract query if it exists in the message data
          const queryFromData = findKey(msgData, "query");
          if (
            queryFromData &&
            queryFromData.trim() &&
            queryFromData !== "null"
          ) {
            // Store query in the message object
            msgData.query = queryFromData;
          }
        } else {
          // Assume User
          role = "user";
          // Try to find user content
          const message = findKey(msgData, "message");
          const text = findKey(msgData, "text");
          const input = findKey(msgData, "input");
          const query = findKey(msgData, "query");
          const contentVal = findKey(msgData, "content");

          if (message) content = message;
          else if (text) content = text;
          else if (input) content = input;
          else if (contentVal) content = contentVal;
          else if (query) content = query;
          else
            content =
              typeof msgData === "string" ? msgData : JSON.stringify(msgData);
        }
      } else {
        role = "user";
        content = String(msgData);
      }

      // Final cleanup: if content is still a JSON string that looks like it has a reply, try one last time
      // This catches edge cases where the content extraction picked up a stringified JSON (wrapped in markdown or not)
      if (typeof content === "string") {
        let potentialCleanup = cleanJsonString(content);
        if (
          potentialCleanup.startsWith("{") &&
          potentialCleanup.includes('"reply"')
        ) {
          try {
            const parsed = JSON.parse(potentialCleanup);
            if (parsed.reply) {
              role = "assistant";
              content = parsed.reply;
              // Extract query from parsed JSON if it exists
              if (
                parsed.query &&
                parsed.query.trim() &&
                parsed.query !== "null"
              ) {
                msgData.query = parsed.query;
              }
            }
          } catch (e) {}
        }
      }

      // Extract query from msgData if it exists (for assistant messages)
      let messageQuery: string | undefined = undefined;
      if (role === "assistant" && typeof msgData === "object" && msgData) {
        const queryFromData = findKey(msgData, "query");
        if (queryFromData && queryFromData.trim() && queryFromData !== "null") {
          try {
            // Try to parse if it's a JSON string
            const queryParsed = JSON.parse(queryFromData);
            messageQuery = JSON.stringify(queryParsed, null, 2);
          } catch (e) {
            messageQuery = queryFromData;
          }
        }
      }

      return {
        id: m.id.toString(),
        role,
        content,
        timestamp: session.createdAt ? new Date(session.createdAt) : new Date(),
        query: messageQuery,
        ...(typeof msgData === "object" ? msgData : {}),
      };
    });

    // 2. Determine title from first user message
    const firstUserMsg = messages.find((m) => m.role === "user");
    let title = "New Chat";
    if (firstUserMsg && firstUserMsg.content) {
      title = firstUserMsg.content;
      if (title.length > 50) title = title.substring(0, 50) + "...";
    }

    // Format date
    const dateObj = new Date(session.createdAt);
    const date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      id: session.sessionId,
      sessionId: session.sessionId,
      title,
      date,
      messages,
    };
  });

  return {
    apiKey: process.env.OPENAI_API_KEY || "demo-mode",
    shopInfo,
    history,
    currentPlan,
    isDevMode,
  };
};

export default function AISearchAnalyzerRoute() {
  const { apiKey, shopInfo, history, currentPlan, isDevMode } =
    useLoaderData<LoaderData>();

  return (
    <Frame>
      {/* <UpgradeBanner currentPlan={currentPlan} isDevMode={isDevMode} /> */}
      <Page fullWidth>
        <TitleBar title="AI Search & Analyzer" />
        <AISearchAnalyzerPage
          apiKey={apiKey}
          shopInfo={shopInfo}
          history={history}
        />
      </Page>
    </Frame>
  );
}
