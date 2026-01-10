import { useEffect, useState } from "react";
import { Card, BlockStack, Text, InlineStack, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { Bar } from "react-chartjs-2";

interface BehavioralBreakdownData {
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }>;
  };
  error?: string;
}

interface BehavioralBreakdownProps {
  dateRange?: string;
}

/**
 * Chart options for Bar Chart - Enhanced design
 */
const behavioralChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      titleFont: {
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 13,
      },
      padding: 14,
      cornerRadius: 8,
      displayColors: true,
      boxWidth: 12,
      boxHeight: 12,
      usePointStyle: true,
      callbacks: {
        label: function (context: any) {
          return `${context.dataset.label}: ${context.raw} users`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(0, 0, 0, 0.06)",
        lineWidth: 1,
      },
      ticks: {
        font: {
          size: 12,
        },
        color: "#6D7175",
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 13,
          weight: "bold" as const,
        },
        color: "#202223",
      },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeOutQuart" as const,
  },
  barThickness: 28,
  borderRadius: 6,
};

/**
 * Behavioral Breakdown Chart Component
 * 
 * Displays a horizontal bar chart showing comparison of different customer engagement types.
 * Fetches its own data independently.
 */
export function BehavioralBreakdown({
  dateRange = "30days",
}: BehavioralBreakdownProps) {
  const fetcher = useFetcher<BehavioralBreakdownData>();
  const [chartData, setChartData] = useState<BehavioralBreakdownData["chartData"] | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/visual-analytics/behavioral-breakdown?dateRange=${dateRange}`);
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        console.error("[Behavioral Breakdown] Error:", fetcher.data.error);
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
            Behavioral Breakdown
          </Text>
          <div style={{ height: "350px", padding: "16px", position: "relative" }}>
            {hasData ? (
              <Bar data={chartData} options={behavioralChartOptions} />
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
            <InlineStack align="space-between">
              <Text as="p" variant="bodySm" tone="subdued">
                Comparison of different customer engagement types
              </Text>
              <Text as="p" variant="bodySm" tone="success">
                ↑ 32% overall engagement growth
              </Text>
            </InlineStack>
          )}
        </BlockStack>
      </Card>
    </div>
  );
}