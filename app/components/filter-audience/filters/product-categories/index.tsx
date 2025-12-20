import { BaseFilterSection } from "../shared/BaseFilterSection";
import type { FilterOption } from "../../types";

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
  // Combine products, collections, and categories into a single options array
  const options = [
    ...(products || []),
    ...(collections || []),
    ...(categories || []),
  ];

  return (
    <BaseFilterSection
      title="Product Categories"
      emoji="🛍️"
      options={options}
      selectedFilters={selectedFilters}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onFilterChange={onFilterChange}
      isLoading={isLoading}
      emptyMessage="Add products with categories to see filtering options"
    />
  );
}
