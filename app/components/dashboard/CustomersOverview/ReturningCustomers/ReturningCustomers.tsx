import { useEffect, useState, useMemo } from "react";
import {
  Modal,
  DataTable,
  Text,
  Spinner,
  BlockStack,
} from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { InsightCardSkeleton } from "../../InsightCardSkeleton";
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
  const customersListFetcher = useFetcher<CustomersListData>();
  const [data, setData] = useState<ReturningCustomersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showCustomersModal, setShowCustomersModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowAccessModal(false);
    setShowCustomersModal(false); // Close customers modal when date range changes
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
    return <InsightCardSkeleton />;
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

  // Handle view segment button click
  const handleViewSegment = (segmentName: string) => {
    if (segmentName === "Returning Customers") {
      setShowCustomersModal(true);
      // Fetch customers list when modal opens
      customersListFetcher.load(
        `/api/dashboard/customers-overview/returning-customers/list?dateRange=${dateRange}`,
      );
    } else if (onViewSegment) {
      onViewSegment(segmentName);
    }
  };

  // Handle export data to CSV
  const handleExportData = () => {
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
      `returning-customers-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare table data
  const tableRows =
    customersListFetcher.data?.customers?.map((customer) => [
      customer.name,
      customer.email,
      customer.createdAt,
      customer.numberOfOrders.toString(),
      customer.totalSpent,
    ]) || [];

  const tableHeadings = [
    "Name",
    "Email",
    "Created Date",
    "Orders",
    "Total Spent",
  ];

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
        onViewSegment={handleViewSegment}
        miniChartOptions={customChartOptions}
      />

      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="order"
        featureName="Returning Customers"
      />

      <Modal
        open={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        title={`Returning Customers - ${getDateRangeLabel(dateRange)}`}
        primaryAction={{
          content: "Close",
          onAction: () => setShowCustomersModal(false),
        }}
        secondaryActions={[
          {
            content: "Export Data",
            onAction: handleExportData,
            disabled:
              !customersListFetcher.data?.customers ||
              customersListFetcher.data.customers.length === 0 ||
              customersListFetcher.state === "loading",
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {customersListFetcher.state === "loading" ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner size="large" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Loading customers...
                </Text>
              </div>
            ) : customersListFetcher.data?.error ===
              "PROTECTED_ORDER_DATA_ACCESS_DENIED" ? (
              <Text as="p" variant="bodyMd" tone="critical">
                Access to order data is required to view this list. Please
                request access in your Partner Dashboard.
              </Text>
            ) : customersListFetcher.data?.customers &&
              customersListFetcher.data.customers.length > 0 ? (
              <>
                <Text as="p" variant="bodyMd">
                  Showing {customersListFetcher.data.total} returning customer
                  {customersListFetcher.data.total !== 1 ? "s" : ""} for{" "}
                  {getDateRangeLabel(dateRange)}.
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "numeric",
                    "text",
                  ]}
                  headings={tableHeadings}
                  rows={tableRows}
                />
              </>
            ) : (
              <Text as="p" variant="bodyMd">
                No returning customers found for {getDateRangeLabel(dateRange)}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
