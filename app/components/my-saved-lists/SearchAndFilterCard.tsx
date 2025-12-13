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
import { SearchIcon, FilterIcon, ExportIcon } from "@shopify/polaris-icons";
import { useCallback } from "react";

interface SearchAndFilterCardProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTab: number;
  onTabChange: (selectedTabIndex: number) => void;
  tabs: Array<{ id: string; content: string }>;
  onFilterClick?: () => void;
  onExportAllClick?: () => void;
}

/**
 * Search and Filter Card Component
 * 
 * Handles search input, tab navigation, and filter/export actions
 */
export function SearchAndFilterCard({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  tabs,
  onFilterClick,
  onExportAllClick,
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
          <InlineStack gap="200">
            <Button
              size="slim"
              icon={FilterIcon}
              onClick={onFilterClick || (() => {})}
            >
              Filters
            </Button>

            <Button
              size="slim"
              icon={ExportIcon}
              onClick={onExportAllClick || (() => {})}
            >
              Export All
            </Button>
          </InlineStack>
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

