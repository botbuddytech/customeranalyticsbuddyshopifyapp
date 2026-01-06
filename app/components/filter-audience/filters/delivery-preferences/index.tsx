import { BaseFilterSection } from "../shared/BaseFilterSection";

interface DeliveryPreferencesProps {
  deliveryMethods?: string[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

const DEFAULT_DELIVERY_OPTIONS = [
  "Standard Shipping",
  "Express Shipping",
  "Free Shipping",
  "Local Pickup",
  "Same-day Delivery",
  "International Shipping",
  "Scheduled Delivery",
  "Eco-friendly Packaging",
];

/**
 * Delivery Preferences Filter Component
 * 
 * Displays and manages delivery/shipping method filters
 */
export function DeliveryPreferences({
  deliveryMethods = [],
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: DeliveryPreferencesProps) {
  // Combine default options with dynamic delivery methods
  const staticOptions = DEFAULT_DELIVERY_OPTIONS;
  const options = [
    ...staticOptions,
    ...deliveryMethods.filter((method) => !staticOptions.includes(method)),
  ];

  return (
    <BaseFilterSection
      title="Delivery Preferences"
      emoji="🚚"
      options={options}
      selectedFilters={selectedFilters}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onFilterChange={onFilterChange}
      isLoading={isLoading}
      emptyMessage="No delivery methods available"
    />
  );
}

