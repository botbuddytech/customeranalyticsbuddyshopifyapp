import { useState, useCallback, useEffect, useRef } from "react";
import {
  BlockStack,
  Box,
  Text,
  TextField,
  Button,
  Card,
  InlineStack,
  Spinner,
  DataTable,
  Badge,
  Icon,
} from "@shopify/polaris";
import { SendIcon, ChatIcon } from "@shopify/polaris-icons";
import { useFetcher } from "react-router";

interface Customer {
  id: number;
  name: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: string;
  orderCount: number;
  [key: string]: string | number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: {
    explanation?: string;
    results?: Customer[];
    tableRows?: (string | number)[][];
  };
}

interface AISearchAnalyzerProps {
  apiKey: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  externalQuery?: string;
}

/**
 * AI Search Analyzer - Chat Interface
 *
 * Modern chat-style interface similar to ChatGPT/Claude/Cursor
 */
export function AISearchAnalyzer({
  apiKey,
  onSubmitRef,
  externalQuery,
}: AISearchAnalyzerProps) {
  const [query, setQuery] = useState("");

  // Sync external query changes
  useEffect(() => {
    if (externalQuery !== undefined && externalQuery !== query) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const chatFetcher = useFetcher<{
    success: boolean;
    response?: string;
    error?: string;
  }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const processedResponseRef = useRef<string | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const isLoading = chatFetcher.state !== "idle";

  const scrollToBottom = () => {
    // Only scroll within the chat messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
        const responseContent = data.response; // Store in variable to help TypeScript
        // Mark this response as processed
        if (responseKey) {
          processedResponseRef.current = responseKey;
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
          const input = inputWrapperRef.current.querySelector(
            "input, textarea",
          ) as HTMLInputElement | HTMLTextAreaElement | null;
          if (input) {
            input.focus();
          }
        }
      }, 100);
    }
  }, [chatFetcher.state, chatFetcher.data]);

  const handleSubmit = useCallback(() => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query.trim();
    setQuery("");

    // Submit to API route which will call N8N webhook
    const formData = new FormData();
    formData.append("message", currentQuery);
    formData.append("sessionId", sessionId);

    chatFetcher.submit(formData, {
      method: "POST",
      action: "/api/ai-search/chat",
    });

    // Focus will be restored after response is received (handled in useEffect)
  }, [query, isLoading, sessionId, chatFetcher]);

  // Expose handleSubmit via ref if provided
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleSubmit;
    }
  }, [handleSubmit, onSubmitRef]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Last assistant message with data for results section
  const lastResultMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.data?.results?.length);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "24px 16px",
          backgroundColor: "#f9fafb",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        {/* Chat widget */}
        <div
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: "520px",
          }}
        >
          <Card padding="0">
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                padding: "12px 16px",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <InlineStack gap="200" blockAlign="center">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Icon source={ChatIcon} tone="base" />
                </div>
                <div>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    AI Customer Assistant
                  </Text>
                  <div
                    style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}
                  >
                    Ask questions about your customers
                  </div>
                </div>
              </InlineStack>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                padding: "16px",
                minHeight: "260px",
                maxHeight: "460px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                backgroundImage:
                  "radial-gradient(circle at 20px 20px, #f3f4f6 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            >
              <BlockStack gap="300">
                {messages.length === 0 && !isLoading && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        marginBottom: "12px",
                      }}
                    >
                      <Icon source={ChatIcon} tone="base" />
                    </div>
                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="subdued"
                      alignment="center"
                    >
                      Ask a question about your customers to get started
                    </Text>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "user" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "80%",
                            background:
                              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            color: "white",
                            padding: "10px 14px",
                            borderRadius: "16px",
                            borderBottomRightRadius: "4px",
                            fontSize: "13.5px",
                            lineHeight: "1.5",
                            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                          }}
                        >
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "80%",
                            backgroundColor: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            padding: "10px 14px",
                            borderRadius: "16px",
                            borderBottomLeftRadius: "4px",
                            fontSize: "13.5px",
                            lineHeight: "1.5",
                            color: "#374151",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        padding: "10px 14px",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "4px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <InlineStack gap="200" blockAlign="center">
                        <Spinner size="small" />
                        <Text as="span" variant="bodySm" tone="subdued">
                          Analyzing...
                        </Text>
                      </InlineStack>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </BlockStack>
            </div>

            {/* Input */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "12px 14px",
                backgroundColor: "#fafafa",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <InlineStack gap="200" blockAlign="center">
                <Box minWidth="0" width="100%">
                  <div ref={inputWrapperRef} onKeyDown={handleKeyPress}>
                    <TextField
                      label=""
                      labelHidden
                      value={query}
                      onChange={setQuery}
                      placeholder="Ask about your customers..."
                      autoComplete="off"
                      multiline={2}
                      disabled={isLoading}
                    />
                  </div>
                </Box>
                <Button
                  variant="primary"
                  icon={SendIcon}
                  onClick={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading || !query.trim()}
                  tone="success"
                >
                  Send
                </Button>
              </InlineStack>
            </div>
          </Card>
        </div>

        {/* Results area below the chat box */}
        {lastResultMessage && (
          <div
            style={{
              alignSelf: "center",
              width: "100%",
              maxWidth: "900px",
            }}
          >
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <div>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      Customer Results
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Matching customer records
                    </Text>
                  </div>
                  <Badge tone="success" size="medium">
                    {`${lastResultMessage.data?.results?.length ?? 0} found`}
                  </Badge>
                </InlineStack>
                <div
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "numeric",
                    ]}
                    headings={[
                      "Name",
                      "Email",
                      "Last Purchase",
                      "Total Spent",
                      "Orders",
                    ]}
                    rows={lastResultMessage.data?.tableRows || []}
                  />
                </div>
              </BlockStack>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
