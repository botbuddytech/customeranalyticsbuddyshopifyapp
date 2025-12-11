import { Layout, BlockStack, Text } from "@shopify/polaris";
import { CustomerSegmentation } from "./CustomerSegmentation/CustomerSegmentation";
import { BehavioralBreakdown } from "./BehavioralBreakdown/BehavioralBreakdown";

interface VisualAnalyticsProps {
  dateRange?: string;
}

/**
 * Visual Analytics Section Component
 * 
 * Main component that renders all visual analytics charts.
 * Each chart component fetches its own data independently.
 */
export function VisualAnalytics({
  dateRange = "30days",
}: VisualAnalyticsProps) {
  return (
    <>
      {/* Section Header */}
      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingLg">
            Visual Analytics
          </Text>
        </Layout.Section>
      </Layout>

      {/* Charts Side by Side */}
      <Layout>
        {/* Customer Segmentation Chart */}
        <Layout.Section variant="oneHalf">
          <CustomerSegmentation dateRange={dateRange} />
        </Layout.Section>

        {/* Behavioral Breakdown Chart */}
        <Layout.Section variant="oneHalf">
          <BehavioralBreakdown dateRange={dateRange} />
        </Layout.Section>
      </Layout>
    </>
  );
}

