import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Collapsible,
  Divider,
  Box,
  TextField,
  Select,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
import type { AmountSpentFilter } from "../../types";

interface AmountSpentProps {
  selectedFilter: AmountSpentFilter | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (filter: AmountSpentFilter | undefined) => void;
}

const OPERATOR_OPTIONS = [
  { label: "Minimum", value: "min" },
  { label: "Maximum", value: "max" },
];

/**
 * Amount Spent Filter Component
 *
 * Allows users to filter customers by the total amount they've spent
 * with options for minimum (>=) or maximum (<=) amount
 */
export function AmountSpent({
  selectedFilter,
  isExpanded,
  onToggle,
  onFilterChange,
}: AmountSpentProps) {
  const [amount, setAmount] = useState<string>(
    selectedFilter?.amount?.toString() || ""
  );
  const [operator, setOperator] = useState<"min" | "max" | null>(
    selectedFilter?.operator || "min"
  );
  const [error, setError] = useState<string>("");

  // Sync with external changes
  useEffect(() => {
    if (selectedFilter) {
      setAmount(selectedFilter.amount?.toString() || "");
      setOperator(selectedFilter.operator || "min");
    } else {
      setAmount("");
      setOperator("min"); // Default to "min"
    }
  }, [selectedFilter]);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      setError("");

      // Validate and update filter
      const numValue = parseFloat(value);
      if (value === "") {
        // Clear filter if amount is empty
        onFilterChange(undefined);
      } else if (isNaN(numValue) || numValue < 0) {
        setError("Please enter a valid positive number");
        onFilterChange(undefined);
      } else {
        // Update filter with new amount
        if (operator) {
          onFilterChange({
            amount: numValue,
            operator: operator,
          });
        }
      }
    },
    [operator, onFilterChange]
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      const newOperator = value === "min" ? "min" : value === "max" ? "max" : null;
      setOperator(newOperator);

      // Update filter with new operator
      const numValue = parseFloat(amount);
      if (amount && !isNaN(numValue) && numValue >= 0 && newOperator) {
        onFilterChange({
          amount: numValue,
          operator: newOperator,
        });
      } else if (!amount || amount === "") {
        // If no amount, just clear the filter
        onFilterChange(undefined);
      }
    },
    [amount, onFilterChange]
  );

  const isFilterActive = selectedFilter?.amount != null && selectedFilter?.operator != null;
  const selectedCount = isFilterActive ? 1 : 0;

  return (
    <Card>
      <BlockStack gap="0">
        {/* Header */}
        <Box padding="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="300" blockAlign="center">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                💰 Amount Spent
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
        <Collapsible open={isExpanded} id="section-amount-spent">
          <Box padding="400">
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd" tone="subdued">
                Filter customers based on the total amount they've spent
              </Text>

              <InlineStack gap="300" blockAlign="end">
                <div style={{ flex: 1 }}>
                  <Select
                    label="Filter Type"
                    options={OPERATOR_OPTIONS}
                    value={operator || "min"}
                    onChange={handleOperatorChange}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    error={error}
                    prefix="$"
                    autoComplete="off"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </InlineStack>

              {isFilterActive && (
                <Box paddingBlock="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    {operator === "min"
                      ? `Showing customers who spent at least $${selectedFilter.amount.toFixed(2)}`
                      : `Showing customers who spent at most $${selectedFilter.amount.toFixed(2)}`}
                  </Text>
                </Box>
              )}
            </BlockStack>
          </Box>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

