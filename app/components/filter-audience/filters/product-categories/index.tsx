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
  Thumbnail,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
} from "@shopify/polaris-icons";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { FilterOption } from "../../types";

// Constants
const DEBOUNCE_DELAY = 350;
const SEARCH_THRESHOLD = 10;
const SKELETON_COUNT = 6;
const MAX_CONTENT_HEIGHT = "400px";

// Tree structure styling constants
const TREE_LINE_WIDTH = "2px";
const TREE_LINE_COLOR_PARENT = "var(--p-color-border)";
const TREE_LINE_COLOR_CHILD = "var(--p-color-border-secondary)";
const TREE_INDENT = "32px";
const TREE_LINE_OFFSET = "12px";

interface ProductCategoriesProps {
  products?: (string | FilterOption)[];
  collections?: string[];
  categories?: string[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

/**
 * Product Categories Filter Component
 *
 * Displays and manages product, collection, and category filters
 * with search functionality and scrollable content
 */
export function ProductCategories({
  products = [],
  collections = [],
  categories = [],
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: ProductCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combine products, collections, and categories into a single options array
  const options = useMemo(
    () => [...(products || []), ...(collections || []), ...(categories || [])],
    [products, collections, categories],
  );

  // Memoize selected filters as Set for O(1) lookup
  const selectedFiltersSet = useMemo(
    () => new Set(selectedFilters),
    [selectedFilters],
  );

  const selectedCount = useMemo(
    () => selectedFilters.length,
    [selectedFilters.length],
  );

  const showSearch = useMemo(
    () => options.length > SEARCH_THRESHOLD,
    [options.length],
  );

  const showSkeleton = isLoading && options.length === 0;

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

  // Filter function for options (handles both strings and FilterOption objects)
  const filterOption = useCallback(
    (opt: string | FilterOption, searchLower: string): boolean => {
      if (!opt) return false;
      const label = typeof opt === "string" ? opt : opt.label || "";
      if (label.toLowerCase().includes(searchLower)) return true;

      // Check children if FilterOption
      if (typeof opt !== "string" && opt.children) {
        return opt.children.some((child) =>
          child ? filterOption(child, searchLower) : false,
        );
      }
      return false;
    },
    [],
  );

  // Memoize filtered options
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm) return options;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return options.filter((opt) => filterOption(opt, lowerSearch));
  }, [options, debouncedSearchTerm, filterOption]);

  const emptyStateMessage = useMemo(
    () =>
      debouncedSearchTerm
        ? "No matching options found"
        : "Add products with categories to see filtering options",
    [debouncedSearchTerm],
  );

  // Render option with tree structure
  const renderOption = useCallback(
    (opt: string | FilterOption, depth = 0, index = 0, isLastChild = false) => {
      if (!opt) return null;

      const label = typeof opt === "string" ? opt : opt.label || "Unknown";
      const value =
        typeof opt === "string" ? opt : opt.value || `unknown-${index}`;
      const children = typeof opt === "string" ? [] : opt.children || [];
      const imageUrl = typeof opt === "string" ? undefined : opt.imageUrl;
      const isChecked = selectedFiltersSet.has(value);
      const hasChildren = children.length > 0;
      // Show image only for child items (products), not parent categories
      const showImage = depth > 0 && !hasChildren;

      return (
        <div
          key={`${value}-${depth}-${index}`}
          style={{ position: "relative" }}
        >
          <div
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: depth > 0 ? TREE_INDENT : "0",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Tree structure lines */}
            {depth > 0 && (
              <>
                {/* Horizontal line connecting to parent */}
                <div
                  style={{
                    position: "absolute",
                    left: TREE_LINE_OFFSET,
                    top: "50%",
                    width: "16px",
                    height: TREE_LINE_WIDTH,
                    backgroundColor: TREE_LINE_COLOR_CHILD,
                  }}
                />

                {/* Vertical line */}
                {!isLastChild && (
                  <div
                    style={{
                      position: "absolute",
                      left: TREE_LINE_OFFSET,
                      top: "0",
                      bottom: "0",
                      width: TREE_LINE_WIDTH,
                      backgroundColor: TREE_LINE_COLOR_CHILD,
                    }}
                  />
                )}

                {/* Vertical line connecting to horizontal line (only for last item) */}
                {isLastChild && (
                  <div
                    style={{
                      position: "absolute",
                      left: TREE_LINE_OFFSET,
                      top: "0",
                      height: "50%",
                      width: TREE_LINE_WIDTH,
                      backgroundColor: TREE_LINE_COLOR_CHILD,
                    }}
                  />
                )}
              </>
            )}

            <Checkbox
              label={
                <InlineStack gap="200" blockAlign="center">
                  {showImage && (
                    <Thumbnail
                      source={imageUrl || ImageIcon}
                      alt={label}
                      size="small"
                    />
                  )}
                  <Text as="span" variant="bodyMd">
                    {label}
                  </Text>
                  {hasChildren && (
                    <Badge tone="info" size="small">
                      {`${children.length}`}
                    </Badge>
                  )}
                </InlineStack>
              }
              checked={isChecked}
              onChange={(checked) => onFilterChange(value, checked)}
            />
          </div>

          {/* Render children with proper tree structure */}
          {hasChildren && (
            <div
              style={{
                paddingLeft: depth === 0 ? TREE_LINE_OFFSET : "0",
                position: "relative",
              }}
            >
              {/* Vertical line for parent connecting to children */}
              {depth === 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: TREE_LINE_OFFSET,
                    top: "0",
                    bottom: "0",
                    width: TREE_LINE_WIDTH,
                    backgroundColor: TREE_LINE_COLOR_PARENT,
                  }}
                />
              )}

              {children
                .filter((child): child is FilterOption => child != null)
                .map((child: FilterOption, childIndex: number) =>
                  renderOption(
                    child,
                    depth + 1,
                    childIndex,
                    childIndex === children.length - 1,
                  ),
                )}
            </div>
          )}
        </div>
      );
    },
    [selectedFiltersSet, onFilterChange],
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
                  🛍️ Product Categories
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
          <Collapsible open={isExpanded} id="section-product-categories">
            <Box padding="400">
              {showSkeleton ? (
                <BlockStack gap="300">
                  {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <SkeletonBodyText key={index} lines={1} />
                  ))}
                </BlockStack>
              ) : (
                <BlockStack gap="400">
                  {/* Search Input */}
                  {showSearch && (
                    <TextField
                      label=""
                      labelHidden
                      type="search"
                      placeholder="Search product categories..."
                      value={searchTerm}
                      onChange={setSearchTerm}
                      autoComplete="off"
                    />
                  )}

                  {/* Scrollable Content Container */}
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
                      <div style={{ paddingTop: "4px", paddingBottom: "4px" }}>
                        {filteredOptions
                          .filter(
                            (option): option is string | FilterOption =>
                              option != null,
                          )
                          .map((option, index) =>
                            renderOption(
                              option,
                              0,
                              index,
                              index === filteredOptions.length - 1,
                            ),
                          )}
                      </div>
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
