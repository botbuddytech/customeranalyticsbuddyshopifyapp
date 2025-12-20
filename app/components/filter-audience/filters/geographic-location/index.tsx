import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Badge,
  Collapsible,
  SkeletonBodyText,
  Divider,
  Box,
  TextField,
  Grid,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// Constants
const DEBOUNCE_DELAY = 350;
const SEARCH_THRESHOLD = 10;
const SKELETON_COUNT = 6;
const MAX_CONTENT_HEIGHT = "400px"; // Maximum height before scrolling

interface BaseFilterSectionProps {
  title: string;
  emoji: string;
  options: string[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  columnsCount?: 2 | 3 | 4;
}

// Helper function to calculate column span
const getColumnSpan = (
  columnsCount: 2 | 3 | 4,
): {
  xs: 6 | 3 | 4;
  sm: 6 | 3 | 4;
  md: 6 | 3 | 4;
  lg: 6 | 3 | 4;
  xl: 6 | 3 | 4;
} => {
  const span = (columnsCount === 2 ? 6 : columnsCount === 4 ? 3 : 4) as
    | 6
    | 3
    | 4;
  return {
    xs: span,
    sm: span,
    md: span,
    lg: span,
    xl: span,
  };
};

function BaseFilterSection({
  title,
  emoji,
  options,
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
  emptyMessage = "No options available",
  columnsCount = 3,
}: BaseFilterSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize selected filters as Set for O(1) lookup
  const selectedFiltersSet = useMemo(
    () => new Set(selectedFilters),
    [selectedFilters],
  );

  // Memoize computed values
  const selectedCount = useMemo(
    () => selectedFilters.length,
    [selectedFilters.length],
  );
  const showSearch = useMemo(
    () => options.length > SEARCH_THRESHOLD,
    [options.length],
  );
  const sectionId = useMemo(
    () => `section-${title.toLowerCase().replace(/\s+/g, "-")}`,
    [title],
  );
  const searchPlaceholder = useMemo(
    () => `Search ${title.toLowerCase()}...`,
    [title],
  );
  const columnSpan = useMemo(() => getColumnSpan(columnsCount), [columnsCount]);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Memoize filtered options (expensive computation)
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm) return options;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(lowerSearch),
    );
  }, [options, debouncedSearchTerm]);

  // Memoize empty state message
  const emptyStateMessage = useMemo(
    () => (debouncedSearchTerm ? "No matching options found" : emptyMessage),
    [debouncedSearchTerm, emptyMessage],
  );

  // Memoize checkbox change handler
  const handleCheckboxChange = useCallback(
    (option: string) => (checked: boolean) => {
      onFilterChange(option, checked);
    },
    [onFilterChange],
  );

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <Card>
        <BlockStack gap="0">
          {/* Header */}
          <Box padding="400">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="300" blockAlign="center">
                <Text as="h3" variant="headingMd" fontWeight="semibold">
                  {emoji} {title}
                </Text>
                {selectedCount > 0 && (
                  <Badge tone="success">{`${selectedCount} selected`}</Badge>
                )}
              </InlineStack>
              <Button
                size="medium"
                variant="plain"
                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                onClick={onToggle}
                accessibilityLabel={
                  isExpanded ? "Collapse section" : "Expand section"
                }
              />
            </InlineStack>
          </Box>

          <Divider />

          {/* Collapsible Content */}
          <Collapsible open={isExpanded} id={sectionId}>
            <Box padding="400">
              {isLoading ? (
                <BlockStack gap="300">
                  {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <SkeletonBodyText key={index} lines={1} />
                  ))}
                </BlockStack>
              ) : (
                <BlockStack gap="400">
                  {/* Search Input - Always show if options.length > 10 */}
                  {showSearch && (
                    <TextField
                      label=""
                      labelHidden
                      type="search"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={setSearchTerm}
                      autoComplete="off"
                    />
                  )}

                  {/* Scrollable Content Container */}
                  <div
                    style={{
                      maxHeight: MAX_CONTENT_HEIGHT,
                      overflowY: "scroll", // Always show scrollbar to prevent width shifts
                      overflowX: "hidden",
                      width: "100%",
                      boxSizing: "border-box",
                      // Ensure scrollbar always reserves space
                      scrollbarGutter: "stable",
                    }}
                  >
                    {/* Show results or empty state */}
                    {filteredOptions.length === 0 ? (
                      <Box paddingBlock="600">
                        <BlockStack gap="200" inlineAlign="center">
                          <Text
                            as="p"
                            variant="bodyMd"
                            tone="subdued"
                            alignment="center"
                          >
                            {emptyStateMessage}
                          </Text>
                        </BlockStack>
                      </Box>
                    ) : (
                      /* Multi-Column Checkbox Grid */
                      <Grid>
                        {filteredOptions.map((option) => (
                          <Grid.Cell key={option} columnSpan={columnSpan}>
                            <Checkbox
                              label={option}
                              checked={selectedFiltersSet.has(option)}
                              onChange={handleCheckboxChange(option)}
                            />
                          </Grid.Cell>
                        ))}
                      </Grid>
                    )}
                  </div>
                </BlockStack>
              )}
            </Box>
          </Collapsible>
        </BlockStack>
      </Card>
    </div>
  );
}

interface GeographicLocationProps {
  countries: string[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

/**
 * Geographic Location Filter Component
 *
 * Displays and manages geographic location (country) filters
 */
export function GeographicLocation({
  countries,
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: GeographicLocationProps) {
  return (
    <BaseFilterSection
      title="Geographic Location"
      emoji="🌍"
      options={countries}
      selectedFilters={selectedFilters}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onFilterChange={onFilterChange}
      isLoading={isLoading}
      emptyMessage="No countries available in your store"
      columnsCount={3}
    />
  );
}
