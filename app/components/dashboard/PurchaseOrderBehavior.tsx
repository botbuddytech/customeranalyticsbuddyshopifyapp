import { useEffect, useState } from "react";
import { Layout, BlockStack, Text, Grid, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "./InsightCard";
import {
  generateMiniChartData,
  getGrowthIndicator,
  getGrowthTone,
  miniChartOptions,
} from "./dashboardUtils";

interface OrderBehaviorData {
  codOrders: { count: number };
  prepaidOrders: { count: number };
  cancelledOrders: { count: number };
  abandonedOrders: { count: number };
}

interface PurchaseOrderBehaviorProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Purchase & Order Behavior Section Component
 *
 * Fetches and displays order behavior metrics including:
 * - COD Orders
 * - Prepaid Orders
 * - Cancelled Orders
 * - Abandoned Carts
 */
export function PurchaseOrderBehavior({
  dateRange = "30days",
  onViewSegment,
}: PurchaseOrderBehaviorProps) {
  const fetcher = useFetcher<OrderBehaviorData>();
  const [data, setData] = useState<OrderBehaviorData | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/order-behavior?dateRange=${dateRange}`);
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
          <Text as="p" tone="subdued">
            Loading order data...
          </Text>
        </BlockStack>
      </Layout.Section>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "COD Orders",
      value: data.codOrders.count,
      status: "info" as const,
      showViewButton: true,
      miniChartData: generateMiniChartData(data.codOrders.count, "up"),
      growthIndicator: getGrowthIndicator("COD Orders"),
      growthTone: getGrowthTone("COD Orders"),
    },
    {
      title: "Prepaid Orders",
      value: data.prepaidOrders.count,
      status: "success" as const,
      showViewButton: true,
      miniChartData: generateMiniChartData(data.prepaidOrders.count, "up"),
      growthIndicator: getGrowthIndicator("Prepaid Orders"),
      growthTone: getGrowthTone("Prepaid Orders"),
    },
    {
      title: "Cancelled Orders",
      value: data.cancelledOrders.count,
      status: "critical" as const,
      showViewButton: true,
      miniChartData: generateMiniChartData(data.cancelledOrders.count, "down"),
      growthIndicator: getGrowthIndicator("Cancelled Orders"),
      growthTone: getGrowthTone("Cancelled Orders"),
    },
    {
      title: "Abandoned Carts",
      value: data.abandonedOrders.count,
      status: "warning" as const,
      showViewButton: true,
      miniChartData: generateMiniChartData(data.abandonedOrders.count, "down"),
      growthIndicator: getGrowthIndicator("Abandoned Carts"),
      growthTone: getGrowthTone("Abandoned Carts"),
    },
  ];

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Purchase & Order Behavior
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
                showViewButton={card.showViewButton}
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
