import { useState, useEffect } from "react";
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

export function IntegrationSettings({
  mailchimpConnection,
}: IntegrationSettingsProps) {
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Listen for messages from the OAuth popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "MAILCHIMP_OAUTH_SUCCESS") {
        setToastMessage("✅ Mailchimp connected successfully!");
        setToastActive(true);
        // Reload page to refresh connection status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (event.data.type === "MAILCHIMP_OAUTH_ERROR") {
        setToastMessage(
          event.data.message ||
            "❌ Failed to connect Mailchimp. Please try again.",
        );
        setToastActive(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const showComingSoonToast = () => {
    setToastMessage("Integrations are coming soon.");
    setToastActive(true);
  };

  const handleMailchimpConnect = async () => {
    try {
      // Fetch the OAuth URL from our API
      const response = await fetch("/api/mailchimp/authorize");
      const { authUrl } = await response.json();

      // Open OAuth flow in a popup window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        authUrl,
        "mailchimp-oauth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,directories=no,status=no`,
      );

      if (!popup) {
        setToastMessage("Please allow popups to connect Mailchimp");
        setToastActive(true);
        return;
      }

      // Monitor popup window
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to initiate Mailchimp OAuth:", error);
      setToastMessage("Failed to connect to Mailchimp. Please try again.");
      setToastActive(true);
    }
  };

  const handleMailchimpDisconnect = async () => {
    try {
      const response = await fetch("/api/mailchimp/disconnect", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage("✅ Mailchimp disconnected successfully");
        setToastActive(true);
        // Reload page to refresh connection status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setToastMessage(data.error || "Failed to disconnect Mailchimp");
        setToastActive(true);
      }
    } catch (error) {
      console.error("Failed to disconnect Mailchimp:", error);
      setToastMessage("Failed to disconnect Mailchimp. Please try again.");
      setToastActive(true);
    }
  };

  return (
    <BlockStack gap="300">
      {toastActive && (
        <Toast content={toastMessage} onDismiss={() => setToastActive(false)} />
      )}

      <MailchimpIntegration
        isConnected={mailchimpConnection?.isConnected || false}
        connectedAt={mailchimpConnection?.connectedAt}
        onConnect={handleMailchimpConnect}
        onDisconnect={handleMailchimpDisconnect}
      />
      {/* <KlaviyoIntegration onConnect={showComingSoonToast} />
      <SendGridIntegration onConnect={showComingSoonToast} /> */}
    </BlockStack>
  );
}
