import { InlineStack, BlockStack, Text, Button } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router";

interface SavedListsHeaderProps {
  onCreateNew?: () => void;
}

/**
 * Saved Lists Header Component
 * 
 * Displays the page title, description, and create new list button
 */
export function SavedListsHeader({ onCreateNew }: SavedListsHeaderProps) {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      // Navigate to AI search page using client-side navigation
      navigate("/app/ai-search-analyzer");
    }
  };

  return (
    <InlineStack align="space-between" blockAlign="center">
      <BlockStack gap="100">
        <Text as="h1" variant="headingLg">
          📋 My Saved Customer Lists
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          Manage and export your customer segments
        </Text>
      </BlockStack>
      <Button
        variant="primary"
        icon={PlusIcon}
        onClick={handleCreateNew}
      >
        Create New List
      </Button>
    </InlineStack>
  );
}

