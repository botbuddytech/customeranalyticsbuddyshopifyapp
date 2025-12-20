import { Layout, BlockStack, Text, InlineGrid } from "@shopify/polaris";
import { MorningPurchases } from "./MorningPurchases/MorningPurchases";
import { AfternoonPurchases } from "./AfternoonPurchases/AfternoonPurchases";
import { EveningPurchases } from "./EveningPurchases/EveningPurchases";
import { WeekendPurchases } from "./WeekendPurchases/WeekendPurchases";

interface PurchaseTimingProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Purchase Timing Section Component
 * 
 * Main component that renders all purchase timing metric cards.
 * Each card component fetches its own data independently.
 */
export function PurchaseTiming({
  dateRange = "30days",
  onViewSegment,
}: PurchaseTimingProps) {
  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Purchase Timing
        </Text>
        <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}>
          <MorningPurchases dateRange={dateRange} onViewSegment={onViewSegment} />

          <AfternoonPurchases dateRange={dateRange} onViewSegment={onViewSegment} />

          <EveningPurchases dateRange={dateRange} onViewSegment={onViewSegment} />

          {/* <WeekendPurchases dateRange={dateRange} onViewSegment={onViewSegment} /> */}
        </InlineGrid>
      </BlockStack>
    </Layout.Section>
  );
}