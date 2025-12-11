import { Layout, BlockStack, Text, Grid } from "@shopify/polaris";
import { CODOrders } from "./CODOrders/CODOrders";
import { PrepaidOrders } from "./PrepaidOrders/PrepaidOrders";
import { CancelledOrders } from "./CancelledOrders/CancelledOrders";
import { AbandonedCarts } from "./AbandonedCarts/AbandonedCarts";

interface PurchaseOrderBehaviorProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  visibility?: {
    codOrders?: boolean;
    prepaidOrders?: boolean;
    cancelledOrders?: boolean;
    abandonedCarts?: boolean;
  };
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
  visibility,
}: PurchaseOrderBehaviorProps) {
  // Default to showing all if visibility is not provided
  const showCODOrders = visibility?.codOrders !== false;
  const showPrepaidOrders = visibility?.prepaidOrders !== false;
  const showCancelledOrders = visibility?.cancelledOrders !== false;
  const showAbandonedCarts = visibility?.abandonedCarts !== false;

  // Don't render section if no cards are visible
  if (
    !showCODOrders &&
    !showPrepaidOrders &&
    !showCancelledOrders &&
    !showAbandonedCarts
  ) {
    return null;
  }

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Purchase & Order Behavior
        </Text>
        <Grid>
          {showCODOrders && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <CODOrders dateRange={dateRange} onViewSegment={onViewSegment} />
            </Grid.Cell>
          )}

          {showPrepaidOrders && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <PrepaidOrders
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showCancelledOrders && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <CancelledOrders
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showAbandonedCarts && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <AbandonedCarts
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}
        </Grid>
      </BlockStack>
    </Layout.Section>
  );
}

