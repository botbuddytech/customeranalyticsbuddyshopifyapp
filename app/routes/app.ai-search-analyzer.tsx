import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { AISearchAnalyzerPage } from "../components/ai-search-analyzer";
import { getShopInfo } from "../services/shop-info.server";

import db from "../db.server";

interface LoaderData {
  apiKey: string;
  shopInfo: {
    name: string;
    email: string;
    shop: string;
  };
  history: any[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shopInfo = await getShopInfo(admin, session.shop);

  // Fetch chat history from Prisma
  const chatSessions = await db.chatSession.findMany({
    where: { shopId: session.shop },
    include: { messages: true },
    orderBy: { createdAt: "desc" },
  });

  // Transform to frontend ChatHistory format
  const history = chatSessions.map((session) => {
    // 1. Map messages first to get usable objects
    const sortedMessages = [...session.messages].sort((a: any, b: any) => Number(a.id) - Number(b.id));

    const messages = sortedMessages.map((m: any) => {
      let msgData;
      
      try {
         if (typeof m.message === 'string') {
            msgData = JSON.parse(m.message);
            // Handle double-stringified JSON (common in some DB setups)
            if (typeof msgData === 'string' && (msgData.trim().startsWith('{') || msgData.trim().startsWith('['))) {
               try { msgData = JSON.parse(msgData); } catch(e) {}
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
         if (!obj || typeof obj !== 'object') return undefined;
         if (obj[key]) return obj[key];
         if (obj.json && obj.json[key]) return obj.json[key];
         if (obj.body && obj.body[key]) return obj.body[key];
         if (obj.data && obj.data[key]) return obj.data[key];
         return undefined;
      };

      if (typeof msgData === 'string') {
         role = "user";
         content = msgData;
      } else if (msgData && typeof msgData === 'object') {
          // Check for Assistant 'reply'
          const reply = findKey(msgData, 'reply');
          
          if (reply) {
            role = "assistant";
            content = reply;
          } else {
            // Assume User
            role = "user";
            // Try to find user content
            const message = findKey(msgData, 'message');
            const text = findKey(msgData, 'text');
            const input = findKey(msgData, 'input');
            const query = findKey(msgData, 'query');
            const contentVal = findKey(msgData, 'content');

            if (message) content = message;
            else if (text) content = text;
            else if (input) content = input;
            else if (contentVal) content = contentVal;
            else if (query) content = query;
            else content = typeof msgData === 'string' ? msgData : JSON.stringify(msgData);
          }
      } else {
          role = "user";
          content = String(msgData);
      }

      // Final cleanup: if content is still a JSON string that looks like it has a reply, try one last time
      // This catches edge cases where the content extraction picked up a stringified JSON
      if (typeof content === 'string' && content.trim().startsWith('{') && content.includes('"reply"')) {
          try {
              const parsed = JSON.parse(content);
              if (parsed.reply) {
                  role = "assistant";
                  content = parsed.reply;
              }
          } catch(e) {}
      }

      // DEBUG LOGGING
      if (process.env.NODE_ENV === 'development') {
          console.log(`[Message Debug] ID: ${m.id}`);
          console.log(`[Message Debug] Raw:`, m.message);
          console.log(`[Message Debug] Parsed:`, msgData);
          console.log(`[Message Debug] Role: ${role}, Content: ${content.substring(0, 50)}...`);
      }

      return {
        id: m.id.toString(),
        role,
        content,
        timestamp: session.createdAt ? new Date(session.createdAt) : new Date(),
        ...((typeof msgData === 'object') ? msgData : {}) 
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
    const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
  };
};

export default function AISearchAnalyzerRoute() {
  const { apiKey, shopInfo, history } = useLoaderData<LoaderData>();

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="AI Search & Analyzer" />
        <AISearchAnalyzerPage apiKey={apiKey} shopInfo={shopInfo} history={history} />
      </Page>
    </Frame>
  );
}
