import { Layout, BlockStack, Text, Grid } from "@shopify/polaris";
import { CODOrders } from "./CODOrders/CODOrders";
import { PrepaidOrders } from "./PrepaidOrders/PrepaidOrders";
import { CancelledOrders } from "./CancelledOrders/CancelledOrders";
import { AbandonedCarts } from "./AbandonedCarts/AbandonedCarts";

interface PurchaseOrderBehaviorProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Purchase & Order Behavior Section Component
 * 
 * Main component that renders all order behavior metric cards.
 * Each card component fetches its own data independently.
 */
export function PurchaseOrderBehavior({
  dateRange = "30days",
  onViewSegment,
}: PurchaseOrderBehaviorProps) {
  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Purchase & Order Behavior
        </Text>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <CODOrders dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <PrepaidOrders dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <CancelledOrders dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <AbandonedCarts dateRange={dateRange} onViewSegment={onViewSegment} />
          </Grid.Cell>
        </Grid>
      </BlockStack>
    </Layout.Section>
  );
}

