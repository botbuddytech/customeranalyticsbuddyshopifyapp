import { useEffect, useState, useMemo } from "react";
import {
  Card,
  InlineStack,
  BlockStack,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { miniChartOptions } from "../../dashboardUtils";
import { ProtectedDataAccessModal } from "../../ProtectedDataAccessModal";

interface ReturningCustomersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface ReturningCustomersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Get period label for growth indicator
 */
function getPeriodLabel(dateRange: string): string {
  switch (dateRange) {
    case "today":
      return "today";
    case "yesterday":
      return "yesterday";
    case "7days":
    case "last7Days":
      return "the last 7 days";
    case "30days":
    case "last30Days":
      return "the last 30 days";
    case "90days":
    case "last90Days":
      return "the last 90 days";
    case "thisMonth":
      return "this month";
    case "lastMonth":
      return "last month";
    default:
      return "the selected period";
  }
}

/**
 * Get description text based on date range
 */
function getDescription(dateRange: string): string {
  switch (dateRange) {
    case "today":
      return "Returning customers today";
    case "yesterday":
      return "Returning customers yesterday";
    case "7days":
    case "last7Days":
      return "Returning customers in the last 7 days";
    case "30days":
    case "last30Days":
      return "Returning customers in the last 30 days";
    case "90days":
    case "last90Days":
      return "Returning customers in the last 90 days";
    case "thisMonth":
      return "Returning customers this month";
    case "lastMonth":
      return "Returning customers last month";
    default:
      return "Returning customers in the selected period";
  }
}

/**
 * Get status badge based on growth percentage
 *
 * Mapping:
 * - Positive growth (growth > 0):
 *   - 0-5%: Attention (warning) - minimal growth
 *   - 5%+: Good (success) - healthy growth
 * - Negative growth (growth < 0):
 *   - 0-10%: Attention (warning) - small decline
 *   - 10%+: Issue (critical) - significant decline
 * - No change (0%): Good (success) - stable
 */
function getStatusFromGrowth(
  growth: number,
): "success" | "warning" | "critical" {
  if (growth === 0) {
    return "success"; // Stable = Good
  }

  if (growth > 0) {
    // Positive growth
    if (growth < 5) {
      return "warning"; // 0-5% = Attention (minimal growth)
    }
    return "success"; // 5%+ = Good (healthy growth)
  } else {
    // Negative growth (decrease)
    const decreasePercentage = Math.abs(growth);
    if (decreasePercentage < 10) {
      return "warning"; // 0-10% decrease = Attention
    }
    return "critical"; // 10%+ decrease = Issue
  }
}

/**
 * Returning Customers Card Component
 *
 * Fetches and displays returning customers count independently.
 * Fully dynamic - calculates growth and generates description based on data.
 * Shows customers who placed orders in the selected date range AND have placed orders before.
 */
export function ReturningCustomers({
  dateRange = "30days",
  onViewSegment,
}: ReturningCustomersProps) {
  const fetcher = useFetcher<ReturningCustomersData>();
  const [data, setData] = useState<ReturningCustomersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowAccessModal(false);
    fetcher.load(
      `/api/dashboard/customers-overview/returning-customers?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
        setShowAccessModal(true);
        setData(null);
      } else if (typeof fetcher.data.count === "number") {
        const newData = {
          count: fetcher.data.count,
          dataPoints: Array.isArray(fetcher.data.dataPoints)
            ? fetcher.data.dataPoints
            : [],
        };
        setData(newData);
      }
    }
  }, [fetcher.data]);

  // Calculate growth percentage and generate dynamic content
  const { growthPercentage, growthIndicator, description, growthTone, status } =
    useMemo(() => {
      if (!data || !data.dataPoints || data.dataPoints.length < 2) {
        return {
          growthPercentage: null,
          growthIndicator: null,
          description: getDescription(dateRange),
          growthTone: "success" as const,
          status: "success" as const,
        };
      }

      const [startPoint, endPoint] = data.dataPoints;
      const startCount = startPoint.count;
      const endCount = endPoint.count;

      // Handle division by zero - if starting from 0, any growth is 100%
      if (startCount === 0) {
        if (endCount === 0) {
          return {
            growthPercentage: 0,
            growthIndicator: `→ 0% change in ${getPeriodLabel(dateRange)}`,
            description: getDescription(dateRange),
            growthTone: "subdued" as const,
            status: "success" as const,
          };
        }
        const periodLabel = getPeriodLabel(dateRange);
        return {
          growthPercentage: 100,
          growthIndicator: `↑ 100% growth in ${periodLabel}`,
          description: getDescription(dateRange),
          growthTone: "success" as const,
          status: "success" as const,
        };
      }

      // Calculate growth percentage
      const growth = ((endCount - startCount) / startCount) * 100;
      const growthPercentage = Math.abs(growth);
      const isPositive = growth > 0;
      const isNegative = growth < 0;
      const periodLabel = getPeriodLabel(dateRange);
      const statusFromGrowth = getStatusFromGrowth(growth);

      // Format growth indicator text
      let growthIndicatorText: string;
      if (growthPercentage === 0) {
        growthIndicatorText = `→ 0% change in ${periodLabel}`;
      } else if (isPositive) {
        growthIndicatorText = `↑ ${growthPercentage.toFixed(0)}% growth in ${periodLabel}`;
      } else {
        growthIndicatorText = `↓ ${growthPercentage.toFixed(0)}% decrease in ${periodLabel}`;
      }

      return {
        growthPercentage,
        growthIndicator: growthIndicatorText,
        description: getDescription(dateRange),
        growthTone: isPositive
          ? ("success" as const)
          : isNegative
            ? ("critical" as const)
            : ("subdued" as const),
        status: statusFromGrowth,
      };
    }, [data, dateRange]);

  // Show skeleton while loading or if we don't have data yet
  if (!data && !showAccessModal) {
    return (
      <div style={{ height: "100%" }}>
        <Card padding="400">
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </InlineStack>
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <SkeletonDisplayText size="large" />
                <div style={{ width: "60px", height: "30px" }}>
                  <SkeletonBodyText lines={1} />
                </div>
              </InlineStack>
            </InlineStack>
            <BlockStack gap="100">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </BlockStack>
          </BlockStack>
        </Card>
      </div>
    );
  }

  // Don't render card if no data (but still show modal if needed)
  if (!data) {
    return showAccessModal ? (
      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="order"
        featureName="Returning Customers"
      />
    ) : null;
  }

  // Convert dataPoints to Chart.js format
  // For single point (today), don't show chart
  // Determine trend direction for chart color
  const chartData =
    data.dataPoints && data.dataPoints.length > 1
      ? (() => {
          const [startPoint, endPoint] = data.dataPoints;
          const startCount = startPoint.count;
          const endCount = endPoint.count;
          const isUpwardTrend = endCount > startCount;
          const isDownwardTrend = endCount < startCount;

          // Green for upward trend, red for downward trend, gray for no change
          const borderColor = isUpwardTrend
            ? "rgba(75, 192, 192, 1)" // Green
            : isDownwardTrend
              ? "rgba(255, 99, 132, 1)" // Red
              : "rgba(128, 128, 128, 1)"; // Gray for no change

          const backgroundColor = isUpwardTrend
            ? "rgba(75, 192, 192, 0.2)" // Green with transparency
            : isDownwardTrend
              ? "rgba(255, 99, 132, 0.2)" // Red with transparency
              : "rgba(128, 128, 128, 0.2)"; // Gray with transparency

          return {
            labels: data.dataPoints.map((point) => {
              // Format date as "MM/DD" (e.g., "01/15", "01/22")
              const date = new Date(point.date);
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${month}/${day}`;
            }),
            datasets: [
              {
                data: data.dataPoints.map((point) => point.count),
                borderColor,
                backgroundColor,
                fill: true,
              },
            ],
          };
        })()
      : null; // Don't show chart for single point or no data

  // Create custom chart options with proper y-axis scaling
  const customChartOptions = chartData
    ? {
        ...miniChartOptions,
        scales: {
          ...miniChartOptions.scales,
          y: {
            display: false,
            beginAtZero: false,
            min: Math.min(...chartData.datasets[0].data) * 0.95,
            max: Math.max(...chartData.datasets[0].data) * 1.05,
            ...(new Set(chartData.datasets[0].data).size === 1
              ? {
                  min: chartData.datasets[0].data[0] * 0.98,
                  max: chartData.datasets[0].data[0] * 1.02,
                }
              : {}),
          },
        },
      }
    : miniChartOptions;

  return (
    <>
      <InsightCard
        title="Returning Customers"
        value={data.count}
        status={status}
        description={description}
        showViewButton={true}
        miniChartData={chartData}
        growthIndicator={growthIndicator || undefined}
        growthTone={growthTone}
        onViewSegment={onViewSegment}
        miniChartOptions={customChartOptions}
      />

      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="order"
        featureName="Returning Customers"
      />
    </>
  );
}
