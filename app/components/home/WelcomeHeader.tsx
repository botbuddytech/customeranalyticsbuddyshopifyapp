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
            Use AI or manual filters to create high-converting segments or email
            messages — all in one place.
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
