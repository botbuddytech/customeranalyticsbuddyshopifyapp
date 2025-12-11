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

interface CancelledOrdersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface CancelledOrdersProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  cancelledAt: string;
  total: string;
}

interface OrdersListData {
  orders: Order[];
  total: number;
  error?: string;
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
    case "today": return "Cancelled orders today";
    case "yesterday": return "Cancelled orders yesterday";
    case "7days": case "last7Days": return "Cancelled orders in the last 7 days";
    case "30days": case "last30Days": return "Cancelled orders in the last 30 days";
    case "90days": case "last90Days": return "Cancelled orders in the last 90 days";
    case "thisMonth": return "Cancelled orders this month";
    case "lastMonth": return "Cancelled orders last month";
    default: return "Cancelled orders in the selected period";
  }
}

function getStatusFromGrowth(growth: number): "success" | "warning" | "critical" {
  if (growth === 0) return "warning";
  // For cancelled orders: decrease is good, increase is bad
  if (growth < 0) {
    // Negative growth (decrease) = Good
    const decreasePercentage = Math.abs(growth);
    if (decreasePercentage < 5) return "warning";
    return "success";
  } else {
    // Positive growth (increase) = Bad
    if (growth < 10) return "warning";
    return "critical";
  }
}

export function CancelledOrders({
  dateRange = "30days",
  onViewSegment,
}: CancelledOrdersProps) {
  const fetcher = useFetcher<CancelledOrdersData>();
  const ordersListFetcher = useFetcher<OrdersListData>();
  const [data, setData] = useState<CancelledOrdersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowAccessModal(false);
    setShowOrdersModal(false);
    fetcher.load(
      `/api/dashboard/purchase-order-behavior/cancelled-orders?dateRange=${dateRange}`,
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

  const { growthPercentage, growthIndicator, description, growthTone, status } =
    useMemo(() => {
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
          growthTone: "critical" as const,
          status: "critical" as const,
        };
      }

      const growth = ((endCount - startCount) / startCount) * 100;
      const growthPercentage = Math.abs(growth);
      const isPositive = growth > 0; // Increase = Bad
      const isNegative = growth < 0; // Decrease = Good
      const periodLabel = getPeriodLabel(dateRange);
      const statusFromGrowth = getStatusFromGrowth(growth);

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

  if (!data && !showAccessModal) {
    return <InsightCardSkeleton />;
  }

  if (!data) {
    return showAccessModal ? (
      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="order"
        featureName="Cancelled Orders"
      />
    ) : null;
  }

  const chartData =
    data.dataPoints && data.dataPoints.length > 1
      ? (() => {
          const [startPoint, endPoint] = data.dataPoints;
          const startCount = startPoint.count;
          const endCount = endPoint.count;
          // For cancelled orders: decrease is good (green), increase is bad (red)
          const isDecreasing = endCount < startCount;
          const isIncreasing = endCount > startCount;

          const borderColor = isDecreasing
            ? "rgba(75, 192, 192, 1)" // Green (decrease is good)
            : isIncreasing
              ? "rgba(255, 99, 132, 1)" // Red (increase is bad)
              : "rgba(128, 128, 128, 1)"; // Gray

          const backgroundColor = isDecreasing
            ? "rgba(75, 192, 192, 0.2)"
            : isIncreasing
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

  const handleViewSegment = (segmentName: string) => {
    if (segmentName === "Cancelled Orders") {
      setShowOrdersModal(true);
      ordersListFetcher.load(
        `/api/dashboard/purchase-order-behavior/cancelled-orders/list?dateRange=${dateRange}`,
      );
    } else if (onViewSegment) {
      onViewSegment(segmentName);
    }
  };

  const handleExportData = () => {
    const orders = ordersListFetcher.data?.orders;
    if (!orders || orders.length === 0) {
      return;
    }

    const headers = ["Order Number", "Customer Name", "Customer Email", "Created Date", "Cancelled Date", "Total"];

    const csvRows = [
      headers.join(","),
      ...orders.map((order) =>
        [
          `"${order.orderNumber.replace(/"/g, '""')}"`,
          `"${order.customerName.replace(/"/g, '""')}"`,
          `"${order.customerEmail.replace(/"/g, '""')}"`,
          `"${order.createdAt}"`,
          `"${order.cancelledAt}"`,
          `"${order.total}"`,
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
      `cancelled-orders-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableRows =
    ordersListFetcher.data?.orders?.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.createdAt,
      order.cancelledAt,
      order.total,
    ]) || [];

  const tableHeadings = [
    "Order Number",
    "Customer Name",
    "Customer Email",
    "Created Date",
    "Cancelled Date",
    "Total",
  ];

  return (
    <>
      <InsightCard
        title="Cancelled Orders"
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
        featureName="Cancelled Orders"
      />

      <Modal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        title={`Cancelled Orders - ${getDateRangeLabel(dateRange)}`}
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
                  Showing {ordersListFetcher.data.total} cancelled order
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
                No cancelled orders found for {getDateRangeLabel(dateRange)}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
