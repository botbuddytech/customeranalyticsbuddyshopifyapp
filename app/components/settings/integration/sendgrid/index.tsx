import { Card, BlockStack, InlineStack, Text, Button } from "@shopify/polaris";

interface SendGridIntegrationProps {
  onConnect: () => void;
}

export function SendGridIntegration({ onConnect }: SendGridIntegrationProps) {
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
                backgroundColor: "#F0F8FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px",
                color: "#009DDC",
              }}
            >
              S
            </div>
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                SendGrid
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Deliver email campaigns via your SendGrid account.
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
        <InlineStack align="end">
          <Button variant="secondary" onClick={onConnect}>
            Connect SendGrid
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


