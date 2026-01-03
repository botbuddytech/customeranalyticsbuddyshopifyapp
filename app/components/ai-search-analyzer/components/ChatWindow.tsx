import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { Message } from "../types";
import { Spinner } from "./PolarisUI";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { parseApiResponse } from "../utils/ChatUtils";

interface ChatWindowProps {
  apiKey: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  externalQuery?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string;
  shopId: string;
  onQueryExtracted?: (query: string) => void;
  onLoadQuery?: (query: string) => void; // Callback to load query into SqlQueryPanel
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  apiKey,
  onSubmitRef,
  externalQuery,
  messages,
  setMessages,
  sessionId,
  shopId,
  onQueryExtracted,
  onLoadQuery,
}) => {
  const [input, setInput] = useState("");
  const chatFetcher = useFetcher<{
    success: boolean;
    response?: string;
    error?: string;
  }>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLTextAreaElement>(null);
  const processedResponseRef = useRef<string | null>(null);
  const isUserTypingRef = useRef(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const isLoading = chatFetcher.state !== "idle";

  // Sync external query changes
  useEffect(() => {
    if (
      !isUserTypingRef.current &&
      externalQuery !== undefined &&
      externalQuery !== input
    ) {
      setInput(externalQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle chat response from API
  useEffect(() => {
    if (chatFetcher.state === "idle" && chatFetcher.data) {
      const data = chatFetcher.data;

      // Create a unique key for this response to prevent duplicates
      const responseKey = data.response
        ? data.response
        : data.error
          ? `error-${data.error}`
          : null;

      if (responseKey && processedResponseRef.current === responseKey) {
        return;
      }

      if (data.success && data.response) {
        // Use util to parse response and extract content/query
        const { content: responseContent, query: queryFromResponse } = parseApiResponse(data.response);

        if (responseKey) {
          processedResponseRef.current = responseKey;
        }

        if (queryFromResponse && onQueryExtracted) {
          onQueryExtracted(queryFromResponse);
        }

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage &&
            lastMessage.role === "assistant" &&
            lastMessage.content === responseContent
          ) {
            return prev;
          }

          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            query: queryFromResponse || undefined, // Store query in message
          };
          return [...prev, assistantMessage];
        });
      } else if (data.error) {
        if (responseKey) {
          processedResponseRef.current = responseKey;
        }

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const errorContent = `Error: ${data.error}`;
          if (
            lastMessage &&
            lastMessage.role === "assistant" &&
            lastMessage.content === errorContent
          ) {
            return prev;
          }

          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: errorContent,
            timestamp: new Date(),
          };
          return [...prev, errorMessage];
        });
      }

      setTimeout(() => {
        if (inputWrapperRef.current) {
          inputWrapperRef.current.focus();
        }
      }, 100);
    }
  }, [chatFetcher.state, chatFetcher.data]);

  const handleSend = useCallback(
    (overrideInput?: string) => {
      const textToSend = overrideInput || input;
      if (!textToSend.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: textToSend.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentQuery = textToSend.trim();
      setInput("");

      const formData = new FormData();
      formData.append("message", currentQuery);
      formData.append("sessionId", sessionId);
      formData.append("shopId", shopId);

      chatFetcher.submit(formData, {
        method: "POST",
        action: "/api/ai-search/chat",
      });
    },
    [input, isLoading, sessionId, shopId, chatFetcher],
  );

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .pulse-animation {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .bounce-animation {
            animation: bounce 1s infinite;
          }
          .bounce-delay-1 {
            animation-delay: -0.3s;
          }
          .bounce-delay-2 {
            animation-delay: -0.15s;
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "white",
          position: "relative",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: "40px",
            paddingBottom: hoveredCategory ? "300px" : "160px",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginRight: "0",
            scrollbarGutter: "stable",
            transition: "padding-bottom 0.3s ease",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
            }}
          >
            {messages.length === 0 ? (
              <ChatEmptyState
                hoveredCategory={hoveredCategory}
                setHoveredCategory={setHoveredCategory}
                onSend={handleSend}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "48px",
                }}
              >
                {messages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    msg={msg} 
                    onLoadQuery={onLoadQuery}
                  />
                ))}
                
                {isLoading && (
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
                      }}
                    >
                      <svg
                        className="pulse-animation"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
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
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Spinner />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          isUserTypingRef={isUserTypingRef}
          onSubmitRef={onSubmitRef}
          inputWrapperRef={inputWrapperRef}
        />
      </div>
    </>
  );
};

export default ChatWindow;
