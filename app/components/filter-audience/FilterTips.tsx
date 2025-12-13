import { Card, BlockStack, Text } from "@shopify/polaris";

export function FilterTips() {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">
          💡 Tips
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          • Start with location or product filters • Combine multiple criteria
          for precision • Use timing filters for seasonal campaigns • Preview
          updates in real-time
        </Text>
      </BlockStack>
    </Card>
  );
}

