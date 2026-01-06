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
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";

interface CustomerCreatedFromProps {
  selectedDate: string | null | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (date: string | null) => void;
}

/**
 * Customer Created From Filter Component
 *
 * Allows users to filter customers by their creation date
 * Shows customers who were created on or after the selected date
 */
export function CustomerCreatedFrom({
  selectedDate,
  isExpanded,
  onToggle,
  onFilterChange,
}: CustomerCreatedFromProps) {
  const [date, setDate] = useState<string>(selectedDate || "");
  const [error, setError] = useState<string>("");

  // Sync with external changes
  useEffect(() => {
    setDate(selectedDate || "");
  }, [selectedDate]);

  const handleDateChange = useCallback(
    (value: string) => {
      setDate(value);
      setError("");

      if (value === "") {
        // Clear filter if date is empty
        onFilterChange(null);
      } else {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          setError("Please enter a valid date (YYYY-MM-DD)");
          onFilterChange(null);
          return;
        }

        // Validate that it's a valid date
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) {
          setError("Please enter a valid date");
          onFilterChange(null);
          return;
        }

        // Update filter with new date
        onFilterChange(value);
      }
    },
    [onFilterChange]
  );

  const isFilterActive = selectedDate != null && selectedDate !== "";
  const selectedCount = isFilterActive ? 1 : 0;

  // Format date for display
  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Card>
      <BlockStack gap="0">
        {/* Header */}
        <Box padding="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="300" blockAlign="center">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                📅 Customer Created From
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
        <Collapsible open={isExpanded} id="section-customer-created-from">
          <Box padding="400">
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd" tone="subdued">
                Filter customers who were created on or after the selected date
              </Text>

              <div style={{ maxWidth: "300px" }}>
                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  error={error}
                  autoComplete="off"
                  helpText="Select a date to show customers created on or after that date"
                />
              </div>

              {isFilterActive && (
                <Box paddingBlock="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Showing customers created on or after {displayDate}
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

