import { Modal, BlockStack, Text, TextField, Banner, Button } from "@shopify/polaris";

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
  onNumberChange: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
  isLoading?: boolean;
  isTesting?: boolean;
}

/**
 * WhatsApp Configuration Modal Component
 * 
 * Modal for configuring WhatsApp Business number
 */
export function WhatsAppModal({
  open,
  onClose,
  whatsappNumber,
  onNumberChange,
  onSave,
  onTest,
  isLoading = false,
  isTesting = false,
}: WhatsAppModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set WhatsApp Number"
      primaryAction={{
        content: "Save Number",
        onAction: onSave,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Send Test Message",
          onAction: onTest,
          disabled: !whatsappNumber,
          loading: isTesting,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Enter your WhatsApp Business number to receive notifications and send customer messages.
          </Text>

          <TextField
            label="WhatsApp Number"
            value={whatsappNumber}
            onChange={onNumberChange}
            placeholder="+1234567890"
            helpText="Include country code (e.g., +1 for US)"
            autoComplete="tel"
          />

          <Banner tone="info">
            <p>
              Make sure this number is connected to WhatsApp Business API for automated messaging.
            </p>
          </Banner>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

