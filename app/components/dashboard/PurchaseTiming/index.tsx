import { Layout, BlockStack, Text, Grid } from "@shopify/polaris";
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
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <MorningPurchases dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <AfternoonPurchases dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <EveningPurchases dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <WeekendPurchases dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>
        </Grid>
      </BlockStack>
    </Layout.Section>
  );
}

