import { useEffect, useState, useMemo } from "react";
import {
  Card,
  InlineStack,
  BlockStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  Modal,
  DataTable,
  Text,
  Spinner,
} from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { miniChartOptions } from "../../dashboardUtils";
import { ProtectedDataAccessModal } from "../../ProtectedDataAccessModal";

interface TotalCustomersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface TotalCustomersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Get date range label for display
 */
function getDateRangeLabel(dateRange: string): string {
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
 * Total Customers Card Component
 *
 * Fetches and displays total customers count independently.
 * Fully dynamic - calculates growth and generates description based on data.
 */
interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
}

interface CustomersListData {
  customers: Customer[];
  total: number;
  error?: string;
}

export function TotalCustomers({
  dateRange = "30days",
  onViewSegment,
}: TotalCustomersProps) {
  const fetcher = useFetcher<TotalCustomersData>();
  const customersListFetcher = useFetcher<CustomersListData>();
  const [data, setData] = useState<TotalCustomersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showCustomersModal, setShowCustomersModal] = useState(false);

  useEffect(() => {
    // Reset data when dateRange changes to ensure fresh fetch
    setData(null);
    setShowAccessModal(false);
    fetcher.load(
      `/api/dashboard/customers-overview/total-customers?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        setShowAccessModal(true);
        setData(null); // Don't set data if access denied
      } else if (typeof fetcher.data.count === "number") {
        // Set data if it has count (dataPoints might be empty array)
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
        // Single point or no data - no growth calculation
        return {
          growthPercentage: null,
          growthIndicator: null,
          description: "Your store is doing good",
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
            description: "Your store is doing good",
            growthTone: "subdued" as const,
            status: "success" as const, // Stable = Good
          };
        }
        // Growth from 0 to any number is 100% growth
        const periodLabel = getPeriodLabel(dateRange);
        return {
          growthPercentage: 100,
          growthIndicator: `↑ 100% growth in ${periodLabel}`,
          description: "Your store is doing good",
          growthTone: "success" as const,
          status: "success" as const, // 100% growth = Good
        };
      }

      // Calculate growth percentage
      const growth = ((endCount - startCount) / startCount) * 100;
      const growthPercentage = Math.abs(growth);
      const isPositive = growth > 0;
      const isNegative = growth < 0;
      const periodLabel = getPeriodLabel(dateRange);

      // Get status based on growth percentage
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
        description: "Your store is doing good",
        growthTone: isPositive
          ? ("success" as const)
          : isNegative
            ? ("critical" as const)
            : ("subdued" as const),
        status: statusFromGrowth,
      };
    }, [data, dateRange]);

  // Show skeleton while loading or if we don't have data yet
  // Show skeleton if: loading, or no data and not showing modal
  if (!data && !showAccessModal) {
    return (
      <div style={{ height: "100%" }}>
        <Card padding="400">
          <BlockStack gap="300">
            {/* Card header skeleton */}
            <InlineStack align="space-between">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </InlineStack>

            {/* Value and chart skeleton */}
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <SkeletonDisplayText size="large" />
                <div style={{ width: "60px", height: "30px" }}>
                  <SkeletonBodyText lines={1} />
                </div>
              </InlineStack>
            </InlineStack>

            {/* Description skeleton */}
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
        dataType="customer"
        featureName="Total Customers"
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
  // This ensures flat lines (same values) appear flat, not slanted
  const customChartOptions = chartData
    ? {
        ...miniChartOptions,
        scales: {
          ...miniChartOptions.scales,
          y: {
            display: false,
            beginAtZero: false,
            // Set min and max based on actual data to prevent auto-scaling issues
            min: Math.min(...chartData.datasets[0].data) * 0.95,
            max: Math.max(...chartData.datasets[0].data) * 1.05,
            // If all values are the same, ensure the range shows them as equal
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
        title="Total Customers"
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
        dataType="customer"
        featureName="Total Customers"
      />
    </>
  );
}
