import { useState } from "react";
import { BlockStack, Text, InlineGrid, Toast } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { SupportChannelCard, SUPPORT_CHANNELS } from "../support-channel-card";
import { ContactForm } from "../ContactForm";
import { SUPPORT_EMAIL } from "../constants";

/**
 * Need Help Component
 * 
 * Displays support channel cards in a grid layout
 */
export function NeedHelp() {
  const fetcher = useFetcher();
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const isSubmitting = fetcher.state !== "idle";

  // Handle opening contact form for "Chat with us Now"
  const handleChatClick = () => {
    setShowContactForm(true);
  };

  // Handle submitting contact form
  const handleSubmitContact = () => {
    if (isSubmitting) return;

    // Create mailto link with pre-filled content
    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
    
    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    setToastMessage("Opening your email client...");
    setToastError(false);
    setToastActive(true);

    // Reset and close the modal
    setTimeout(() => {
      setEmail("");
      setSubject("");
      setMessage("");
      setShowContactForm(false);
    }, 500);
  };

  // Create channels with updated onClick for "Chat with us Now"
  const channelsWithHandler = SUPPORT_CHANNELS.map((channel) => {
    if (channel.title === "Chat with us Now") {
      return {
        ...channel,
        onClick: handleChatClick,
      };
    }
    return channel;
  });

  return (
    <BlockStack gap="400">
      {toastActive && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setToastActive(false)}
        />
      )}

      <BlockStack gap="200">
        <Text as="h2" variant="headingLg">
          Need Help?
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          You can reach us anytime using one of the following support channels:
        </Text>
      </BlockStack>

      <InlineGrid
        columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
        gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}
      >
        {channelsWithHandler.map((channel, index) => (
          <SupportChannelCard key={index} channel={channel} />
        ))}
      </InlineGrid>

      {/* Contact Form Modal */}
      <ContactForm
        open={showContactForm}
        email={email}
        setEmail={setEmail}
        subject={subject}
        setSubject={setSubject}
        message={message}
        setMessage={setMessage}
        onCancel={() => setShowContactForm(false)}
        onSubmit={handleSubmitContact}
        isSubmitting={isSubmitting}
      />
    </BlockStack>
  );
}

