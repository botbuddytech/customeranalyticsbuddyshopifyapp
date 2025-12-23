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
import { SUBSCRIPTION_PLANS } from "./planConfig";

export function PlanOptionsSection() {
  return (
    <SubscriptionSection
      title="Plan options"
      description="Choose the plan that best fits your store as you scale your customer analytics and campaigns."
    >
      <BlockStack gap="400">
        <InlineStack gap="400" wrap>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Box key={plan.id} minWidth="260px" maxWidth="360px">
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  {/* Header */}
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        {plan.name}
                      </Text>
                      {plan.badge && (
                        <Badge tone={plan.badge.tone}>{plan.badge.label}</Badge>
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

                  {/* Features */}
                  <BlockStack gap="100">
                    {plan.features.map((feature) => (
                      <Text key={feature} as="p" variant="bodySm">
                        • {feature}
                      </Text>
                    ))}
                  </BlockStack>

                  {/* CTA */}
                  <Button fullWidth variant={plan.primaryCtaVariant} disabled>
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
