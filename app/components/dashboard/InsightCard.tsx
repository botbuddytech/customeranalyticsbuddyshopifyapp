import { Card, BlockStack, InlineStack, Text, Badge, Button } from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { Line } from "react-chartjs-2";

interface InsightCardProps {
  title: string;
  value: number;
  status?: "success" | "info" | "warning" | "critical" | "new";
  description?: string;
  showViewButton?: boolean;
  miniChartData?: any;
  growthIndicator?: string;
  growthTone?: "success" | "subdued" | "critical";
  onViewSegment?: (segmentName: string) => void;
  miniChartOptions?: any;
}

/**
 * InsightCard Component
 * 
 * Reusable KPI card component that displays metrics with:
 * - Title and status badge
 * - Value with mini trend chart
 * - Description
 * - Growth indicator
 * - Optional view segment button
 */
export function InsightCard({
  title,
  value,
  status,
  description,
  showViewButton = false,
  miniChartData,
  growthIndicator,
  growthTone = "success",
  onViewSegment,
  miniChartOptions,
}: InsightCardProps) {
  const getStatusBadgeText = () => {
    switch (status) {
      case "new":
        return "New";
      case "success":
        return "Good";
      case "warning":
        return "Attention";
      case "critical":
        return "Issue";
      case "info":
        return "Info";
      default:
        return "";
    }
  };

  const getStatusBadgeTone = () => {
    if (status === "new") return "info" as const;
    return (status as "success" | "info" | "warning" | "critical") || "info";
  };

  return (
    <div style={{ height: "100%" }}>
      <Card padding="400">
        <BlockStack gap="300">
          {/* Card header with title and badge */}
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">
              {title}
            </Text>
            {status && (
              <Badge tone={getStatusBadgeTone()}>
                {getStatusBadgeText()}
              </Badge>
            )}
          </InlineStack>

          {/* Value and mini chart */}
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Text as="p" variant="heading2xl" fontWeight="bold">
                {value.toLocaleString()}
              </Text>

              {/* Mini line chart */}
              {miniChartData && (
                <div style={{ width: "60px", height: "30px" }}>
                  <Line data={miniChartData} options={miniChartOptions} />
                </div>
              )}
            </InlineStack>

            {showViewButton && onViewSegment && (
              <Button
                icon={ClipboardIcon}
                onClick={() => onViewSegment(title)}
                variant="primary"
                accessibilityLabel={`View ${title} Segment`}
              />
            )}
          </InlineStack>

          {/* Description and Growth indicator */}
          {(description || growthIndicator) && (
            <BlockStack gap="100">
              {description && (
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  {description}
                </Text>
              )}
              {growthIndicator && (
                <Text as="p" variant="bodySm" tone={growthTone}>
                  {growthIndicator}
                </Text>
              )}
            </BlockStack>
          )}
        </BlockStack>
      </Card>
    </div>
  );
}

