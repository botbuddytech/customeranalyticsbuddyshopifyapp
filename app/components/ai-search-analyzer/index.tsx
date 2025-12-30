import { useRef, useState } from "react";
import {
  BlockStack,
  Card,
  InlineStack,
  Text,
  Button,
  Divider,
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
}

/**
 * AI Search & Analyzer Page
 *
 * Main page component that provides a header and renders the search analyzer.
 */
export function AISearchAnalyzerPage({ apiKey, shopInfo }: AISearchAnalyzerPageProps) {
  const [query, setQuery] = useState("");
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
              <Button icon={InfoIcon} variant="plain">
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
        />
      </BlockStack>
    </div>
  );
}
