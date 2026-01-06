import { Card, BlockStack, InlineStack, Text, Button, Badge } from "@shopify/polaris";

interface MailchimpIntegrationProps {
  isConnected: boolean;
  connectedAt?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
}

export function MailchimpIntegration({ 
  isConnected, 
  connectedAt,
  onConnect,
  onDisconnect 
}: MailchimpIntegrationProps) {
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
              <InlineStack gap="200" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  Mailchimp
                </Text>
                {isConnected && <Badge tone="success">Connected</Badge>}
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                {isConnected 
                  ? `Connected ${connectedAt ? `on ${new Date(connectedAt).toLocaleDateString()}` : ''}`
                  : "Sync segments and send campaigns through your Mailchimp account."}
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
        <InlineStack align="end" gap="200">
          {isConnected ? (
            <>
              {onDisconnect && (
                <Button onClick={onDisconnect}>
                  Disconnect
                </Button>
              )}
            </>
          ) : (
            <Button variant="primary" onClick={onConnect}>
              Connect Mailchimp
            </Button>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


