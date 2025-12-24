import type React from "react";
import {
  BlockStack,
  Card,
  Grid,
  InlineStack,
  Text,
  Button,
  Divider,
} from "@shopify/polaris";

interface PrebuiltQueriesCardProps {
  visible: boolean;
  setQuery: (q: string) => void;
  onSubmit: () => void;
}

export function PrebuiltQueriesCard({
  visible,
  setQuery,
  onSubmit,
}: PrebuiltQueriesCardProps): React.ReactElement | null {
  if (!visible) return null;

  const run = (q: string) => {
    setQuery(q);
    onSubmit();
  };

  return (
    <Card padding="500">
      <BlockStack gap="500">
        <Text as="h2" variant="headingLg">
          Select a pre-built query to get started quickly
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          Choose from our curated collection of customer analysis queries
          organized by category
        </Text>

        <Grid>
          {/* Customer Segmentation Queries */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card background="bg-surface-secondary" padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  🎯 Customer Segmentation
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Identify and group customers by value, behavior, and
                  characteristics
                </Text>
                <Divider />
                <BlockStack gap="200">
                  <Button
                    onClick={() =>
                      run(
                        "Who are my high-value customers that have spent over $1000?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    💎 High-value customers ($1000+)
                  </Button>
                  <Button
                    onClick={() =>
                      run("Which customers have made more than 5 orders?")
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🔄 Frequent buyers (5+ orders)
                  </Button>
                  <Button
                    onClick={() =>
                      run("Who are my new customers from the last 30 days?")
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    ✨ New customers (last 30 days)
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers are my VIP members with highest lifetime value?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    👑 VIP customers (highest LTV)
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my one-time buyers that could become repeat customers?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🎯 One-time buyers (conversion potential)
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          {/* Behavior Analysis Queries */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card background="bg-surface-secondary" padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  📊 Behavior Analysis
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Understand customer patterns, engagement, and shopping habits
                </Text>
                <Divider />
                <BlockStack gap="200">
                  <Button
                    onClick={() =>
                      run(
                        "Which customers haven't ordered in the last 90 days?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    😴 Inactive customers (90+ days)
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my repeat customers that order at least once a month?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🔄 Monthly repeat buyers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers have abandoned their carts recently?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🛒 Recent cart abandoners
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my seasonal shoppers that only buy during holidays?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🎄 Seasonal shoppers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers browse frequently but rarely purchase?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    👀 High browsers, low buyers
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          {/* Revenue and ROI Queries */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card background="bg-surface-secondary" padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  💰 Revenue & ROI
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Analyze revenue patterns, profitability, and return on
                  investment
                </Text>
                <Divider />
                <BlockStack gap="200">
                  <Button
                    onClick={() =>
                      run(
                        "Which customers generate the highest profit margins?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    📈 Highest profit margin customers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my customers with declining purchase amounts?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    📉 Declining spend customers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers have the best return on marketing investment?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🎯 Best marketing ROI customers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my customers that buy premium products consistently?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    💎 Premium product buyers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers have increased their spending over time?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    📊 Growing spend customers
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          {/* Predictive Queries */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card background="bg-surface-secondary" padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  🔮 Predictive Analysis
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Forecast future behavior and identify at-risk customers
                </Text>
                <Divider />
                <BlockStack gap="200">
                  <Button
                    onClick={() =>
                      run(
                        "Which customers are at risk of churning based on their behavior?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    ⚠️ Churn risk customers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my customers likely to make their next purchase soon?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🎯 Ready-to-buy customers
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers might be interested in upselling opportunities?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    ⬆️ Upselling candidates
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Who are my customers with potential for cross-selling?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🔄 Cross-selling opportunities
                  </Button>
                  <Button
                    onClick={() =>
                      run(
                        "Which customers are likely to become brand advocates?",
                      )
                    }
                    variant="plain"
                    textAlign="left"
                    size="slim"
                  >
                    🌟 Future brand advocates
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>
      </BlockStack>
    </Card>
  );
}


