import { Card, BlockStack, InlineStack, Text, Button, Select } from "@shopify/polaris";

interface DashboardControlsProps {
  dateRangeValue: string;
  onDateRangeChange: (value: string) => void;
  onCustomize: () => void;
}

/**
 * Dashboard Controls Component
 * 
 * Provides dashboard control options including:
 * - Date range selector
 * - Refresh button
 * - Customize dashboard button
 */
export function DashboardControls({
  dateRangeValue,
  onDateRangeChange,
  onCustomize,
}: DashboardControlsProps) {
  return (
    <Card padding="400">
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="400">
            <Text variant="headingMd" as="h2">
              Dashboard Controls
            </Text>
            <Select
              label="Date range"
              labelHidden
              options={[
                { label: "Today", value: "today" },
                { label: "Yesterday", value: "yesterday" },
                { label: "Last 7 days", value: "last7Days" },
                { label: "Last 30 days", value: "last30Days" },
                { label: "Last 90 days", value: "last90Days" },
                { label: "This month", value: "thisMonth" },
                { label: "Last month", value: "lastMonth" },
                { label: "Custom range", value: "custom" },
              ]}
              value={dateRangeValue}
              onChange={onDateRangeChange}
            />
          </InlineStack>

          <InlineStack gap="200">
            <Button
              onClick={onCustomize}
              variant="secondary"
            >
              Customize Dashboard
            </Button>
          </InlineStack>
        </InlineStack>

        <Text variant="bodyMd" as="p" tone="subdued">
          Currently showing data from{" "}
          {dateRangeValue === "last30Days"
            ? "the last 30 days"
            : "the selected period"}
          . Last updated: {new Date().toLocaleString()}
        </Text>
      </BlockStack>
    </Card>
  );
}

