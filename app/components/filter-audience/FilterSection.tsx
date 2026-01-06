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
  LocationIcon,
  ProductIcon,
  ClockIcon,
  PhoneIcon,
  CreditCardIcon,
  DeliveryIcon,
  FilterIcon,
} from "@shopify/polaris-icons";
import type { FilterSection as FilterSectionType, FilterOption } from "./types";

interface FilterSectionProps {
  section: FilterSectionType;
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

/**
 * Filter Section Component
 * 
 * Reusable collapsible filter section with checkboxes and tree structure
 */
const DYNAMIC_SECTIONS = ["location", "products", "payment", "delivery"];

// Tree structure styling constants
const TREE_LINE_WIDTH = '2px';
const TREE_LINE_COLOR_PARENT = 'var(--p-color-border)';
const TREE_LINE_COLOR_CHILD = 'var(--p-color-border-secondary)';
const TREE_INDENT = '32px';
const TREE_LINE_OFFSET = '12px';

export function FilterSection({
  section,
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: FilterSectionProps) {
  const selectedCount = selectedFilters.length;
  const isDynamic = DYNAMIC_SECTIONS.includes(section.id);
  const showSkeleton = isLoading && isDynamic && section.options.length === 0;

  const getSectionIcon = () => {
    switch (section.id) {
      case "location":
        return LocationIcon;
      case "products":
        return ProductIcon;
      case "timing":
        return ClockIcon;
      case "device":
        return PhoneIcon;
      case "payment":
        return CreditCardIcon;
      case "delivery":
        return DeliveryIcon;
      default:
        return FilterIcon;
    }
  };

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
                {section.emoji} {section.title}
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
        <Collapsible open={isExpanded} id={`section-${section.id}`}>
          <Box padding="400">
            {showSkeleton ? (
              <BlockStack gap="300">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonBodyText key={index} lines={1} />
                ))}
              </BlockStack>
            ) : section.options.length === 0 ? (
              <Box paddingBlock="600">
                <BlockStack gap="200" inlineAlign="center">
                  <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                    {isDynamic 
                      ? `No ${section.title.toLowerCase()} available in your store`
                      : "No options available"
                    }
                  </Text>
                  {section.id === "products" && (
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                      Add products with categories to see filtering options
                    </Text>
                  )}
                </BlockStack>
              </Box>
            ) : (
              <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                {section.options
                  .filter((option): option is string | FilterOption => option != null)
                  .map((option, index) =>
                    renderOption(option, 0, index, index === section.options.length - 1)
                  )}
              </div>
            )}
          </Box>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}