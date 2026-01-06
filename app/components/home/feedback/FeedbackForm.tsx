import { BlockStack, Text, Modal } from "@shopify/polaris";
import { Dispatch, SetStateAction } from "react";

interface FeedbackFormProps {
  open: boolean;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  feedbackText: string;
  setFeedbackText: Dispatch<SetStateAction<string>>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function FeedbackForm({
  open,
  email,
  setEmail,
  feedbackText,
  setFeedbackText,
  onCancel,
  onSubmit,
  isSubmitting,
}: FeedbackFormProps) {
  const canSubmit = email.trim() && feedbackText.trim();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Tell us more about your experience"
      primaryAction={{
        content: "Submit feedback",
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
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            Your email address
          </Text>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "14px",
            }}
          />

          <Text as="p" variant="bodyMd" tone="subdued">
            What did you like? What could be improved? Any suggestions?
          </Text>

          <textarea
            placeholder="Share as much detail as you like to help us improve your experience."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            style={{
              width: "100%",
              minHeight: "140px",
              padding: "12px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
