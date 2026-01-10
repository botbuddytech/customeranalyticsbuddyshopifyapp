import { BlockStack, Text, Modal, TextField } from "@shopify/polaris";
import { Dispatch, SetStateAction } from "react";

interface ContactFormProps {
  open: boolean;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  subject: string;
  setSubject: Dispatch<SetStateAction<string>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ContactForm({
  open,
  email,
  setEmail,
  subject,
  setSubject,
  message,
  setMessage,
  onCancel,
  onSubmit,
  isSubmitting,
}: ContactFormProps) {
  const canSubmit = email.trim() && subject.trim() && message.trim();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Contact Us"
      primaryAction={{
        content: "Send Message",
        onAction: onSubmit,
        disabled: !canSubmit || isSubmitting,
        loading: isSubmitting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onCancel,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd" tone="subdued">
            Have questions? Our support team is here to help you get the most out of your features.
          </Text>

          <TextField
            label="Your email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            helpText="We'll use this to respond to your inquiry"
          />

          <TextField
            label="Subject"
            value={subject}
            onChange={setSubject}
            placeholder="What can we help you with?"
            autoComplete="off"
          />

          <TextField
            label="Message"
            value={message}
            onChange={setMessage}
            placeholder="Share as much detail as you like to help us assist you better."
            multiline={4}
            autoComplete="off"
            helpText="Please provide as much detail as possible so we can help you effectively"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
