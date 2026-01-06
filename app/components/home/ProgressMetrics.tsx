import { Card, BlockStack, InlineStack, Text, Badge, Divider } from "@shopify/polaris";

interface ProgressMetricsProps {
  segmentsCreated?: number;
  customersMessaged?: number;
  averageOpenRate?: string;
  repeatPurchases?: number;
}

/**
 * Progress Metrics Component
 * 
 * Displays user progress statistics and key performance indicators
 */
export function ProgressMetrics({ 
  segmentsCreated = 0, 
  customersMessaged = 0, 
  averageOpenRate = "--", 
  repeatPurchases = 0 
}: ProgressMetricsProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Your Progress
        </Text>

        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              Segments Created
            </Text>
            <Badge tone="info">{String(segmentsCreated)}</Badge>
          </InlineStack>

          <Divider />

          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              Customers Messaged
            </Text>
            <Badge tone="info">{String(customersMessaged)}</Badge>
          </InlineStack>

          <Divider />

          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              Average Open Rate
            </Text>
            <Badge tone="info">{averageOpenRate}</Badge>
          </InlineStack>

          <Divider />

          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              Repeat Purchases
            </Text>
            <Badge tone="info">{String(repeatPurchases)}</Badge>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
