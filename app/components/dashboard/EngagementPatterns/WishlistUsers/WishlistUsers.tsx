import { useEffect, useState, useMemo } from "react";
import { Modal, DataTable, Text, Spinner, BlockStack } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { InsightCardSkeleton } from "../../InsightCardSkeleton";
import { miniChartOptions } from "../../dashboardUtils";

interface WishlistUsersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface WishlistUsersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

function getDateRangeLabel(dateRange: string): string {
  switch (dateRange) {
    case "today": return "today";
    case "yesterday": return "yesterday";
    case "7days": case "last7Days": return "the last 7 days";
    case "30days": case "last30Days": return "the last 30 days";
    case "90days": case "last90Days": return "the last 90 days";
    case "thisMonth": return "this month";
    case "lastMonth": return "last month";
    default: return "the selected period";
  }
}

function getPeriodLabel(dateRange: string): string {
  switch (dateRange) {
    case "today": return "today";
    case "yesterday": return "yesterday";
    case "7days": case "last7Days": return "the last 7 days";
    case "30days": case "last30Days": return "the last 30 days";
    case "90days": case "last90Days": return "the last 90 days";
    case "thisMonth": return "this month";
    case "lastMonth": return "last month";
    default: return "the selected period";
  }
}

function getDescription(dateRange: string): string {
  switch (dateRange) {
    case "today": return "Wishlist users today";
    case "yesterday": return "Wishlist users yesterday";
    case "7days": case "last7Days": return "Wishlist users in the last 7 days";
    case "30days": case "last30Days": return "Wishlist users in the last 30 days";
    case "90days": case "last90Days": return "Wishlist users in the last 90 days";
    case "thisMonth": return "Wishlist users this month";
    case "lastMonth": return "Wishlist users last month";
    default: return "Wishlist users in the selected period";
  }
}

function getStatusFromGrowth(growth: number): "success" | "warning" | "critical" {
  if (growth === 0) return "info";
  if (growth > 0) {
    if (growth < 5) return "warning";
    return "success";
  } else {
    const decreasePercentage = Math.abs(growth);
    if (decreasePercentage < 10) return "warning";
    return "critical";
  }
}

export function WishlistUsers({
  dateRange = "30days",
  onViewSegment,
}: WishlistUsersProps) {
  const fetcher = useFetcher<WishlistUsersData>();
  const [data, setData] = useState<WishlistUsersData | null>(null);

  useEffect(() => {
    setData(null);
    fetcher.load(
      `/api/dashboard/engagement-patterns/wishlist-users?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data && typeof fetcher.data.count === "number") {
      setData({
        count: fetcher.data.count,
        dataPoints: Array.isArray(fetcher.data.dataPoints)
          ? fetcher.data.dataPoints
          : [],
      });
    }
  }, [fetcher.data]);

  const { growthPercentage, growthIndicator, description, growthTone, status } =
    useMemo(() => {
      if (!data || !data.dataPoints || data.dataPoints.length < 2) {
        return {
          growthPercentage: null,
          growthIndicator: null,
          description: getDescription(dateRange),
          growthTone: "subdued" as const,
          status: "info" as const,
        };
      }

      const [startPoint, endPoint] = data.dataPoints;
      const startCount = startPoint.count;
      const endCount = endPoint.count;

      if (startCount === 0) {
        if (endCount === 0) {
          return {
            growthPercentage: 0,
            growthIndicator: `→ 0% change in ${getPeriodLabel(dateRange)}`,
            description: getDescription(dateRange),
            growthTone: "subdued" as const,
            status: "info" as const,
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

      const growth = ((endCount - startCount) / startCount) * 100;
      const growthPercentage = Math.abs(growth);
      const isPositive = growth > 0;
      const isNegative = growth < 0;
      const periodLabel = getPeriodLabel(dateRange);
      const statusFromGrowth = getStatusFromGrowth(growth);

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

  if (!data) {
    return <InsightCardSkeleton />;
  }

  const chartData =
    data.dataPoints && data.dataPoints.length > 1
      ? (() => {
          const [startPoint, endPoint] = data.dataPoints;
          const startCount = startPoint.count;
          const endCount = endPoint.count;
          const isUpwardTrend = endCount > startCount;
          const isDownwardTrend = endCount < startCount;

          const borderColor = isUpwardTrend
            ? "rgba(75, 192, 192, 1)"
            : isDownwardTrend
              ? "rgba(255, 99, 132, 1)"
              : "rgba(128, 128, 128, 1)";

          const backgroundColor = isUpwardTrend
            ? "rgba(75, 192, 192, 0.2)"
            : isDownwardTrend
              ? "rgba(255, 99, 132, 0.2)"
              : "rgba(128, 128, 128, 0.2)";

          return {
            labels: data.dataPoints.map((point) => {
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
      : null;

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
    <InsightCard
      title="Wishlist Users"
      value={data.count}
      status={status}
      description={description}
      showViewButton={false}
      miniChartData={chartData}
      growthIndicator={growthIndicator || undefined}
      growthTone={growthTone}
      onViewSegment={onViewSegment}
      miniChartOptions={customChartOptions}
    />
  );
}

