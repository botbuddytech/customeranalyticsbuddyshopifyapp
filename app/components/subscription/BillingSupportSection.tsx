import { BlockStack, Text, Card, Divider } from "@shopify/polaris";
import { SubscriptionSection } from "./SubscriptionSection";

/**
 * Billing & support section
 */
export function BillingSupportSection() {
  return (
    <SubscriptionSection
      title="Billing & support"
      description="Understand how billing works and where to get help when you need it."
      showDivider
    >
      <Card>
        <BlockStack gap="400">
          {/* Billing */}
          <BlockStack gap="150">
            <Text as="h3" variant="headingSm">
              Billing
            </Text>
            <Text as="p" variant="bodyMd">
              All billing for Customer Analytics Buddy is managed directly by
              Shopify. Any charges for this app will appear on your standard
              Shopify invoice.
            </Text>
          </BlockStack>

          <Divider />

          {/* Support */}
          <BlockStack gap="150">
            <Text as="h3" variant="headingSm">
              Support
            </Text>
            <Text as="p" variant="bodyMd">
              If you have questions about your subscription, plan changes, or
              billing details, our support team is here to help.
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              You can contact support using the options available in the app’s
              Settings page.
            </Text>
          </BlockStack>
        </BlockStack>
      </Card>
    </SubscriptionSection>
  );
}
