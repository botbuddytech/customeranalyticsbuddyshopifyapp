import { useEffect, useState, useMemo } from "react";
import { Modal, DataTable, Text, Spinner, BlockStack } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "../../InsightCard";
import { InsightCardSkeleton } from "../../InsightCardSkeleton";
import { miniChartOptions } from "../../dashboardUtils";
import { ProtectedDataAccessModal } from "../../ProtectedDataAccessModal";

interface EmailSubscribersData {
  count: number;
  dataPoints: Array<{ date: string; count: number }>;
  error?: string;
}

interface EmailSubscribersProps {
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
    case "today": return "Email subscribers today";
    case "yesterday": return "Email subscribers yesterday";
    case "7days": case "last7Days": return "Email subscribers in the last 7 days";
    case "30days": case "last30Days": return "Email subscribers in the last 30 days";
    case "90days": case "last90Days": return "Email subscribers in the last 90 days";
    case "thisMonth": return "Email subscribers this month";
    case "lastMonth": return "Email subscribers last month";
    default: return "Email subscribers in the selected period";
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

export function EmailSubscribers({
  dateRange = "30days",
  onViewSegment,
}: EmailSubscribersProps) {
  const fetcher = useFetcher<EmailSubscribersData>();
  const customersListFetcher = useFetcher<CustomersListData>();
  const [data, setData] = useState<EmailSubscribersData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showCustomersModal, setShowCustomersModal] = useState(false);

  useEffect(() => {
    setData(null);
    setShowAccessModal(false);
    setShowCustomersModal(false);
    fetcher.load(
      `/api/dashboard/engagement-patterns/email-subscribers?dateRange=${dateRange}`,
    );
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
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

  // Show skeleton while loading
  if (!data && !showAccessModal) {
    return <InsightCardSkeleton />;
  }

  if (!data) {
    return showAccessModal ? (
      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        dataType="customer"
        featureName="Email Subscribers"
      />
    ) : null;
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

  // Handle view segment button click
  const handleViewSegment = (segmentName: string) => {
    if (segmentName === "Email Subscribers") {
      setShowCustomersModal(true);
      customersListFetcher.load(
        `/api/dashboard/engagement-patterns/email-subscribers/list?dateRange=${dateRange}`,
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

    const headers = ["Name", "Email", "Created At", "Number of Orders", "Total Spent"];

    const csvRows = [
      headers.join(","),
      ...customers.map((customer) =>
        [
          `"${customer.name.replace(/"/g, '""')}"`,
          `"${customer.email.replace(/"/g, '""')}"`,
          `"${customer.createdAt}"`,
          `"${customer.numberOfOrders}"`,
          `"${customer.totalSpent}"`,
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
      `email-subscribers-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
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
    "Created At",
    "Number of Orders",
    "Total Spent",
  ];

  return (
    <>
      <InsightCard
        title="Email Subscribers"
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
        dataType="customer"
        featureName="Email Subscribers"
      />

      <Modal
        open={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        title={`Email Subscribers - ${getDateRangeLabel(dateRange)}`}
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
              "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ? (
              <Text as="p" variant="bodyMd" tone="critical">
                Access to customer data is required to view this list. Please
                request access in your Partner Dashboard.
              </Text>
            ) : customersListFetcher.data?.customers &&
              customersListFetcher.data.customers.length > 0 ? (
              <>
                <Text as="p" variant="bodyMd">
                  Showing {customersListFetcher.data.total} customer
                  {customersListFetcher.data.total !== 1 ? "s" : ""} who subscribed to email for{" "}
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
                No email subscribers found for {getDateRangeLabel(dateRange)}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}

