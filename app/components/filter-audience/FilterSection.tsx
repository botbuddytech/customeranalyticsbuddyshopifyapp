import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Grid,
  Badge,
  Collapsible,
  SkeletonBodyText,
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
import type { FilterSection as FilterSectionType } from "./types";

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
 * Reusable collapsible filter section with checkboxes
 */
const DYNAMIC_SECTIONS = ["location", "products", "payment", "delivery"];

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

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingMd">
              {section.emoji} {section.title}
            </Text>
            {selectedCount > 0 && (
              <Badge tone="info" size="small">
                {`${selectedCount} selected`}
              </Badge>
            )}
          </InlineStack>
          <Button
            size="slim"
            variant="plain"
            icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            onClick={onToggle}
          />
        </InlineStack>

        <Collapsible open={isExpanded} id={`section-${section.id}`}>
          {showSkeleton ? (
            <Grid>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid.Cell
                  key={index}
                  columnSpan={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 3 }}
                >
                  <SkeletonBodyText lines={1} />
                </Grid.Cell>
              ))}
            </Grid>
          ) : (
            <Grid>
              {section.options.map((option, index) => (
                <Grid.Cell
                  key={`${option}-${index}`}
                  columnSpan={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 3 }}
                >
                  <Checkbox
                    label={option}
                    checked={selectedFilters.includes(option)}
                    onChange={(checked) => onFilterChange(option, checked)}
                  />
                </Grid.Cell>
              ))}
            </Grid>
          )}
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

