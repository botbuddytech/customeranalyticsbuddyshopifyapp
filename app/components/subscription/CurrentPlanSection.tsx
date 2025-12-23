import {
  BlockStack,
  InlineStack,
  Text,
  Divider,
  Card,
  Button,
  Badge,
  Box,
} from "@shopify/polaris";
import { SubscriptionSection } from "./SubscriptionSection";

/**
 * Current plan section
 */
export function CurrentPlanSection() {
  return (
    <SubscriptionSection
      title="Current Plan"
      description="Your active subscription for Customer Analytics Buddy."
    >
      <Card>
        <BlockStack gap="400">
          {/* Header */}
          <InlineStack align="space-between" blockAlign="start">
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h3" variant="headingMd">
                  Growth Plan
                </Text>
                <Badge tone="success">Active</Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                Managed and billed through Shopify.
              </Text>
            </BlockStack>

            <Button variant="secondary" disabled>
              Manage billing
            </Button>
          </InlineStack>

          <Divider />

          {/* Billing stats */}
          <InlineStack gap="600" wrap>
            <Box minWidth="160px">
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" tone="subdued">
                  Next billing date
                </Text>
                <Text as="p" variant="headingSm">
                  Determined by Shopify
                </Text>
              </BlockStack>
            </Box>

            <Box minWidth="160px">
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" tone="subdued">
                  Monthly price
                </Text>
                <Text as="p" variant="headingSm">
                  As per Shopify plan
                </Text>
              </BlockStack>
            </Box>
          </InlineStack>

          {/* Helper text */}
          <Text as="p" variant="bodySm" tone="subdued">
            Any plan changes, upgrades, or cancellations must be completed from
            your Shopify billing settings.
          </Text>
        </BlockStack>
      </Card>
    </SubscriptionSection>
  );
}
