import React from "react";
import { Message } from "../types";
import { extractReply } from "../utils/ChatUtils";

interface ChatMessageProps {
  msg: Message;
  onLoadQuery?: (query: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  msg,
  onLoadQuery,
}) => {
  const isAssistant = msg.role === "assistant";

  // Use util to ensure clean content for assistant messages
  const content = isAssistant ? extractReply(msg.content) : msg.content;

  // Extract query from message - check msg.query first, then try to parse from content
  let messageQuery: string | null = null;

  if (msg.query && msg.query.trim() && msg.query !== "null") {
    messageQuery = msg.query;
  } else if (isAssistant) {
    // Try to extract query from message content (for backward compatibility)
    try {
      const cleanContent = msg.content.trim();
      if (cleanContent.startsWith("```")) {
        const cleaned = cleanContent
          .replace(/^```(json)?\s*/, "")
          .replace(/\s*```$/, "");
        const parsed = JSON.parse(cleaned);
        if (parsed.query) {
          messageQuery =
            typeof parsed.query === "string"
              ? parsed.query
              : JSON.stringify(parsed.query);
        }
      } else if (cleanContent.startsWith("{")) {
        const parsed = JSON.parse(cleanContent);
        if (parsed.query) {
          messageQuery =
            typeof parsed.query === "string"
              ? parsed.query
              : JSON.stringify(parsed.query);
        }
      }
    } catch (e) {
      // Not JSON or no query
    }
  }

  const hasQuery =
    messageQuery && messageQuery.trim() && messageQuery !== "null";

  const renderFormattedContent = (text: string) => {
    return text.split("\n").map((line, i, arr) => (
      <p
        key={i}
        style={{
          marginBottom: i === arr.length - 1 ? 0 : "12px",
          lineHeight: "1.6",
          fontSize: "15px",
          color: "#202223",
        }}
      >
        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong
              key={j}
              style={{
                fontWeight: "600",
                color: "#202223",
              }}
            >
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          ),
        )}
      </p>
    ));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {isAssistant ? (
        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#008060",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <svg
              style={{ width: "20px", height: "20px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div>{renderFormattedContent(content)}</div>
            {hasQuery && onLoadQuery && (
              <div style={{ marginTop: "12px" }}>
                <button
                  onClick={() => onLoadQuery(messageQuery!)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#008060",
                    backgroundColor: "transparent",
                    border: "1px solid #008060",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                    e.currentTarget.style.borderColor = "#006e52";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#008060";
                  }}
                >
                  <svg
                    style={{ width: "14px", height: "14px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Show List
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f6f6f7",
              border: "1px solid #e1e3e5",
              borderRadius: "16px",
              padding: "12px 20px",
              maxWidth: "85%",
              fontSize: "15px",
              color: "#202223",
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
