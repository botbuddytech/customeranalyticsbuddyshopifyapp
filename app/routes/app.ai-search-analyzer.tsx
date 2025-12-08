import React, { useState, useCallback, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Grid,
  InlineStack,
  Spinner,
  Text,
  TextField,
  Badge,
  DataTable,
  EmptyState,
  Banner,
  Page,
  Icon,
  Divider,
  Layout,
  Popover
} from "@shopify/polaris";
import {
  SearchIcon,
  SaveIcon,
  InfoIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Define the loader data type
interface LoaderData {
  apiKey: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.OPENAI_API_KEY || "demo-mode"
  };
};

// Define customer type
interface Customer {
  id: number;
  name: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: string;
  orderCount: number;
  [key: string]: string | number; // Index signature for dynamic access
}

// Main component for the route
export default function AISearchAnalyzerPage() {
  const { apiKey } = useLoaderData<LoaderData>();

  return (
    <Page fullWidth>
      <TitleBar title="AI Search & Analyzer" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="800">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingXl">AI Search & Analyzer</Text>
                  <InlineStack gap="200">
                    <Button icon={InfoIcon}>How it works</Button>
                  </InlineStack>
                </InlineStack>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Use natural language to search and analyze your customer data. Ask questions like "Who are my best customers?" or "Which customers haven't ordered recently?"
                </Text>
                <Divider />
              </BlockStack>
            </Card>
            <AISearchAnalyzer apiKey={apiKey} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// AISearchAnalyzer component
function AISearchAnalyzer({ apiKey }: { apiKey: string }) {
  // State for the query input
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Customer[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [activeTab, setActiveTab] = useState('segmentation');
  const [showPrebuiltQueries, setShowPrebuiltQueries] = useState(true);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");

  // Handle query input change
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Handle query submission
  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;

    setIsLoading(true);
    setProcessingSteps([]);
    setExplanation("");
    setHasResults(false);

    // Simulate processing steps
    const steps = [
      "Analyzing query...",
      "Identifying customer attributes...",
      "Building database query...",
      "Fetching matching customers...",
      "Preparing results..."
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setProcessingSteps(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
        // Generate mock results based on the query
        generateMockResults(query);
      }
    }, 800);
  }, [query]);

  // Generate mock results based on the query
  const generateMockResults = (query: string) => {
    // Mock data generation
    const mockCustomers: Customer[] = [];
    let filter: any = {};
    let explanationParts: string[] = [];

    // Simple query parsing for demo
    if (query.toLowerCase().includes("best customers")) {
      filter.totalSpent = { gt: 500 };
      explanationParts.push("customers who have spent the most money");
    } else if (query.toLowerCase().includes("haven't ordered") || query.toLowerCase().includes("inactive")) {
      filter.lastPurchaseDate = { lt: "2023-01-01" };
      explanationParts.push("customers who haven't placed an order recently");
    } else if (query.toLowerCase().includes("new customers")) {
      filter.orderCount = { eq: 1 };
      explanationParts.push("customers who have only placed one order");
    } else if (query.toLowerCase().includes("loyal") || query.toLowerCase().includes("repeat")) {
      filter.orderCount = { gt: 3 };
      explanationParts.push("customers who have placed multiple orders");
    }

    // More specific filters - these augment the existing filter instead of replacing it
    if (query.toLowerCase().includes("90 days")) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      filter.lastPurchaseDate = { lt: cutoffDate.toISOString().split('T')[0] };
      explanationParts.push("haven't ordered in the last 90 days");
    } else if (query.toLowerCase().includes("30 days")) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      filter.lastPurchaseDate = { lt: cutoffDate.toISOString().split('T')[0] };
      explanationParts.push("haven't ordered in the last 30 days");
    }

    if (query.toLowerCase().includes("$1000") || query.toLowerCase().includes("1000 dollars")) {
      // Merge with existing totalSpent filter if present
      if (filter.totalSpent?.gt) {
        filter.totalSpent.gt = Math.max(filter.totalSpent.gt, 1000);
      } else {
        filter.totalSpent = { gt: 1000 };
      }
      explanationParts.push("spent more than $1,000");
    }

    if (query.toLowerCase().includes("5 orders")) {
      // Merge with existing orderCount filter if present
      if (filter.orderCount?.gt) {
        filter.orderCount.gt = Math.max(filter.orderCount.gt, 5);
      } else if (!filter.orderCount?.eq) {
        // Only set if we don't have an equality check
        filter.orderCount = { gt: 5 };
      }
      explanationParts.push("placed more than 5 orders");
    }

    // Build final explanation
    const explanation = explanationParts.length > 0
      ? "Finding " + explanationParts.join(" and ")
      : "Analyzing all customers";

    // Generate 10 mock customers
    for (let i = 1; i <= 10; i++) {
      const lastPurchaseDate = new Date();
      lastPurchaseDate.setDate(lastPurchaseDate.getDate() - Math.floor(Math.random() * 365));

      const orderCount = Math.floor(Math.random() * 10) + 1;
      const totalSpent = (Math.random() * 2000).toFixed(2);

      mockCustomers.push({
        id: i,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        lastPurchaseDate: lastPurchaseDate.toISOString().split('T')[0],
        totalSpent: `$${totalSpent}`,
        orderCount
      });
    }

    // Filter the mock customers based on the query
    let filteredCustomers = mockCustomers;

    if (filter.totalSpent?.gt) {
      filteredCustomers = filteredCustomers.filter(c =>
        parseFloat(c.totalSpent.replace('$', '')) > filter.totalSpent.gt
      );
    }

    if (filter.orderCount?.gt) {
      filteredCustomers = filteredCustomers.filter(c =>
        c.orderCount > filter.orderCount.gt
      );
    }

    if (filter.orderCount?.eq) {
      filteredCustomers = filteredCustomers.filter(c =>
        c.orderCount === filter.orderCount.eq
      );
    }

    if (filter.lastPurchaseDate?.lt) {
      filteredCustomers = filteredCustomers.filter(c =>
        c.lastPurchaseDate < filter.lastPurchaseDate.lt
      );
    }

    // Set the results and explanation
    setResults(filteredCustomers);
    setExplanation(explanation);
    setIsLoading(false);
    setShowPrebuiltQueries(false);
  };

  // Prepare data for the results table
  const tableRows = results.map(customer => [
    customer.name,
    customer.email,
    customer.lastPurchaseDate,
    customer.totalSpent,
    customer.orderCount.toString()
  ]);

  // Define tabs for query categories
  const tabs = [
    {
      id: 'segmentation',
      content: 'Customer Segmentation Queries',
    },
    {
      id: 'behavior',
      content: 'Behavior Analysis Queries',
    },
    {
      id: 'revenue',
      content: 'Revenue and ROI Queries',
    },
    {
      id: 'predictive',
      content: 'Predictive Queries',
    },
  ];

  // Update hasResults when results change
  useEffect(() => {
    if (results.length > 0) {
      setHasResults(true);
    }
  }, [results]);

  return (
    <BlockStack gap="600">
      {/* Search Query Card */}
      <Card padding="500">
        <BlockStack gap="500">
          <InlineStack align="space-between">
            <Text as="h2" variant="headingLg">Ask about your customers</Text>
            <Badge tone="info">AI-Powered</Badge>
          </InlineStack>

          <TextField
            label=""
            labelHidden
            value={query}
            onChange={handleQueryChange}
            placeholder="Try: 'Which customers haven't ordered in the last 90 days?'"
            autoComplete="off"
            multiline={3}
            showCharacterCount
            maxLength={200}
          />

          <InlineStack align="end">
            <Button
              variant="primary"
              icon={SearchIcon}
              onClick={() => handleSubmit()}
              loading={isLoading}
              disabled={isLoading}
              size="large"
            >
              See Results
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Pre-built Queries Section */}
      {showPrebuiltQueries && (
        <Card padding="500">
          <BlockStack gap="500">
            <Text as="h2" variant="headingLg">Select a pre-built query to get started quickly</Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Choose from our curated collection of customer analysis queries organized by category
            </Text>

            {/* 4-Column Grid Layout */}
            <Grid>
              {/* Customer Segmentation Queries */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                <Card background="bg-surface-secondary" padding="400">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      🎯 Customer Segmentation
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Identify and group customers by value, behavior, and characteristics
                    </Text>
                    <Divider />
                    <BlockStack gap="200">
                      <Button
                        onClick={() => {
                          setQuery("Who are my high-value customers that have spent over $1000?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        💎 High-value customers ($1000+)
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers have made more than 5 orders?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🔄 Frequent buyers (5+ orders)
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my new customers from the last 30 days?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        ✨ New customers (last 30 days)
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers are my VIP members with highest lifetime value?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        👑 VIP customers (highest LTV)
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my one-time buyers that could become repeat customers?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🎯 One-time buyers (conversion potential)
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>

              {/* Behavior Analysis Queries */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                <Card background="bg-surface-secondary" padding="400">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      📊 Behavior Analysis
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Understand customer patterns, engagement, and shopping habits
                    </Text>
                    <Divider />
                    <BlockStack gap="200">
                      <Button
                        onClick={() => {
                          setQuery("Which customers haven't ordered in the last 90 days?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        😴 Inactive customers (90+ days)
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my repeat customers that order at least once a month?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🔄 Monthly repeat buyers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers have abandoned their carts recently?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🛒 Recent cart abandoners
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my seasonal shoppers that only buy during holidays?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🎄 Seasonal shoppers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers browse frequently but rarely purchase?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        👀 High browsers, low buyers
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>

              {/* Revenue and ROI Queries */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                <Card background="bg-surface-secondary" padding="400">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      💰 Revenue & ROI
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Analyze revenue patterns, profitability, and return on investment
                    </Text>
                    <Divider />
                    <BlockStack gap="200">
                      <Button
                        onClick={() => {
                          setQuery("Which customers generate the highest profit margins?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        📈 Highest profit margin customers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my customers with declining purchase amounts?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        📉 Declining spend customers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers have the best return on marketing investment?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🎯 Best marketing ROI customers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my customers that buy premium products consistently?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        💎 Premium product buyers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers have increased their spending over time?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        📊 Growing spend customers
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>

              {/* Predictive Queries */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                <Card background="bg-surface-secondary" padding="400">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      🔮 Predictive Analysis
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Forecast future behavior and identify at-risk customers
                    </Text>
                    <Divider />
                    <BlockStack gap="200">
                      <Button
                        onClick={() => {
                          setQuery("Which customers are at risk of churning based on their behavior?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        ⚠️ Churn risk customers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my customers likely to make their next purchase soon?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🎯 Ready-to-buy customers
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers might be interested in upselling opportunities?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        ⬆️ Upselling candidates
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Who are my customers with potential for cross-selling?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🔄 Cross-selling opportunities
                      </Button>
                      <Button
                        onClick={() => {
                          setQuery("Which customers are likely to become brand advocates?");
                          handleSubmit();
                        }}
                        variant="plain"
                        textAlign="left"
                        size="slim"
                      >
                        🌟 Future brand advocates
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>
          </BlockStack>
        </Card>
      )}

      {/* Processing Steps */}
      {isLoading && processingSteps.length > 0 && (
        <Card padding="500">
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center">
              <Spinner size="small" />
              <Text as="h2" variant="headingMd">Processing your query</Text>
            </InlineStack>

            <BlockStack gap="200">
              {processingSteps.map((step, index) => (
                <Text key={index} as="p" variant="bodyMd">
                  {step}
                </Text>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      )}

      {/* Results Section */}
      {hasResults && (
        <Card padding="500">
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingLg">Results</Text>
              <Badge tone="success">{`${results.length} customers found`}</Badge>
            </InlineStack>

            {explanation && (
              <Banner tone="info">
                <p>{explanation}</p>
              </Banner>
            )}

            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'numeric',
              ]}
              headings={[
                'Name',
                'Email',
                'Last Purchase',
                'Total Spent',
                'Orders',
              ]}
              rows={tableRows}
            />

            <InlineStack align="end" gap="200">
              <Button icon={SaveIcon}>
                Save Segment
              </Button>
              <Button variant="primary">
                Export Results
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
