import { useRef, useState } from "react";
import {
  BlockStack,
  Card,
  InlineStack,
  Text,
  Button,
  Divider,
  Modal,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";
import { AISearchAnalyzer } from "./search";

interface AISearchAnalyzerPageProps {
  apiKey: string;
  shopInfo: {
    name: string;
    email: string;
    shop: string;
  };
  history: any[];
}

/**
 * AI Search & Analyzer Page
 *
 * Main page component that provides a header and renders the search analyzer.
 */
export function AISearchAnalyzerPage({
  apiKey,
  shopInfo,
  history,
}: AISearchAnalyzerPageProps) {
  const [query, setQuery] = useState("");
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const onSubmitRef = useRef<(() => void) | null>(null);

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <BlockStack gap="600">
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="h2" variant="headingXl">
                  AI Search & Analyzer
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Ask questions in plain English to find and analyze your
                  customers. No complex filters needed.
                </Text>
              </BlockStack>
              <Button
                icon={InfoIcon}
                variant="plain"
                onClick={() => setShowHowItWorksModal(true)}
              >
                How it works
              </Button>
            </InlineStack>
            <Divider />
          </BlockStack>
        </Card>

        <AISearchAnalyzer
          apiKey={apiKey}
          onSubmitRef={onSubmitRef}
          externalQuery={query}
          shopInfo={shopInfo}
          initialHistory={history}
        />
      </BlockStack>

      {/* How it works Modal */}
      <Modal
        open={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        title="How AI Search & Analyzer Works"
        primaryAction={{
          content: "Got it",
          onAction: () => setShowHowItWorksModal(false),
        }}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Ask questions in plain English
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Simply type your question in the chat, like "Show me customers
                who spent over $1000" or "Find inactive customers from the last
                90 days". No need to learn complex filters or query syntax.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                AI generates and executes queries
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Our AI understands your question, converts it into a GraphQL
                query, and automatically executes it against your Shopify data.
                Results appear in a table below the chat.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                View and export results
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Review the customer data in the results table. Export your lists
                as PDF, CSV, or Excel files for use in marketing campaigns or
                further analysis.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Key Features
              </Text>
              <BlockStack gap="200">
                <Text variant="bodySm" as="p" tone="subdued">
                  • <strong>Chat History:</strong> Access previous conversations
                  from the sidebar
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  • <strong>Pre-built Queries:</strong> Use suggested queries
                  for common use cases
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  • <strong>Multiple Sessions:</strong> Start new chats to
                  explore different questions
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  • <strong>Smart Analysis:</strong> Get insights about customer
                  segments, behavior, and revenue
                </Text>
              </BlockStack>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Example Questions
              </Text>
              <BlockStack gap="200">
                <Text variant="bodySm" as="p" tone="subdued">
                  • "Who are my high-value customers that spent over $1000?"
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  • "Show me customers who haven't ordered in 90 days"
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  • "Find all customers from New York with more than 3 orders"
                </Text>
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}
