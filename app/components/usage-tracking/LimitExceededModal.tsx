import { Modal, BlockStack, Text, Button } from "@shopify/polaris";

interface LimitExceededModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  actionType: "chat" | "listGenerated" | "listSaved" | "export";
}

/**
 * Limit Exceeded Modal Component
 * 
 * Displays when user tries to perform an action that exceeds their usage limits
 */
export function LimitExceededModal({
  open,
  onClose,
  message,
  actionType,
}: LimitExceededModalProps) {
  const getTitle = () => {
    switch (actionType) {
      case "chat":
        return "Chat Limit Reached";
      case "listGenerated":
        return "List Generation Limit Reached";
      case "listSaved":
        return "List Save Limit Reached";
      case "export":
        return "Export Limit Reached";
      default:
        return "Usage Limit Reached";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={getTitle()}
      primaryAction={{
        content: "Got it",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            {message}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Please upgrade your plan or contact support if you need to increase
            your limits.
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

