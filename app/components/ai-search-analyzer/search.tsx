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
} from "@shopify/polaris";
import { SendIcon } from "@shopify/polaris-icons";
import { PrebuiltQueriesCard } from "./PrebuiltQueriesCard";

// Hide scrollbar styles
const hideScrollbarStyle = `
  .chat-messages-container::-webkit-scrollbar {
    display: none;
  }
  .chat-messages-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

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
}

/**
 * AI Search Analyzer - Chat Interface
 *
 * Modern chat-style interface similar to ChatGPT/Claude/Cursor
 */
export function AISearchAnalyzer({ apiKey }: AISearchAnalyzerProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPrebuiltQueries, setShowPrebuiltQueries] = useState(true);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll the window to show the latest message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
    // Also scroll the page if needed
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, processingSteps, isLoading]);

  const handleSubmit = useCallback(() => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    setProcessingSteps([]);
    setShowPrebuiltQueries(false);

    const steps = [
      "Understanding your question",
      "Identifying relevant customer attributes",
      "Querying your store data",
      "Analyzing results",
      "Finalizing response",
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setProcessingSteps((prev) => [...prev, steps[currentStep]]);
        currentStep += 1;
      } else {
        clearInterval(stepInterval);
        generateMockResults(userMessage.content);
      }
    }, 700);
  }, [query, isLoading]);

  const generateMockResults = (rawQuery: string) => {
    const mockCustomers: Customer[] = [];
    const filter: any = {};
    const explanationParts: string[] = [];

    const lower = rawQuery.toLowerCase();

    if (lower.includes("best customers")) {
      filter.totalSpent = { gt: 500 };
      explanationParts.push("customers who have spent the most money");
    } else if (
      lower.includes("haven't ordered") ||
      lower.includes("inactive")
    ) {
      filter.lastPurchaseDate = { lt: "2023-01-01" };
      explanationParts.push("customers who haven't placed an order recently");
    } else if (lower.includes("new customers")) {
      filter.orderCount = { eq: 1 };
      explanationParts.push("customers who have only placed one order");
    } else if (lower.includes("loyal") || lower.includes("repeat")) {
      filter.orderCount = { gt: 3 };
      explanationParts.push("customers who have placed multiple orders");
    }

    if (lower.includes("90 days")) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      filter.lastPurchaseDate = { lt: cutoff.toISOString().split("T")[0] };
      explanationParts.push("haven't ordered in the last 90 days");
    }

    if (lower.includes("$1000")) {
      filter.totalSpent = { gt: 1000 };
      explanationParts.push("spent more than $1,000");
    }

    const explanationText =
      explanationParts.length > 0
        ? `I found ${explanationParts.join(" and ")}.`
        : "I analyzed all customers in your store.";

    for (let i = 1; i <= 10; i += 1) {
      const lastPurchaseDate = new Date();
      lastPurchaseDate.setDate(
        lastPurchaseDate.getDate() - Math.floor(Math.random() * 365),
      );

      mockCustomers.push({
        id: i,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        lastPurchaseDate: lastPurchaseDate.toISOString().split("T")[0],
        totalSpent: `$${(Math.random() * 2000).toFixed(2)}`,
        orderCount: Math.floor(Math.random() * 10) + 1,
      });
    }

    let filtered = mockCustomers;

    if (filter.totalSpent?.gt) {
      filtered = filtered.filter(
        (c) => parseFloat(c.totalSpent.replace("$", "")) > filter.totalSpent.gt,
      );
    }

    if (filter.orderCount?.gt) {
      filtered = filtered.filter((c) => c.orderCount > filter.orderCount.gt);
    }

    if (filter.orderCount?.eq) {
      filtered = filtered.filter((c) => c.orderCount === filter.orderCount.eq);
    }

    if (filter.lastPurchaseDate?.lt) {
      filtered = filtered.filter(
        (c) => c.lastPurchaseDate < filter.lastPurchaseDate.lt,
      );
    }

    const tableRows = filtered.map((customer) => [
      customer.name,
      customer.email,
      customer.lastPurchaseDate,
      customer.totalSpent,
      customer.orderCount.toString(),
    ]);

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: explanationText,
      timestamp: new Date(),
      data: {
        explanation: explanationText,
        results: filtered,
        tableRows,
      },
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setProcessingSteps([]);
    setIsLoading(false);
  };

  const handlePrebuiltQuery = useCallback((q: string) => {
    setQuery(q);
    // Small delay to ensure state is updated
    setTimeout(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
      });
      // Trigger submit after setting query
    }, 0);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show initial state (search box + prebuilt queries) when no messages
  const showInitialState = messages.length === 0 && !isLoading;

  return (
    <>
      <style>{hideScrollbarStyle}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 200px)",
          width: "100%",
        }}
      >
        {showInitialState ? (
          /* Initial State: Search Box at Top/Center */
          <div
            style={{
              flex: 1,
              padding: "40px 20px 20px 20px",
              backgroundColor: "#f6f6f7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {/* Search Box - Centered */}
            <div style={{ maxWidth: "800px", width: "100%" }}>
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg" alignment="center">
                    Ask about your customers
                  </Text>
                  <Text
                    as="p"
                    variant="bodyMd"
                    tone="subdued"
                    alignment="center"
                  >
                    Use natural language to find and analyze your customer data
                  </Text>
                  <div onKeyDown={handleKeyPress}>
                    <TextField
                      label=""
                      labelHidden
                      value={query}
                      onChange={setQuery}
                      placeholder="Example: Which customers haven't ordered in the last 90 days?"
                      autoComplete="off"
                      multiline={3}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    variant="primary"
                    icon={SendIcon}
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading || !query.trim()}
                    size="large"
                    fullWidth
                  >
                    Search customers
                  </Button>
                </BlockStack>
              </Card>
            </div>
          </div>
        ) : (
          /* Chat View: Messages with Fixed Input at Bottom */
          <>
            {/* Chat Messages Area - Expands with content */}
            <div
              ref={chatContainerRef}
              style={{
                width: "100%",
                padding: "20px",
                backgroundColor: "#f6f6f7",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <BlockStack gap="400">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "user" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "75%",
                            backgroundColor: "#0070f3",
                            color: "white",
                            padding: "12px 16px",
                            borderRadius: "18px",
                            borderBottomRightRadius: "4px",
                          }}
                        >
                          <Text as="p" variant="bodyMd" tone="base">
                            {message.content}
                          </Text>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "85%",
                            backgroundColor: "white",
                            padding: "16px",
                            borderRadius: "18px",
                            borderBottomLeftRadius: "4px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}
                        >
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">
                              {message.content}
                            </Text>
                            {message.data?.results &&
                              message.data.results.length > 0 && (
                                <BlockStack gap="300">
                                  <InlineStack
                                    align="space-between"
                                    blockAlign="center"
                                  >
                                    <Text
                                      as="p"
                                      variant="bodySm"
                                      fontWeight="semibold"
                                    >
                                      Results
                                    </Text>
                                    <Badge tone="success">
                                      {`${message.data.results.length} found`}
                                    </Badge>
                                  </InlineStack>
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
                                    rows={message.data.tableRows || []}
                                  />
                                </BlockStack>
                              )}
                          </BlockStack>
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
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "18px",
                        borderBottomLeftRadius: "4px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <Spinner size="small" />
                          <Text as="p" variant="bodySm" tone="subdued">
                            Analyzing your query...
                          </Text>
                        </InlineStack>
                        {processingSteps.length > 0 && (
                          <Box paddingInlineStart="300">
                            <BlockStack gap="100">
                              {processingSteps.map((step, index) => (
                                <Text
                                  key={`step-${index}`}
                                  as="p"
                                  variant="bodySm"
                                  tone="subdued"
                                >
                                  • {step}
                                </Text>
                              ))}
                            </BlockStack>
                          </Box>
                        )}
                      </BlockStack>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </BlockStack>
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "white",
                padding: "16px 20px",
              }}
            >
              <Card>
                <InlineStack gap="200" blockAlign="end">
                  <Box minWidth="0" width="100%">
                    <div onKeyDown={handleKeyPress}>
                      <TextField
                        label=""
                        labelHidden
                        value={query}
                        onChange={setQuery}
                        placeholder="Ask about your customers... (e.g., Which customers haven't ordered in the last 90 days?)"
                        autoComplete="off"
                        multiline={3}
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
                    size="large"
                  >
                    Send
                  </Button>
                </InlineStack>
              </Card>
            </div>
          </>
        )}

        {/* Prebuilt Queries Footer - Always at Bottom */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f6f6f7",
            padding: "20px",
            flexShrink: 0,
            width: "100%",
          }}
        >
          <PrebuiltQueriesCard
            visible={true}
            setQuery={setQuery}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
}
