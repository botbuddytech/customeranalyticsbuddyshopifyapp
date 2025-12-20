import { BaseFilterSection } from "../shared/BaseFilterSection";

interface ShoppingTimingProps {
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

const TIMING_OPTIONS = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-6pm)",
  "Evening (6pm-12am)",
  "Night (12am-6am)",
  "Weekdays",
  "Weekends",
  "Holidays - to be fixed",
];

/**
 * Shopping Timing Filter Component
 * 
 * Displays and manages shopping timing filters (time of day, day of week, etc.)
 */
export function ShoppingTiming({
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: ShoppingTimingProps) {
  return (
    <BaseFilterSection
      title="Shopping Timing"
      emoji="⏰"
      options={TIMING_OPTIONS}
      selectedFilters={selectedFilters}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onFilterChange={onFilterChange}
      isLoading={isLoading}
      emptyMessage="No timing options available"
    />
  );
}

