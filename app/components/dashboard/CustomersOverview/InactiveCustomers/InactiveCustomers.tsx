import { useEffect, useState, useMemo } from "react";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { InsightCardSkeleton } from "../../InsightCardSkeleton";
import { miniChartOptions } from "../../dashboardUtils";
import {
  DashboardSegmentModal,
  type DashboardSegmentData,
} from "../../DashboardSegmentModal";

interface InactiveCustomersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface InactiveCustomersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  onShowToast?: (message: string) => void;
}

// Using shared types from DashboardSegmentModal

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
 * Get description text based on date range
 */
function getDescription(dateRange: string): string {
  switch (dateRange) {
    case "today":
      return "Inactive customers today";
    case "yesterday":
      return "Inactive customers yesterday";
    case "7days":
    case "last7Days":
      return "Inactive customers in the last 7 days";
    case "30days":
    case "last30Days":
      return "Inactive customers in the last 30 days";
    case "90days":
    case "last90Days":
      return "Inactive customers in the last 90 days";
    case "thisMonth":
      return "Inactive customers this month";
    case "lastMonth":
      return "Inactive customers last month";
    default:
      return "Inactive customers in the selected period";
  }
}

/**
 * Get status badge based on growth percentage
 *
 * For Inactive Customers:
 * - Decrease is good (success)
 * - Increase is bad (critical/warning)
 * - No change is neutral
 */
function getStatusFromGrowth(
  growth: number,
): "success" | "warning" | "critical" {
  if (growth === 0) {
    return "warning"; // Stable = Attention
  }

  if (growth < 0) {
    // Negative growth (decrease in inactive customers) = Good
    const decreasePercentage = Math.abs(growth);
    if (decreasePercentage < 5) {
      return "warning"; // 0-5% decrease = Attention
    }
    return "success"; // 5%+ decrease = Good (fewer inactive customers)
  } else {
    // Positive growth (increase in inactive customers) = Bad
    if (growth < 10) {
      return "warning"; // 0-10% increase = Attention
    }
    return "critical"; // 10%+ increase = Issue (more inactive customers)
  }
}

/**
 * Inactive Customers Card Component
 *
 * Fetches and displays inactive customers count independently.
 * Fully dynamic - calculates growth and generates description based on data.
 * Shows customers who exist but did NOT place orders in the selected date range.
 */
