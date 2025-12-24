import {
  BlockStack,
  InlineStack,
  Text,
  Card,
  Button,
  Badge,
  Box,
} from "@shopify/polaris";
import { SubscriptionSection } from "./SubscriptionSection";
import type { SubscriptionPlan, SubscriptionPlanBenefit } from "@prisma/client";

type PlanWithBenefits = SubscriptionPlan & {
  benefits: SubscriptionPlanBenefit[];
};

interface PlanOptionsSectionProps {
  plans: PlanWithBenefits[];
}

export function PlanOptionsSection({ plans }: PlanOptionsSectionProps) {
  return (
    <SubscriptionSection
      title="Plan options"
      description="Choose the plan that best fits your store as you scale your customer analytics and campaigns."
    >
      <BlockStack gap="400">
        <InlineStack gap="400" wrap>
          {plans.map((plan) => (
            <Box key={plan.id} minWidth="260px" maxWidth="360px">
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  {/* Header */}
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        {plan.name}
                      </Text>
                      {plan.badgeTone && plan.badgeLabel && (
                        <Badge
                          tone={
                            plan.badgeTone as "success" | "attention" | "info"
                          }
                        >
                          {plan.badgeLabel}
                        </Badge>
                      )}
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {plan.description}
                    </Text>
                  </BlockStack>

                  {/* Price */}
                  <BlockStack gap="050">
                    <Text as="p" variant="headingLg">
                      {plan.price}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {plan.priceNote}
                    </Text>
                  </BlockStack>

                  {/* Features from Prisma benefits */}
                  <BlockStack gap="100">
                    {plan.benefits.map((benefit) => (
                      <Text key={benefit.id} as="p" variant="bodySm">
                        • {benefit.label}
                      </Text>
                    ))}
                  </BlockStack>

                  {/* CTA */}
                  <Button
                    fullWidth
                    variant={
                      plan.primaryCtaVariant as
                        | "primary"
                        | "secondary"
                        | "plain"
                    }
                    disabled={plan.isCurrentDefault}
                    onClick={() => {
                      // Navigate to Shopify billing settings page
                      // Open in new tab to ensure it works in embedded apps
                      window.open("/settings/billing", "_blank");
                    }}
                  >
                    {plan.primaryCtaLabel}
                  </Button>
                </BlockStack>
              </Card>
            </Box>
          ))}
        </InlineStack>
      </BlockStack>
    </SubscriptionSection>
  );
}
