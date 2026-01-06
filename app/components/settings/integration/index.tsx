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
import { SendGridIntegration } from "./sendgrid";

interface IntegrationSettingsProps {
  mailchimpConnection?: {
    isConnected: boolean;
    connectedAt?: string;
  };
}

export function IntegrationSettings({ mailchimpConnection }: IntegrationSettingsProps) {
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showComingSoonToast = () => {
    setToastMessage("Integrations are coming soon.");
    setToastActive(true);
  };

  const handleMailchimpConnect = async () => {
    try {
      // Fetch the OAuth URL from our API
      const response = await fetch("/api/mailchimp/authorize");
      const { authUrl } = await response.json();
      
      // Use App Bridge to redirect to external OAuth page
      // This is required for embedded Shopify apps
      const redirect = window.open(authUrl, '_top');
      if (!redirect) {
        setToastMessage("Please allow popups to connect Mailchimp");
        setToastActive(true);
      }
    } catch (error) {
      console.error("Failed to initiate Mailchimp OAuth:", error);
      setToastMessage("Failed to connect to Mailchimp. Please try again.");
      setToastActive(true);
    }
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

      <MailchimpIntegration 
        isConnected={mailchimpConnection?.isConnected || false}
        connectedAt={mailchimpConnection?.connectedAt}
        onConnect={handleMailchimpConnect} 
      />
      <KlaviyoIntegration onConnect={showComingSoonToast} />
      <SendGridIntegration onConnect={showComingSoonToast} />
    </BlockStack>
  );
}
