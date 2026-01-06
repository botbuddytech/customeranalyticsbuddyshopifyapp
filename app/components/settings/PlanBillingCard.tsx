import { Card, BlockStack, Text, Box } from "@shopify/polaris";

interface PlanBillingCardProps {
  currentPlan: string;
}

const planLabels: Record<string, string> = {
  free: "Free Plan — Basic features",
  basic: "Basic Plan — $29/month",
  growth: "Growth Plan — $79/month",
  enterprise: "Enterprise Plan — $199/month",
};

/**
 * Plan & Billing Settings Card Component
 *
 * Displays read-only current plan and how billing is handled.
 */
export function PlanBillingCard({ currentPlan }: PlanBillingCardProps) {
  const planLabel =
    planLabels[currentPlan] ?? currentPlan ?? "Managed via Shopify billing";

  return (
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
            Plan upgrades, downgrades, and billing are fully managed by Shopify.{" "}
            Use your Shopify admin billing settings to change plans.
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
