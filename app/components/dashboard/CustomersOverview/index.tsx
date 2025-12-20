import { Layout, BlockStack, Text, InlineGrid } from "@shopify/polaris";
import { TotalCustomers } from "./TotalCustomers/TotalCustomers";
import { NewCustomers } from "./NewCustomers/NewCustomers";
import { ReturningCustomers } from "./ReturningCustomers/ReturningCustomers";
import { InactiveCustomers } from "./InactiveCustomers/InactiveCustomers";

interface CustomersOverviewProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  visibility?: {
    totalCustomers?: boolean;
    newCustomers?: boolean;
    returningCustomers?: boolean;
    inactiveCustomers?: boolean;
  };
}

/**
 * Customers Overview Section Component
 * 
 * Main component that renders all customer metric cards.
 * Each card component fetches its own data independently.
 */
export function CustomersOverview({
  dateRange = "30days",
  onViewSegment,
  visibility,
}: CustomersOverviewProps) {
  // Default to showing all if visibility is not provided
  const showTotalCustomers = visibility?.totalCustomers !== false;
  const showNewCustomers = visibility?.newCustomers !== false;
  const showReturningCustomers = visibility?.returningCustomers !== false;
  const showInactiveCustomers = visibility?.inactiveCustomers !== false;

  // Don't render section if no cards are visible
  if (
    !showTotalCustomers &&
    !showNewCustomers &&
    !showReturningCustomers &&
    !showInactiveCustomers
  ) {
    return null;
  }

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Customers Overview
        </Text>
        <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}>
          {showTotalCustomers && (
            <TotalCustomers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
            />
          )}

          {showNewCustomers && (
            <NewCustomers dateRange={dateRange} onViewSegment={onViewSegment} />
          )}

          {showReturningCustomers && (
            <ReturningCustomers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
            />
          )}

          {showInactiveCustomers && (
            <InactiveCustomers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
            />
          )}
        </InlineGrid>
      </BlockStack>
    </Layout.Section>
  );
}