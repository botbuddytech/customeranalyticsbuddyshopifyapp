import { Card, BlockStack, Text, Box, Spinner } from "@shopify/polaris";

interface SegmentPreviewProps {
  previewCount: number;
  isLoading?: boolean;
}

export function SegmentPreview({ previewCount, isLoading = false }: SegmentPreviewProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          📊 Segment Preview
        </Text>

        <Box
          background="bg-surface-secondary"
          padding="400"
          borderRadius="200"
        >
          <BlockStack gap="200" align="center">
            {isLoading ? (
              <Box paddingBlockStart="200">
                <Spinner size="small" />
              </Box>
            ) : (
              <Text as="p" variant="headingLg" fontWeight="bold">
                {previewCount.toLocaleString()}
              </Text>
            )}
            <Text as="p" variant="bodySm" tone="subdued">
              {isLoading ? "Calculating..." : "Estimated customers"}
            </Text>
          </BlockStack>
        </Box>

        <Text as="p" variant="bodySm" tone="subdued">
          Preview updates as you add filters
        </Text>
      </BlockStack>
    </Card>
  );
}

