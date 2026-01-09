import { Card, BlockStack, Text } from "@shopify/polaris";

/**
 * Welcome Header Component
 *
 * Displays the main welcome message and app introduction
 */
export function WelcomeHeader() {
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text as="h1" variant="headingLg">
            Welcome to Customer Analytics Buddy
          </Text>

          <Text as="h2" variant="headingMd" tone="subdued">
            Your smart assistant for understanding customers and sending
            powerful campaigns.
          </Text>

          <Text variant="bodyMd" as="p">
            Create precise customer segments with AI and manual filters. Build
            high-converting email lists and detailed reports—all directly in
            Shopify. Start for free.
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
