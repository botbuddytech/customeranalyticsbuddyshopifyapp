import { InlineStack, BlockStack, Text, Button } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

interface SavedListsHeaderProps {
  onCreateNew?: () => void;
}

/**
 * Saved Lists Header Component
 * 
 * Displays the page title, description, and create new list button
 */
export function SavedListsHeader({ onCreateNew }: SavedListsHeaderProps) {
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
        url="/app/ai-search-analyzer"
        onClick={onCreateNew}
      >
        Create New List
      </Button>
    </InlineStack>
  );
}

