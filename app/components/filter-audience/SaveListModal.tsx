import {
  Modal,
  BlockStack,
  TextField,
  Text,
  Banner,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

interface SaveListModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (listName: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Save List Modal Component
 * 
 * Modal for entering the name of a customer segment list to save
 */
export function SaveListModal({
  open,
  onClose,
  onSave,
  isLoading = false,
  error = null,
}: SaveListModalProps) {
  const [listName, setListName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleListNameChange = useCallback((value: string) => {
    setListName(value);
    setLocalError(null);
  }, []);

  const handleSave = useCallback(async () => {
    // Validate list name
    if (!listName.trim()) {
      setLocalError("List name is required");
      return;
    }

    if (listName.trim().length > 100) {
      setLocalError("List name must be 100 characters or less");
      return;
    }

    try {
      await onSave(listName.trim());
      // Reset form on success
      setListName("");
      setLocalError(null);
    } catch (err) {
      // Error handling is done by parent component
    }
  }, [listName, onSave]);

  const handleClose = useCallback(() => {
    setListName("");
    setLocalError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Save Customer List"
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading: isLoading,
        disabled: !listName.trim() || isLoading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleClose,
          disabled: isLoading,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Enter a name for this customer segment list. You can use this saved
            list later to quickly access the same customer segment.
          </Text>

          {(error || localError) && (
            <Banner tone="critical">
              <p>{error || localError}</p>
            </Banner>
          )}

          <TextField
            label="List Name"
            value={listName}
            onChange={handleListNameChange}
            placeholder="e.g., High-Value US Customers"
            autoComplete="off"
            maxLength={100}
            showCharacterCount
            error={localError || undefined}
            disabled={isLoading}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

