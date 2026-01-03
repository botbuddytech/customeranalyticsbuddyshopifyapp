import {
  BlockStack,
  InlineStack,
  Text,
  Card,
  Button,
  Badge,
} from "@shopify/polaris";
import { useEffect, useRef, useCallback } from "react";
import { SubscriptionSection } from "./SubscriptionSection";
import type { SubscriptionPlan, SubscriptionPlanBenefit } from "@prisma/client";

type PlanWithBenefits = SubscriptionPlan & {
  benefits: SubscriptionPlanBenefit[];
};

interface PlanOptionsSectionProps {
  plans: PlanWithBenefits[];
  currentPlan: string | null;
}

export function PlanOptionsSection({
  plans,
  currentPlan,
}: PlanOptionsSectionProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const calculateHeights = useCallback(() => {
    const validRefs = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (validRefs.length === 0) return;

    // Reset heights first to get accurate measurements
    validRefs.forEach((ref) => {
      ref.style.height = "auto";
    });

    // Calculate max height of the entire card wrapper
    const heights = validRefs.map((ref) => ref.scrollHeight);
    const maxHeight = Math.max(...heights);

    // Apply max height to all card wrappers
    validRefs.forEach((ref) => {
      ref.style.height = `${maxHeight}px`;
    });
  }, []);

  useEffect(() => {
    // Calculate heights after a short delay to ensure Polaris components are fully rendered
    const timeoutId = setTimeout(() => {
      // Use double requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(calculateHeights);
      });
    }, 100);

    // Debounce resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(calculateHeights);
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateHeights, plans]);

  return (
    <SubscriptionSection
      title="Plan options"
      description="Choose the plan that best fits your store as you scale your customer analytics and campaigns."
    >
      <style>{`
        .pricing-cards-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
          align-items: start;
        }
        @media (max-width: 1200px) {
          .pricing-cards-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .pricing-cards-container {
            grid-template-columns: 1fr;
          }
        }
        .pricing-card-wrapper {
          display: flex;
          flex-direction: column;
        }
        .pricing-card-wrapper > div {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .pricing-card-wrapper [class*="Card"] {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .pricing-card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex: 1;
        }
        .pricing-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .pricing-cta {
          margin-top: auto;
          padding-top: 1rem;
          flex-shrink: 0;
        }
      `}</style>
      <div className="pricing-cards-container">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className="pricing-card-wrapper"
            ref={(el) => (cardRefs.current[index] = el)}
          >
            <Card roundedAbove="sm">
              <div className="pricing-card-inner">
                <div className="pricing-content">
                  <BlockStack gap="400">
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

                    <BlockStack gap="050">
                      <Text as="p" variant="headingLg">
                        {plan.price}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {plan.priceNote}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      {plan.benefits.map((benefit) => (
                        <Text key={benefit.id} as="p" variant="bodySm">
                          • {benefit.label}
                        </Text>
                      ))}
                    </BlockStack>
                  </BlockStack>
                </div>

                <div className="pricing-cta">
                  {(() => {
                    const isCurrentPlan = currentPlan
                      ? plan.name.toLowerCase() === currentPlan.toLowerCase() ||
                        plan.code.toLowerCase() === currentPlan.toLowerCase()
                      : false;
                    return (
                      <Button
                        fullWidth
                        variant={
                          plan.primaryCtaVariant as
                            | "primary"
                            | "secondary"
                            | "plain"
                        }
                        disabled={plan.isCurrentDefault || isCurrentPlan}
                        onClick={() => {
                          window.open("/settings/billing", "_top");
                        }}
                      >
                        {isCurrentPlan ? "Current plan" : "Upgrade via Shopify"}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </SubscriptionSection>
  );
}
