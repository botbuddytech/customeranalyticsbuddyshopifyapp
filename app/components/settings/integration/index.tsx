import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Toast,
} from "@shopify/polaris";
import { MailchimpIntegration } from "./mailchimp";
import { KlaviyoIntegration } from "./klaviyo";

export function IntegrationSettings() {
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showComingSoonToast = () => {
    setToastMessage("Integrations are coming soon.");
    setToastActive(true);
  };

  return (
    <BlockStack gap="300">
      {toastActive && (
        <Toast content={toastMessage} onDismiss={() => setToastActive(false)} />
      )}

      <Card>
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                Built-in email
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Use the app&apos;s native email sending (Gmail / SMTP) for
                feedback, waitlists, and automations.
              </Text>
            </BlockStack>
            <Badge tone="success">Active</Badge>
          </InlineStack>
        </BlockStack>
      </Card>

      <MailchimpIntegration onConnect={showComingSoonToast} />

      <KlaviyoIntegration onConnect={showComingSoonToast} />
    </BlockStack>
  );
}
