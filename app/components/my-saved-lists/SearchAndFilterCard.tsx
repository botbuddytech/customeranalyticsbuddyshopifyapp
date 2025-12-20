import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Tabs,
  Icon,
} from "@shopify/polaris";
import { SearchIcon, FilterIcon } from "@shopify/polaris-icons";
import { useCallback } from "react";

interface SearchAndFilterCardProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTab: number;
  onTabChange: (selectedTabIndex: number) => void;
  tabs: Array<{ id: string; content: string }>;
  onFilterClick?: () => void;
}

/**
 * Search and Filter Card Component
 *
 * Handles search input, tab navigation, and filter actions
 */
export function SearchAndFilterCard({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  tabs,
  onFilterClick,
}: SearchAndFilterCardProps) {
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            🔍 Search & Filter
          </Text>
          <Button
            size="slim"
            icon={FilterIcon}
            onClick={onFilterClick || (() => {})}
          >
            Filters
          </Button>
        </InlineStack>

        <InlineStack gap="300" align="space-between">
          <div style={{ flexGrow: 1, maxWidth: "350px" }}>
            <TextField
              label=""
              labelHidden
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search lists..."
              prefix={<Icon source={SearchIcon} />}
              clearButton
              onClearButtonClick={handleClearSearch}
              autoComplete="off"
            />
          </div>

          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={onTabChange}
            fitted
          />
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
