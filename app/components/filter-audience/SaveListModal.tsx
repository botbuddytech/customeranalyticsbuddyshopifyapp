import {
  Modal,
  BlockStack,
  TextField,
  Text,
  Banner,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { FilterData } from "./types";
import { suggestListName } from "../../utils/listNameGenerator";

interface SaveListModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (listName: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialListName?: string;
  isModify?: boolean;
  filters?: FilterData;
}

const LIST_NAME_CONFIG = {
  location: {
    priority: 1,
    format: (v: string[]) => `from ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
  products: {
    priority: 2,
    format: (v: string[]) => `bought ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
  timing: {
    priority: 3,
    format: (v: string[]) => `in ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
  device: {
    priority: 4,
    format: (v: string[]) => `using ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
  payment: {
    priority: 5,
    format: (v: string[]) => `with ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
  delivery: {
    priority: 6,
    format: (v: string[]) => `via ${v.slice(0, 3).join(", ")}${v.length > 3 ? "..." : ""}`,
  },
};

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
  initialListName = "",
  isModify = false,
  filters,
}: SaveListModalProps) {
  const [listName, setListName] = useState(initialListName);
  const [localError, setLocalError] = useState<string | null>(null);

  // Update listName when initialListName changes (when modal opens with modify)
  useEffect(() => {
    if (initialListName) {
      setListName(initialListName);
    }
  }, [initialListName]);

  // Generate suggested name
  const suggestedName = useMemo(() => {
    if (!filters) return "";
    const name = suggestListName(filters, LIST_NAME_CONFIG);
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [filters]);

  // Pre-fill if not modifying and list name is empty
  useEffect(() => {
    if (open && !isModify && !listName && suggestedName) {
      setListName(suggestedName);
    }
  }, [open, isModify, suggestedName]); // Removed listName from dep array to avoid overwrite if user clears it

  const handleListNameChange = useCallback((value: string) => {
    setListName(value);
    setLocalError(null);
  }, []);

  const handleUseSuggestion = useCallback(() => {
    setListName(suggestedName);
    setLocalError(null);
  }, [suggestedName]);

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
    if (!isModify) setListName("");
    setLocalError(null);
    onClose();
  }, [onClose, isModify]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isModify ? "Update Customer List" : "Save Customer List"}
      primaryAction={{
        content: isModify ? "Update" : "Save",
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
            {isModify
              ? "Update the filters for this customer segment list. The list name will remain the same."
              : "Enter a name for this customer segment list. You can use this saved list later to quickly access the same customer segment."}
          </Text>

          {(error || localError) && (
            <Banner tone="critical">
              <p>{error || localError}</p>
            </Banner>
          )}

          <BlockStack gap="200">
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
            {suggestedName && suggestedName !== listName && (
              <InlineStack align="start">
                <Text as="p" variant="bodySm" tone="subdued">
                  Suggestion:{" "}
                  <Button variant="plain" onClick={handleUseSuggestion}>
                    {suggestedName}
                  </Button>
                </Text>
              </InlineStack>
            )}
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

