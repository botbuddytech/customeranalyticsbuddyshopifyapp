import { Card, BlockStack, InlineStack, Text, Button } from "@shopify/polaris";

interface MailchimpIntegrationProps {
  onConnect: () => void;
}

export function MailchimpIntegration({ onConnect }: MailchimpIntegrationProps) {
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
                backgroundColor: "#FFE01B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px",
                color: "#000000",
              }}
            >
              M
            </div>
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                Mailchimp
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Sync segments and send campaigns through your Mailchimp account.
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
        <InlineStack align="end">
          <Button variant="secondary" onClick={onConnect}>
            Connect Mailchimp
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


