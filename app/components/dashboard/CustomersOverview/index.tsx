import { Layout, BlockStack, Text, Grid } from "@shopify/polaris";
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
        <Grid>
          {showTotalCustomers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <TotalCustomers
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showNewCustomers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <NewCustomers dateRange={dateRange} onViewSegment={onViewSegment} />
            </Grid.Cell>
          )}

          {showReturningCustomers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <ReturningCustomers
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showInactiveCustomers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <InactiveCustomers
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