export function InactiveCustomers({
  dateRange = "30days",
  onViewSegment,
  onShowToast,
}: InactiveCustomersProps) {
  const fetcher = useFetcher<InactiveCustomersData>();
  const customersListFetcher = useFetcher<DashboardSegmentData>();
  const [data, setData] = useState<InactiveCustomersData | null>(null);
  const [showCustomersModal, setShowCustomersModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowCustomersModal(false); // Close customers modal when date range changes
    fetcher.load(
      `/api/dashboard/customers-overview/inactive-customers?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (
        fetcher.data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
        fetcher.data.error === "PROTECTED_ORDER_DATA_ACCESS_DENIED"
      ) {
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
    useMemo<{
      growthPercentage: number | null;
      growthIndicator: string | null;
      description: string;
      growthTone: "success" | "subdued" | "critical";
      status: "success" | "warning" | "critical";
    }>(() => {
      if (!data || !data.dataPoints || data.dataPoints.length < 2) {
        return {
          growthPercentage: null,
          growthIndicator: null,
          description: getDescription(dateRange),
          growthTone: "subdued" as const,
          status: "warning" as const,
        };
      }

      const [startPoint, endPoint] = data.dataPoints;
      const startCount = startPoint.count;
      const endCount = endPoint.count;

      // Handle division by zero
      if (startCount === 0) {
        if (endCount === 0) {
          return {
            growthPercentage: 0,
            growthIndicator: `→ 0% change in ${getPeriodLabel(dateRange)}`,
            description: getDescription(dateRange),
            growthTone: "subdued" as const,
            status: "warning" as const,
          };
        }
        const periodLabel = getPeriodLabel(dateRange);
        return {
          growthPercentage: 100,
          growthIndicator: `↑ 100% increase in ${periodLabel}`,
          description: getDescription(dateRange),
          growthTone: "critical" as const, // Increase in inactive = Bad
          status: "critical" as const,
        };
      }

      // Calculate growth percentage
      const growth = ((endCount - startCount) / startCount) * 100;
      const growthPercentage = Math.abs(growth);
      const isPositive = growth > 0; // Increase in inactive = Bad
      const isNegative = growth < 0; // Decrease in inactive = Good
      const periodLabel = getPeriodLabel(dateRange);
      const statusFromGrowth = getStatusFromGrowth(growth);

      // Format growth indicator text
      // For inactive customers: decrease is good, increase is bad
      let growthIndicatorText: string;
      if (growthPercentage === 0) {
        growthIndicatorText = `→ 0% change in ${periodLabel}`;
      } else if (isPositive) {
        growthIndicatorText = `↑ ${growthPercentage.toFixed(0)}% increase in ${periodLabel}`;
      } else {
        growthIndicatorText = `↓ ${growthPercentage.toFixed(0)}% decrease in ${periodLabel}`;
      }

      return {
        growthPercentage,
        growthIndicator: growthIndicatorText,
        description: getDescription(dateRange),
        growthTone: isPositive
          ? ("critical" as const) // Increase = Bad (red)
          : isNegative
            ? ("success" as const) // Decrease = Good (green)
            : ("subdued" as const),
        status: statusFromGrowth,
      };
    }, [data, dateRange]);

  // Show skeleton while loading or if we don't have data yet
  if (!data) {
    return <InsightCardSkeleton />;
  }

  // Convert dataPoints to Chart.js format
  // For single point (today), don't show chart
  // For Inactive Customers: decrease is good (green), increase is bad (red)
  const chartData =
    data.dataPoints && data.dataPoints.length > 1
      ? (() => {
          const [startPoint, endPoint] = data.dataPoints;
          const startCount = startPoint.count;
          const endCount = endPoint.count;
          // For inactive customers, decrease is good (green), increase is bad (red)
          const isDecreasing = endCount < startCount;
          const isIncreasing = endCount > startCount;

          // Green for decreasing (good), red for increasing (bad), gray for no change
          const borderColor = isDecreasing
            ? "rgba(75, 192, 192, 1)" // Green (decrease is good)
            : isIncreasing
              ? "rgba(255, 99, 132, 1)" // Red (increase is bad)
              : "rgba(128, 128, 128, 1)"; // Gray for no change

          const backgroundColor = isDecreasing
            ? "rgba(75, 192, 192, 0.2)" // Green with transparency
            : isIncreasing
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

  // Handle view segment button click
  const handleViewSegment = (segmentName: string) => {
    if (segmentName === "Inactive Customers") {
      setShowCustomersModal(true);
      // Fetch customers list when modal opens
      customersListFetcher.load(
        `/api/dashboard/customers-overview/inactive-customers/list?dateRange=${dateRange}`,
      );
    } else if (onViewSegment) {
      onViewSegment(segmentName);
    }
  };

  // Handle export data to CSV
  const handleExportCSV = () => {
    const customers = customersListFetcher.data?.customers;
    if (!customers || customers.length === 0) {
      return;
    }

    // Create CSV headers
    const headers = ["Name", "Email", "Created Date", "Orders", "Total Spent"];

    // Create CSV rows
    const csvRows = [
      headers.join(","),
      ...customers.map((customer) =>
        [
          `"${customer.name.replace(/"/g, '""')}"`,
          `"${customer.email.replace(/"/g, '""')}"`,
          `"${customer.createdAt}"`,
          customer.numberOfOrders.toString(),
          `"${customer.totalSpent}"`,
        ].join(","),
      ),
    ];

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inactive-customers-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <InsightCard
        title="Inactive Customers"
        value={data.count}
        status={status}
        description={description}
        showViewButton={true}
        miniChartData={chartData}
        growthIndicator={growthIndicator || undefined}
        growthTone={growthTone}
        onViewSegment={handleViewSegment}
        miniChartOptions={customChartOptions}
      />

      <DashboardSegmentModal
        open={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        title={`Inactive Customers${getDateRangeLabel(dateRange) ? ` - ${getDateRangeLabel(dateRange)}` : ""}`}
        data={customersListFetcher.data || null}
        isLoading={customersListFetcher.state === "loading"}
        dateRangeLabel={getDateRangeLabel(dateRange)}
        onExportCSV={handleExportCSV}
        featureName="Inactive Customers"
        onShowToast={onShowToast}
      />
    </>
  );
}
