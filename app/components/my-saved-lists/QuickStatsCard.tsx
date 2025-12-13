import { Card, BlockStack, InlineStack, Text } from "@shopify/polaris";

interface QuickStatsCardProps {
  listsCreated: number;
  customersExported: number;
  campaignsSent: number;
}

/**
 * Quick Stats Card Component
 * 
 * Displays summary statistics for saved lists
 */
export function QuickStatsCard({
  listsCreated,
  customersExported,
  campaignsSent,
}: QuickStatsCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          📊 Quick Stats
        </Text>
        <InlineStack gap="400">
          <BlockStack gap="050" align="center">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {listsCreated}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Lists
            </Text>
          </BlockStack>

          <BlockStack gap="050" align="center">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {customersExported.toLocaleString()}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Exported
            </Text>
          </BlockStack>

          <BlockStack gap="050" align="center">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {campaignsSent}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Campaigns
            </Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

