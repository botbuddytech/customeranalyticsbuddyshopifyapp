import { BlockStack } from "@shopify/polaris";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { PlanOptionsSection } from "./PlanOptionsSection";
import { BillingSupportSection } from "./BillingSupportSection";

/**
 * Full Subscription page content
 *
 * Composes the individual sections into a single page.
 */
export function SubscriptionPageContent() {
  return (
    <BlockStack gap="600">
      <CurrentPlanSection />
      <PlanOptionsSection />
      <BillingSupportSection />
    </BlockStack>
  );
}
