import { Card, BlockStack, Text, FormLayout, Select, Box } from "@shopify/polaris";

interface PlanBillingCardProps {
  selectedPlan: string;
  onPlanChange: (value: string) => void;
}

const planOptions = [
  { label: "Free Plan - Basic features", value: "free" },
  { label: "Basic Plan - $29/month", value: "basic" },
  { label: "Growth Plan - $79/month", value: "growth" },
  { label: "Enterprise Plan - $199/month", value: "enterprise" },
];

/**
 * Plan & Billing Settings Card Component
 * 
 * Displays plan selection and billing information
 */
export function PlanBillingCard({
  selectedPlan,
  onPlanChange,
}: PlanBillingCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          💰 Plan & Billing
        </Text>

        <FormLayout>
          <Select
            label="Current Plan"
            options={planOptions}
            value={selectedPlan}
            onChange={onPlanChange}
          />

          {selectedPlan !== "free" && (
            <Box
              background="bg-surface-info"
              padding="300"
              borderRadius="200"
            >
              <Text as="p" variant="bodySm">
                💡 Changes apply to your next billing cycle
              </Text>
            </Box>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
}

