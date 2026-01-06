import { Card, BlockStack, InlineStack, Text, Button } from "@shopify/polaris";

interface KlaviyoIntegrationProps {
  onConnect: () => void;
}

export function KlaviyoIntegration({ onConnect }: KlaviyoIntegrationProps) {
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
                backgroundColor: "#F9EEED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px",
                color: "#E45B5B",
              }}
            >
              K
            </div>
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                Klaviyo
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Connect Klaviyo to power advanced email flows with your audience
                insights.
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
        <InlineStack align="end">
          <Button variant="secondary" onClick={onConnect}>
            Connect Klaviyo
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


