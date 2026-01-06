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

interface CODOrdersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface CODOrdersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  total: string;
  status: string;
}

interface OrdersListData {
  orders: Order[];
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
      return "COD orders today";
    case "yesterday":
      return "COD orders yesterday";
    case "7days":
    case "last7Days":
      return "COD orders in the last 7 days";
    case "30days":
    case "last30Days":
      return "COD orders in the last 30 days";
    case "90days":
    case "last90Days":
      return "COD orders in the last 90 days";
    case "thisMonth":
      return "COD orders this month";
    case "lastMonth":
      return "COD orders last month";
    default:
      return "COD orders in the selected period";
  }
}

/**
 * Get status badge based on growth percentage
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
      return "warning"; // 0-5% = Attention
    }
    return "success"; // 5%+ = Good
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
 * COD Orders Card Component
 *
 * Fetches and displays COD orders count independently.
 */
export function CODOrders({
  dateRange = "30days",
  onViewSegment,
}: CODOrdersProps) {
  const fetcher = useFetcher<CODOrdersData>();
  const ordersListFetcher = useFetcher<OrdersListData>();
  const [data, setData] = useState<CODOrdersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowAccessModal(false);
    setShowOrdersModal(false);
    fetcher.load(
      `/api/dashboard/purchase-order-behavior/cod-orders?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
        setShowAccessModal(true);
        setData(null);
      } else if (typeof fetcher.data.count === "number") {
        setData({
          count: fetcher.data.count,
          dataPoints: Array.isArray(fetcher.data.dataPoints)
            ? fetcher.data.dataPoints
            : [],
        });
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

  // Show skeleton while loading
  if (!data && !showAccessModal) {
    return <InsightCardSkeleton />;
  }

  if (!data) {
    return showAccessModal ? (
      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="order"
        featureName="COD Orders"
      />
    ) : null;
  }

  // Convert dataPoints to Chart.js format with dynamic colors
  const chartData =
    data.dataPoints && data.dataPoints.length > 1
      ? (() => {
          const [startPoint, endPoint] = data.dataPoints;
          const startCount = startPoint.count;
          const endCount = endPoint.count;
          const isUpwardTrend = endCount > startCount;
          const isDownwardTrend = endCount < startCount;

          const borderColor = isUpwardTrend
            ? "rgba(75, 192, 192, 1)" // Green
            : isDownwardTrend
              ? "rgba(255, 99, 132, 1)" // Red
              : "rgba(128, 128, 128, 1)"; // Gray

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

  // Handle view segment button click
  const handleViewSegment = (segmentName: string) => {
    if (segmentName === "COD Orders") {
      setShowOrdersModal(true);
      ordersListFetcher.load(
        `/api/dashboard/purchase-order-behavior/cod-orders/list?dateRange=${dateRange}`,
      );
    } else if (onViewSegment) {
      onViewSegment(segmentName);
    }
  };

  // Handle export data to CSV
  const handleExportData = () => {
    const orders = ordersListFetcher.data?.orders;
    if (!orders || orders.length === 0) {
      return;
    }

    const headers = ["Order Number", "Customer Name", "Customer Email", "Date", "Total", "Status"];

    const csvRows = [
      headers.join(","),
      ...orders.map((order) =>
        [
          `"${order.orderNumber.replace(/"/g, '""')}"`,
          `"${order.customerName.replace(/"/g, '""')}"`,
          `"${order.customerEmail.replace(/"/g, '""')}"`,
          `"${order.createdAt}"`,
          `"${order.total}"`,
          `"${order.status}"`,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cod-orders-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare table data
  const tableRows =
    ordersListFetcher.data?.orders?.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.createdAt,
      order.total,
      order.status,
    ]) || [];

  const tableHeadings = [
    "Order Number",
    "Customer Name",
    "Customer Email",
    "Date",
    "Total",
    "Status",
  ];

  return (
    <>
      <InsightCard
        title="COD Orders"
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
        featureName="COD Orders"
      />

      <Modal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        title={`COD Orders - ${getDateRangeLabel(dateRange)}`}
        primaryAction={{
          content: "Close",
          onAction: () => setShowOrdersModal(false),
        }}
        secondaryActions={[
          {
            content: "Export Data",
            onAction: handleExportData,
            disabled:
              !ordersListFetcher.data?.orders ||
              ordersListFetcher.data.orders.length === 0 ||
              ordersListFetcher.state === "loading",
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {ordersListFetcher.state === "loading" ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner size="large" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Loading orders...
                </Text>
              </div>
            ) : ordersListFetcher.data?.error ===
              "PROTECTED_ORDER_DATA_ACCESS_DENIED" ? (
              <Text as="p" variant="bodyMd" tone="critical">
                Access to order data is required to view this list. Please
                request access in your Partner Dashboard.
              </Text>
            ) : ordersListFetcher.data?.orders &&
              ordersListFetcher.data.orders.length > 0 ? (
              <>
                <Text as="p" variant="bodyMd">
                  Showing {ordersListFetcher.data.total} COD order
                  {ordersListFetcher.data.total !== 1 ? "s" : ""} for{" "}
                  {getDateRangeLabel(dateRange)}.
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={tableHeadings}
                  rows={tableRows}
                />
              </>
            ) : (
              <Text as="p" variant="bodyMd">
                No COD orders found for {getDateRangeLabel(dateRange)}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}

