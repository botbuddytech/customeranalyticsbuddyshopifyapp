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
  Grid,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useMemo, useCallback } from "react";

// Constants
const SKELETON_COUNT = 6;
const MAX_CONTENT_HEIGHT = "400px";

const TIMING_OPTIONS = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-6pm)",
  "Evening (6pm-12am)",
  "Night (12am-6am)",
  "Weekdays",
  "Weekends",
  "Holidays - to be fixed",
];

// Column span for 3-column layout
const columnSpan = {
  xs: 6 as const,
  sm: 4 as const,
  md: 4 as const,
  lg: 4 as const,
  xl: 4 as const,
};

interface ShoppingTimingProps {
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

/**
 * Shopping Timing Filter Component
 *
 * Displays and manages shopping timing filters (time of day, day of week, etc.)
 * with multi-column Grid layout and scrollable content
 */
export function ShoppingTiming({
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: ShoppingTimingProps) {
  // Memoize selected filters as Set for O(1) lookup
  const selectedFiltersSet = useMemo(
    () => new Set(selectedFilters),
    [selectedFilters],
  );

  const selectedCount = useMemo(
    () => selectedFilters.length,
    [selectedFilters.length],
  );

  const showSkeleton = isLoading && TIMING_OPTIONS.length === 0;

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
                  ⏰ Shopping Timing
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
          <Collapsible open={isExpanded} id="section-shopping-timing">
            <Box padding="400">
              {showSkeleton ? (
                <BlockStack gap="300">
                  {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <SkeletonBodyText key={index} lines={1} />
                  ))}
                </BlockStack>
              ) : TIMING_OPTIONS.length === 0 ? (
                <Box paddingBlock="600">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="subdued"
                      alignment="center"
                    >
                      No timing options available
                    </Text>
                  </BlockStack>
                </Box>
              ) : (
                /* Scrollable Content Container */
                <div
                  style={{
                    maxHeight: MAX_CONTENT_HEIGHT,
                    overflowY: "scroll",
                    overflowX: "hidden",
                    width: "100%",
                    boxSizing: "border-box",
                    scrollbarGutter: "stable",
                  }}
                >
                  {/* Multi-Column Checkbox Grid */}
                  <Grid>
                    {TIMING_OPTIONS.map((option) => (
                      <Grid.Cell key={option} columnSpan={columnSpan}>
                        <Checkbox
                          label={option}
                          checked={selectedFiltersSet.has(option)}
                          onChange={handleCheckboxChange(option)}
                        />
                      </Grid.Cell>
                    ))}
                  </Grid>
                </div>
              )}
            </Box>
          </Collapsible>
        </BlockStack>
      </Card>
    </div>
  );
}
