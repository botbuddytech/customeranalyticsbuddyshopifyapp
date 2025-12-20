import { BaseFilterSection } from "../shared/BaseFilterSection";

interface PaymentMethodsProps {
  paymentMethods?: string[];
  selectedFilters: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading?: boolean;
}

const DEFAULT_PAYMENT_OPTIONS = ["Prepaid"];

/**
 * Payment Methods Filter Component
 * 
 * Displays and manages payment method filters
 */
export function PaymentMethods({
  paymentMethods = [],
  selectedFilters,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading = false,
}: PaymentMethodsProps) {
  // Combine default options with dynamic payment methods
  const staticOptions = DEFAULT_PAYMENT_OPTIONS;
  const options = [
    ...staticOptions,
    ...paymentMethods.filter((method) => !staticOptions.includes(method)),
  ];

  return (
    <BaseFilterSection
      title="Payment Methods"
      emoji="💳"
      options={options}
      selectedFilters={selectedFilters}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onFilterChange={onFilterChange}
      isLoading={isLoading}
      emptyMessage="No payment methods available"
    />
  );
}

