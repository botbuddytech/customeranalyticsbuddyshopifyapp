import { Modal, Text } from "@shopify/polaris";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Delete Confirmation Modal Component
 * 
 * Confirms deletion of a saved customer list
 */
export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Customer List"
      primaryAction={{
        content: "Delete",
        destructive: true,
        onAction: onConfirm,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          Are you sure you want to delete this customer list? This action
          cannot be undone.
        </Text>
      </Modal.Section>
    </Modal>
  );
}

