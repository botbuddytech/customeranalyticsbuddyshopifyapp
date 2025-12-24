import { Card, BlockStack, InlineStack, Text, Button } from "@shopify/polaris";

interface ConstantContactIntegrationProps {
  onConnect: () => void;
}

export function ConstantContactIntegration({
  onConnect,
}: ConstantContactIntegrationProps) {
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#E6F0FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px",
                color: "#0052CC",
              }}
            >
              C
            </div>
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                Constant Contact
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Sync segments to Constant Contact for newsletters and campaigns.
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
        <InlineStack align="end">
          <Button variant="secondary" onClick={onConnect}>
            Connect Constant Contact
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


