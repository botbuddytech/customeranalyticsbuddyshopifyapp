import { BlockStack } from "@shopify/polaris";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { PlanOptionsSection } from "./PlanOptionsSection";
import { BillingSupportSection } from "./BillingSupportSection";
import type { SubscriptionPlan, SubscriptionPlanBenefit } from "@prisma/client";

type PlanWithBenefits = SubscriptionPlan & {
  benefits: SubscriptionPlanBenefit[];
};

interface SubscriptionPageContentProps {
  plans: PlanWithBenefits[];
  currentPlan: string | null;
}

/**
 * Full Subscription page content
 *
 * Composes the individual sections into a single page.
 */
export function SubscriptionPageContent({
  plans,
  currentPlan,
}: SubscriptionPageContentProps) {
  return (
    <BlockStack gap="600">
      <CurrentPlanSection currentPlan={currentPlan} />
      <PlanOptionsSection plans={plans} currentPlan={currentPlan} />
      <BillingSupportSection />
    </BlockStack>
  );
}
