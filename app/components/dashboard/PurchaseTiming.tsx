import { useEffect, useState } from "react";
import { Layout, BlockStack, Text, Grid, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "./InsightCard";
import { generateMiniChartData, getGrowthIndicator, getGrowthTone, miniChartOptions } from "./dashboardUtils";

interface PurchaseTimingData {
  morningPurchases: { count: number };
  afternoonPurchases: { count: number };
  eveningPurchases: { count: number };
  weekendPurchases: { count: number };
}

interface PurchaseTimingProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Purchase Timing Section Component
 * 
 * Fetches and displays purchase timing metrics including:
 * - Morning Purchases (6 AM - 12 PM)
 * - Afternoon Purchases (12 PM - 6 PM)
 * - Evening Purchases (6 PM - 12 AM)
 * - Weekend Purchases (Saturday - Sunday)
 */
export function PurchaseTiming({
  dateRange = "30days",
  onViewSegment,
}: PurchaseTimingProps) {
  const fetcher = useFetcher<PurchaseTimingData>();
  const [data, setData] = useState<PurchaseTimingData | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/purchase-timing?dateRange=${dateRange}`);
  }, [dateRange]);

  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  if (fetcher.state === "loading" && !data) {
    return (
      <Layout.Section>
        <BlockStack gap="400" align="center">
          <Spinner size="large" />
          <Text as="p" tone="subdued">Loading timing data...</Text>
        </BlockStack>
      </Layout.Section>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "Morning Purchases",
      value: data.morningPurchases.count,
      status: "info" as const,
      description: "6 AM - 12 PM",
      miniChartData: generateMiniChartData(data.morningPurchases.count, "up"),
      growthIndicator: getGrowthIndicator("Morning Purchases"),
      growthTone: getGrowthTone("Morning Purchases"),
    },
    {
      title: "Afternoon Purchases",
      value: data.afternoonPurchases.count,
      status: "info" as const,
      description: "12 PM - 6 PM",
      miniChartData: generateMiniChartData(data.afternoonPurchases.count, "up"),
      growthIndicator: getGrowthIndicator("Afternoon Purchases"),
      growthTone: getGrowthTone("Afternoon Purchases"),
    },
    {
      title: "Evening Purchases",
      value: data.eveningPurchases.count,
      status: "info" as const,
      description: "6 PM - 12 AM",
      miniChartData: generateMiniChartData(data.eveningPurchases.count, "up"),
      growthIndicator: getGrowthIndicator("Evening Purchases"),
      growthTone: getGrowthTone("Evening Purchases"),
    },
    {
      title: "Weekend Purchases",
      value: data.weekendPurchases.count,
      status: "success" as const,
      description: "Saturday - Sunday",
      miniChartData: generateMiniChartData(data.weekendPurchases.count, "up"),
      growthIndicator: getGrowthIndicator("Weekend Purchases"),
      growthTone: getGrowthTone("Weekend Purchases"),
    },
  ];

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Purchase Timing
        </Text>
        <Grid>
          {cards.map((card, index) => (
            <Grid.Cell
              key={index}
              columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}
            >
              <InsightCard
                title={card.title}
                value={card.value}
                status={card.status}
                description={card.description}
                miniChartData={card.miniChartData}
                growthIndicator={card.growthIndicator}
                growthTone={card.growthTone}
                onViewSegment={onViewSegment}
                miniChartOptions={miniChartOptions}
              />
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Layout.Section>
  );
}
