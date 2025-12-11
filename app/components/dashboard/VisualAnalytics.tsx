import { useEffect, useState } from "react";
import { Layout, BlockStack, Text, InlineStack, Card, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { Pie, Bar } from "react-chartjs-2";

interface VisualAnalyticsData {
  orderTypeData: any;
  engagementData: any;
}

interface VisualAnalyticsProps {
  dateRange?: string;
}

/**
 * Chart options
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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

const behavioralChartOptions = {
  ...chartOptions,
  indexAxis: "y" as const,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      display: false,
    },
    tooltip: {
      ...chartOptions.plugins.tooltip,
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
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 12,
        },
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
      },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeOutQuart" as const,
  },
  barThickness: 25,
  borderRadius: 4,
};

/**
 * Visual Analytics Section Component
 * 
 * Fetches and displays chart visualizations including:
 * - Customer Segmentation (Pie Chart)
 * - Behavioral Breakdown (Bar Chart)
 */
export function VisualAnalytics({
  dateRange = "30days",
}: VisualAnalyticsProps) {
  const fetcher = useFetcher<VisualAnalyticsData>();
  const [data, setData] = useState<VisualAnalyticsData | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/visual-analytics?dateRange=${dateRange}`);
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  if (fetcher.state === "loading" && !data) {
    return (
      <>
        <Layout>
          <Layout.Section>
            <Text as="h2" variant="headingLg">
              Visual Analytics
            </Text>
          </Layout.Section>
        </Layout>
        <Layout>
          <Layout.Section variant="oneHalf">
            <BlockStack gap="400" align="center">
              <Spinner size="large" />
              <Text as="p" tone="subdued">Loading chart data...</Text>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      {/* Section Header */}
      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingLg">
            Visual Analytics
          </Text>
        </Layout.Section>
      </Layout>

      {/* Charts Side by Side */}
      <Layout>
        {/* Customer Segmentation Chart */}
        <Layout.Section variant="oneHalf">
          <div style={{ height: "100%" }}>
            <Card padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Customer Segmentation
                </Text>
                <div style={{ height: "350px", padding: "16px" }}>
                  <Pie data={data.orderTypeData} options={chartOptions} />
                </div>
                <Text as="p" variant="bodySm" tone="subdued">
                  Distribution of orders by payment type and status
                </Text>
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>

        {/* Behavioral Breakdown Chart */}
        <Layout.Section variant="oneHalf">
          <div style={{ height: "100%" }}>
            <Card padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Behavioral Breakdown
                </Text>
                <div style={{ height: "350px", padding: "16px" }}>
                  <Bar data={data.engagementData} options={behavioralChartOptions} />
                </div>
                <InlineStack align="space-between">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Comparison of different customer engagement types
                  </Text>
                  <Text as="p" variant="bodySm" tone="success">
                    ↑ 32% overall engagement growth
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </>
  );
}
