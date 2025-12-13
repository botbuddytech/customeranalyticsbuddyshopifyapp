import { Modal, BlockStack, Text, TextField, Banner, Button } from "@shopify/polaris";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  emailId: string;
  onEmailChange: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
  isLoading?: boolean;
  isTesting?: boolean;
}

/**
 * Email Configuration Modal Component
 * 
 * Modal for configuring email address
 */
export function EmailModal({
  open,
  onClose,
  emailId,
  onEmailChange,
  onSave,
  onTest,
  isLoading = false,
  isTesting = false,
}: EmailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set Email Address"
      primaryAction={{
        content: "Save Email",
        onAction: onSave,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Send Test Email",
          onAction: onTest,
          disabled: !emailId,
          loading: isTesting,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Enter your email address to receive reports, notifications, and important updates.
          </Text>

          <TextField
            label="Email Address"
            value={emailId}
            onChange={onEmailChange}
            placeholder="your-email@example.com"
            type="email"
            autoComplete="email"
          />

          <Banner tone="info">
            <p>
              This email will be used for automated reports and system notifications.
            </p>
          </Banner>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

