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
        title="How it works"
        primaryAction={{
          content: "Got it",
          onAction: () => setShowHowItWorksModal(false),
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text variant="bodyMd" as="p">
              This is a placeholder for the "How it works" content. The actual
              content will be decided later.
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}
