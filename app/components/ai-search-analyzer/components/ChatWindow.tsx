import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { Message } from "../types";
import { Spinner } from "./PolarisUI";

interface ChatWindowProps {
  apiKey: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  externalQuery?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string;
  onQueryExtracted?: (query: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  apiKey,
  onSubmitRef,
  externalQuery,
  messages,
  setMessages,
  sessionId,
  onQueryExtracted,
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
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(
    null,
  );
  const [inputFocused, setInputFocused] = useState(false);

  const isLoading = chatFetcher.state !== "idle";

  // Sync external query changes (only when externalQuery actually changes, not on every input change)
  useEffect(() => {
    // Only sync if user is not actively typing and externalQuery is different
    if (
      !isUserTypingRef.current &&
      externalQuery !== undefined &&
      externalQuery !== input
    ) {
      setInput(externalQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]); // Only depend on externalQuery, not input

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

      // Skip if we've already processed this exact response
      if (responseKey && processedResponseRef.current === responseKey) {
        return;
      }

      if (data.success && data.response) {
        let responseContent = data.response;
        let queryFromResponse = "";

        // Try to parse JSON response (new format with reply, query, needs_clarification)
        try {
          const parsed = JSON.parse(data.response);
          if (parsed.reply) {
            // New format: extract only the reply for chat display
            responseContent = parsed.reply;
            // Extract query if present and not null/empty
            if (
              parsed.query &&
              parsed.query.trim() &&
              parsed.query !== "null"
            ) {
              // Query might be a JSON string, try to parse and format it
              try {
                const queryParsed = JSON.parse(parsed.query);
                queryFromResponse = JSON.stringify(queryParsed, null, 2);
              } catch (e) {
                // Not JSON, use as-is (might already be a GraphQL query string)
                queryFromResponse = parsed.query;
              }
            }
          }
        } catch (e) {
          // Not JSON, use response as-is (old format)
          responseContent = data.response;
        }

        // Mark this response as processed
        if (responseKey) {
          processedResponseRef.current = responseKey;
        }

        // If query was extracted, pass it to parent
        if (queryFromResponse && onQueryExtracted) {
          onQueryExtracted(queryFromResponse);
        }

        setMessages((prev) => {
          // Double-check: don't add if the last message already has this exact content
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
          };
          return [...prev, assistantMessage];
        });
      } else if (data.error) {
        // Mark this error as processed
        if (responseKey) {
          processedResponseRef.current = responseKey;
        }

        setMessages((prev) => {
          // Double-check: don't add if the last message already has this error
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

      // Focus input field after response is received
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

      // Submit to API route which will call N8N webhook
      const formData = new FormData();
      formData.append("message", currentQuery);
      formData.append("sessionId", sessionId);

      chatFetcher.submit(formData, {
        method: "POST",
        action: "/api/ai-search/chat",
      });
    },
    [input, isLoading, sessionId, chatFetcher],
  );

  // Expose handleSubmit via ref if provided
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleSend;
    }
  }, [handleSend, onSubmitRef]);

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i, arr) => (
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

  const suggestions = [
    {
      title: "Find high-value customers",
      icon: "💰",
      prompt: "Show me customers who spent more than $500 in the last 30 days",
    },
    {
      title: "Recent customers",
      icon: "✨",
      prompt:
        "Who are the customers who made their first purchase in the last week?",
    },
    {
      title: "Inactive customers",
      icon: "📊",
      prompt: "Find customers who haven't purchased in the last 90 days",
    },
    {
      title: "Email subscribers",
      icon: "📧",
      prompt: "Show me all customers who are subscribed to email marketing",
    },
  ];

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
            paddingBottom: "160px",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginRight: "0",
            scrollbarGutter: "stable",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "50vh",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#008060",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    marginBottom: "24px",
                  }}
                >
                  <svg
                    style={{ width: "40px", height: "40px" }}
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
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#202223",
                    marginBottom: "32px",
                    textAlign: "center",
                  }}
                >
                  How can I help you today?
                </h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    width: "100%",
                    maxWidth: "512px",
                  }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => handleSend(s.prompt)}
                      onMouseEnter={() => setHoveredSuggestion(s.title)}
                      onMouseLeave={() => setHoveredSuggestion(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px",
                        backgroundColor:
                          hoveredSuggestion === s.title ? "#f9fafb" : "white",
                        border: `1px solid ${
                          hoveredSuggestion === s.title ? "#008060" : "#e1e3e5"
                        }`,
                        borderRadius: "12px",
                        transition: "all 0.2s",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "24px", marginRight: "16px" }}>
                        {s.icon}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color:
                            hoveredSuggestion === s.title
                              ? "#008060"
                              : "#202223",
                        }}
                      >
                        {s.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "48px",
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                        }}
                      >
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
                          <div>{renderContent(msg.content)}</div>
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
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
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

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: "17px",
            padding: "16px",
            background: "white",
            borderTop: "1px solid #e1e3e5",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                position: "relative",
                backgroundColor: "#f6f6f7",
                borderRadius: "16px",
                border: `1px solid ${inputFocused ? "#008060" : "#babfc3"}`,
                boxShadow: inputFocused
                  ? "0 0 0 1px #008060"
                  : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s",
              }}
            >
              <textarea
                ref={inputWrapperRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  isUserTypingRef.current = true;
                  setInput(e.target.value);
                  // Reset the flag after a delay to allow external sync if needed
                  setTimeout(() => {
                    isUserTypingRef.current = false;
                  }, 1000);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    isUserTypingRef.current = false;
                    handleSend();
                  }
                }}
                onFocus={() => {
                  setInputFocused(true);
                  isUserTypingRef.current = true;
                }}
                onBlur={() => {
                  setInputFocused(false);
                  // Small delay before allowing external sync
                  setTimeout(() => {
                    isUserTypingRef.current = false;
                  }, 200);
                }}
                placeholder="Ask about your customers..."
                disabled={isLoading}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  paddingRight: "120px",
                  fontSize: "15px",
                  resize: "none",
                  overflow: "hidden",
                  minHeight: "56px",
                  maxHeight: "200px",
                  opacity: isLoading ? 0.5 : 1,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    border: "1px solid #e1e3e5",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#6d7175",
                    cursor: "help",
                  }}
                >
                  <span style={{ opacity: 0.6 }}>⌘</span> <span>↵</span>
                </div>
                <button
                  disabled={!input.trim() || isLoading}
                  onClick={() => handleSend()}
                  style={{
                    padding: "8px",
                    borderRadius: "12px",
                    transition: "all 0.2s",
                    backgroundColor:
                      input.trim() && !isLoading ? "#008060" : "#e1e3e5",
                    color: input.trim() && !isLoading ? "white" : "#babfc3",
                    boxShadow:
                      input.trim() && !isLoading
                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                        : "none",
                    border: "none",
                    cursor:
                      input.trim() && !isLoading ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim() && !isLoading) {
                      e.currentTarget.style.backgroundColor = "#006e52";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (input.trim() && !isLoading) {
                      e.currentTarget.style.backgroundColor = "#008060";
                    }
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
                      strokeWidth="2.5"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <button
                style={{
                  fontSize: "12px",
                  color: "#6d7175",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#202223";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6d7175";
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span>Store Search</span>
              </button>
              <button
                style={{
                  fontSize: "12px",
                  color: "#6d7175",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#202223";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6d7175";
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <span>Deep Insights</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
