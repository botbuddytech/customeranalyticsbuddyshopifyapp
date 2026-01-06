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
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@shopify/polaris-icons";
import type { FilterOption } from "../../types";

interface BaseFilterSectionProps {
  title: string;
  emoji: string;
  options: (string | FilterOption)[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// Tree structure styling constants
const TREE_LINE_WIDTH = '2px';
const TREE_LINE_COLOR_PARENT = 'var(--p-color-border)';
const TREE_LINE_COLOR_CHILD = 'var(--p-color-border-secondary)';
const TREE_INDENT = '32px';
const TREE_LINE_OFFSET = '12px';

/**
 * Base Filter Section Component
 * 
 * Shared component for all filter sections with common functionality
 */
export function BaseFilterSection({
  title,
  emoji,
  options,
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
  emptyMessage,
}: BaseFilterSectionProps) {
  const selectedCount = selectedFilters.length;
  const showSkeleton = isLoading && options.length === 0;

  const renderOption = (opt: string | FilterOption, depth = 0, index = 0, isLastChild = false) => {
    // Handle null/undefined options
    if (!opt) return null;
    
    const label = typeof opt === "string" ? opt : opt.label || "Unknown";
    const value = typeof opt === "string" ? opt : opt.value || `unknown-${index}`;
    const children = typeof opt === "string" ? [] : opt.children || [];
    const isChecked = selectedFilters.includes(value);
    const hasChildren = children.length > 0;

    return (
      <div key={`${value}-${depth}-${index}`} style={{ position: 'relative' }}>
        <div
          style={{
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingLeft: depth > 0 ? TREE_INDENT : '0',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Tree structure lines */}
          {depth > 0 && (
            <>
              {/* Horizontal line connecting to parent */}
              <div
                style={{
                  position: 'absolute',
                  left: TREE_LINE_OFFSET,
                  top: '50%',
                  width: '16px',
                  height: TREE_LINE_WIDTH,
                  backgroundColor: TREE_LINE_COLOR_CHILD,
                }}
              />
              
              {/* Vertical line */}
              {!isLastChild && (
                <div
                  style={{
                    position: 'absolute',
                    left: TREE_LINE_OFFSET,
                    top: '0',
                    bottom: '0',
                    width: TREE_LINE_WIDTH,
                    backgroundColor: TREE_LINE_COLOR_CHILD,
                  }}
                />
              )}
              
              {/* Vertical line connecting to horizontal line (only for last item) */}
              {isLastChild && (
                <div
                  style={{
                    position: 'absolute',
                    left: TREE_LINE_OFFSET,
                    top: '0',
                    height: '50%',
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
              paddingLeft: depth === 0 ? TREE_LINE_OFFSET : '0',
              position: 'relative',
            }}
          >
            {/* Vertical line for parent connecting to children */}
            {depth === 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: TREE_LINE_OFFSET,
                  top: '0',
                  bottom: '0',
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
                  childIndex === children.length - 1
                )
              )}
          </div>
        )}
      </div>
    );
  };

  return (
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
                <Badge tone="success">
                  {`${selectedCount} selected`}
                </Badge>
              )}
            </InlineStack>
            <Button
              size="medium"
              variant="plain"
              icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              onClick={onToggle}
              accessibilityLabel={isExpanded ? "Collapse section" : "Expand section"}
            />
          </InlineStack>
        </Box>

        <Divider />

        {/* Collapsible Content */}
        <Collapsible open={isExpanded} id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <Box padding="400">
            {showSkeleton ? (
              <BlockStack gap="300">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonBodyText key={index} lines={1} />
                ))}
              </BlockStack>
            ) : options.length === 0 ? (
              <Box paddingBlock="600">
                <BlockStack gap="200" inlineAlign="center">
                  <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                    {emptyMessage || `No ${title.toLowerCase()} available in your store`}
                  </Text>
                </BlockStack>
              </Box>
            ) : (
              <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                {options
                  .filter((option): option is string | FilterOption => option != null)
                  .map((option, index) =>
                    renderOption(option, 0, index, index === options.length - 1)
                  )}
              </div>
            )}
          </Box>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

