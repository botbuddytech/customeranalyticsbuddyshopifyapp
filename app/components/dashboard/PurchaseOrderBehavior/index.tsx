import { Layout, BlockStack, Text, InlineGrid } from "@shopify/polaris";
import { CODOrders } from "./CODOrders/CODOrders";
import { PrepaidOrders } from "./PrepaidOrders/PrepaidOrders";
import { CancelledOrders } from "./CancelledOrders/CancelledOrders";
import { AbandonedCarts } from "./AbandonedCarts/AbandonedCarts";

interface PurchaseOrderBehaviorProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  onShowToast?: (message: string) => void;
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
  onShowToast,
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
        <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}>
          {showCODOrders && (
            <CODOrders 
              dateRange={dateRange} 
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showPrepaidOrders && (
            <PrepaidOrders
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showCancelledOrders && (
            <CancelledOrders
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showAbandonedCarts && (
            <AbandonedCarts
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}
        </InlineGrid>
      </BlockStack>
    </Layout.Section>
  );
}