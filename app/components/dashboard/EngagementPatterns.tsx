import { useEffect, useState } from "react";
import { Layout, BlockStack, Text, Grid, Spinner } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { InsightCard } from "./InsightCard";
import { generateMiniChartData, getGrowthIndicator, getGrowthTone, miniChartOptions } from "./dashboardUtils";

interface EngagementPatternsData {
  discountUsers: { count: number };
  wishlistUsers: { count: number };
  reviewers: { count: number };
  emailSubscribers: { count: number };
}

interface EngagementPatternsProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
}

/**
 * Engagement Patterns Section Component
 * 
 * Fetches and displays customer engagement metrics including:
 * - Discount Users
 * - Wishlist Users
 * - Reviewers
 * - Email Subscribers
 */
export function EngagementPatterns({
  dateRange = "30days",
  onViewSegment,
}: EngagementPatternsProps) {
  const fetcher = useFetcher<EngagementPatternsData>();
  const [data, setData] = useState<EngagementPatternsData | null>(null);

  useEffect(() => {
    fetcher.load(`/api/dashboard/engagement-patterns?dateRange=${dateRange}`);
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
          <Text as="p" tone="subdued">Loading engagement data...</Text>
        </BlockStack>
      </Layout.Section>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "Discount Users",
      value: data.discountUsers.count,
      status: "warning" as const,
      miniChartData: generateMiniChartData(data.discountUsers.count, "up"),
      growthIndicator: getGrowthIndicator("Discount Users"),
      growthTone: getGrowthTone("Discount Users"),
    },
    {
      title: "Wishlist Users",
      value: data.wishlistUsers.count,
      status: "info" as const,
      miniChartData: generateMiniChartData(data.wishlistUsers.count, "up"),
      growthIndicator: getGrowthIndicator("Wishlist Users"),
      growthTone: getGrowthTone("Wishlist Users"),
    },
    {
      title: "Reviewers",
      value: data.reviewers.count,
      status: "success" as const,
      miniChartData: generateMiniChartData(data.reviewers.count, "up"),
      growthIndicator: getGrowthIndicator("Reviewers"),
      growthTone: getGrowthTone("Reviewers"),
    },
    {
      title: "Email Subscribers",
      value: data.emailSubscribers.count,
      status: "info" as const,
      miniChartData: generateMiniChartData(data.emailSubscribers.count, "up"),
      growthIndicator: getGrowthIndicator("Email Subscribers"),
      growthTone: getGrowthTone("Email Subscribers"),
    },
  ];

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Engagement Patterns
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
