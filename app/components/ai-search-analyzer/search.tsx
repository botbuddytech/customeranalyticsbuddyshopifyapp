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
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
          gap: "20px",
          padding: "40px 20px",
          backgroundColor: "#f6f6f7",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        {/* Chat widget (like Crisp) */}
        <div
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: "520px",
          }}
        >
          <Card>
            {/* Header */}
            <div
              style={{
                backgroundColor: "#0070f3",
                color: "white",
                padding: "10px 14px",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="bodySm" fontWeight="semibold">
                  AI Customer Assistant
                </Text>
              </InlineStack>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                padding: "12px 14px",
                minHeight: "260px",
                maxHeight: "460px",
                overflowY: "auto",
                backgroundColor: "white",
              }}
            >
              <BlockStack gap="300">
                {messages.length === 0 && !isLoading && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Ask a question about your customers to get started.
                  </Text>
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
                            backgroundColor: "#0070f3",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "16px",
                            borderBottomRightRadius: "4px",
                            fontSize: "13px",
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
                            backgroundColor: "#f3f4f6",
                            padding: "8px 12px",
                            borderRadius: "16px",
                            borderBottomLeftRadius: "4px",
                            fontSize: "13px",
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
                        backgroundColor: "#f3f4f6",
                        padding: "8px 12px",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "4px",
                        fontSize: "13px",
                      }}
                    >
                      <InlineStack gap="200" blockAlign="center">
                        <Spinner size="small" />
                        <Text as="span" variant="bodySm" tone="subdued">
                          Analyzing your query...
                        </Text>
                      </InlineStack>
                      {processingSteps.length > 0 && (
                        <Box paddingBlockStart="200">
                          <BlockStack gap="050">
                            {processingSteps.map((step, index) => (
                              <Text
                                key={`step-${index}`}
                                as="p"
                                variant="bodyXs"
                                tone="subdued"
                              >
                                • {step}
                              </Text>
                            ))}
                          </BlockStack>
                        </Box>
                      )}
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
                padding: "10px 12px",
                backgroundColor: "white",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <InlineStack gap="200" blockAlign="center">
                <Box minWidth="0" width="100%">
                  <div onKeyDown={handleKeyPress}>
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
                >
                  Send
                </Button>
              </InlineStack>
            </div>
          </Card>
        </div>

        {/* Results area below the chat box */}
        {lastResultMessage && (
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  Results
                </Text>
                <Badge tone="success">
                  {`${lastResultMessage.data?.results?.length ?? 0} found`}
                </Badge>
              </InlineStack>
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "numeric"]}
                headings={[
                  "Name",
                  "Email",
                  "Last Purchase",
                  "Total Spent",
                  "Orders",
                ]}
                rows={lastResultMessage.data?.tableRows || []}
              />
            </BlockStack>
          </Card>
        )}

        {/* Prebuilt queries below everything */}
        <Card>
          <PrebuiltQueriesCard
            visible={true}
            setQuery={setQuery}
            onSubmit={handleSubmit}
          />
        </Card>
      </div>
    </>
  );
}
