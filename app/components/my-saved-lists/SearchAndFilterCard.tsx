import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Tabs,
  Icon,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { SearchIcon, SortIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

interface SearchAndFilterCardProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTab: number;
  onTabChange: (selectedTabIndex: number) => void;
  tabs: Array<{ id: string; content: string }>;
  sortValue: string;
  onSortChange: (value: string) => void;
}

/**
 * Search and Filter Card Component
 *
 * Handles search input, tab navigation, and sort actions
 */
export function SearchAndFilterCard({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  tabs,
  sortValue,
  onSortChange,
}: SearchAndFilterCardProps) {
  const [sortPopoverActive, setSortPopoverActive] = useState(false);

  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const sortOptions = [
    { content: "A-Z", value: "name-asc" },
    { content: "Z-A", value: "name-desc" },
    { content: "Newest first", value: "date-desc" },
    { content: "Oldest first", value: "date-asc" },
  ];

  const handleSortAction = useCallback(
    (value: string) => {
      onSortChange(value);
      setSortPopoverActive(false);
    },
    [onSortChange],
  );

  const toggleSortPopover = useCallback(() => {
    setSortPopoverActive((prev) => !prev);
  }, []);

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortValue);
    return option ? option.content : "Sort";
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            🔍 Search & Filter
          </Text>
          <Popover
            active={sortPopoverActive}
            activator={
              <Button size="slim" icon={SortIcon} onClick={toggleSortPopover}>
                {getSortLabel()}
              </Button>
            }
            onClose={toggleSortPopover}
            autofocusTarget="first-node"
          >
            <ActionList
              items={sortOptions.map((option) => ({
                content: option.content,
                onAction: () => handleSortAction(option.value),
                active: sortValue === option.value,
              }))}
            />
          </Popover>
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
