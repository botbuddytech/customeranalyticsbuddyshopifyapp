import { Card, BlockStack, InlineStack, Text, Button } from "@shopify/polaris";

interface FilterSummaryCardProps {
  totalFiltersCount: number;
  onClearAll: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function FilterSummaryCard({
  totalFiltersCount,
  onClearAll,
  onSubmit,
  isSubmitting,
}: FilterSummaryCardProps) {
  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            🔍 Active Filters
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {totalFiltersCount} filters applied
          </Text>
        </BlockStack>
        <InlineStack gap="200">
          <Button
            size="slim"
            onClick={onClearAll}
            disabled={totalFiltersCount === 0}
          >
            Clear All
          </Button>
          <Button
            size="slim"
            variant="primary"
            onClick={onSubmit}
            disabled={totalFiltersCount === 0 || isSubmitting}
          >
            Generate Segment
          </Button>
        </InlineStack>
      </InlineStack>
    </Card>
  );
}

