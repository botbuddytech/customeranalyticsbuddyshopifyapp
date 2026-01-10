import { useEffect, useState } from "react";
import { Card, BlockStack, Text, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { Doughnut } from "react-chartjs-2";

interface CustomerSegmentationData {
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  };
  error?: string;
}

interface CustomerSegmentationProps {
  dateRange?: string;
}

/**
 * Chart options for Donut Chart
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%", // This creates the donut hole (hollow center)
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleFont: {
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 4,
      displayColors: true,
      boxWidth: 10,
      boxHeight: 10,
      usePointStyle: true,
    },
  },
};

/**
 * Customer Segmentation Chart Component
 * 
 * Displays a donut chart showing distribution of orders by payment type and status.
 * Fetches its own data independently.
 */
export function CustomerSegmentation({
  dateRange = "30days",
}: CustomerSegmentationProps) {
  const fetcher = useFetcher<CustomerSegmentationData>();
  const [chartData, setChartData] = useState<CustomerSegmentationData["chartData"] | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/visual-analytics/customer-segmentation?dateRange=${dateRange}`);
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        console.error("[Customer Segmentation] Error:", fetcher.data.error);
        setChartData(null);
      } else {
        setChartData(fetcher.data.chartData);
      }
    }
  }, [fetcher.data]);

  if (fetcher.state === "loading" && !chartData) {
    return (
      <Card padding="400">
        <BlockStack gap="300" align="center">
          <Spinner size="large" />
          <Text as="p" tone="subdued">Loading chart data...</Text>
        </BlockStack>
      </Card>
    );
  }

  // Check if chartData exists and has actual data
  const hasData = chartData && 
    chartData.labels && 
    chartData.labels.length > 0 && 
    chartData.datasets && 
    chartData.datasets.length > 0 &&
    chartData.datasets[0].data &&
    chartData.datasets[0].data.some((value: number) => value > 0);

  return (
    <div style={{ height: "100%" }}>
      <Card padding="400">
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            Customer Segmentation
          </Text>
          <div style={{ height: "350px", padding: "16px", position: "relative" }}>
            {hasData ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "1rem",
                    opacity: 0.3,
                  }}
                >
                  📊
                </div>
                <Text as="p" variant="bodyLg" tone="subdued" fontWeight="medium">
                  No data available to show
                </Text>
                <Text as="p" variant="bodySm" tone="subdued" style={{ marginTop: "0.5rem" }}>
                  There is no data for the selected period.
                </Text>
              </div>
            )}
          </div>
          {hasData && (
            <Text as="p" variant="bodySm" tone="subdued">
              Distribution of orders by payment type and status
            </Text>
          )}
        </BlockStack>
      </Card>
    </div>
  );
}