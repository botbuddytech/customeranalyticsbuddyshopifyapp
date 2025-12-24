import { BlockStack, Text, Card, Box } from "@shopify/polaris";
import { SubscriptionSection } from "./SubscriptionSection";

interface CurrentPlanSectionProps {
  currentPlan: string | null;
}

/**
 * Current plan section
 * Displays the merchant's current Shopify subscription plan
 */
export function CurrentPlanSection({ currentPlan }: CurrentPlanSectionProps) {
  const planLabel = currentPlan ?? "Managed via Shopify billing";

  return (
    <SubscriptionSection
      title="Current Plan"
      description="Your active subscription for Customer Analytics Buddy."
    >
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            💰 Plan & Billing
          </Text>

          <BlockStack gap="200">
            <Box
              padding="300"
              borderRadius="200"
              background="bg-surface-secondary"
            >
              <Text as="p" variant="bodySm" tone="subdued">
                Current Shopify plan
              </Text>
              <Text as="p" variant="headingSm">
                {planLabel}
              </Text>
            </Box>

            <Text as="p" variant="bodySm" tone="subdued">
              Plan upgrades, downgrades, and billing are fully managed by
              Shopify. Use your Shopify admin billing settings to change plans.
            </Text>
          </BlockStack>
        </BlockStack>
      </Card>
    </SubscriptionSection>
  );
}
