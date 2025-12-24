import { useNavigate } from "react-router";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Grid,
  Button,
  Icon,
} from "@shopify/polaris";
import {
  PersonIcon,
  FilterIcon,
  CollectionIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";

/**
 * Quick Actions Component
 *
 * Displays quick navigation buttons to main app features
 */
export function QuickActions() {
  const navigate = useNavigate();
  const quickLinks = [
    {
      title: "Start with AI Search",
      description: "Generate segments using AI",
      url: "/app/ai-search-analyzer",
      icon: PersonIcon,
      variant: "primary" as const,
    },
    {
      title: "Filter Customers Manually",
      description: "Use advanced filters",
      url: "/app/filter-audience",
      icon: FilterIcon,
      variant: "secondary" as const,
    },
    {
      title: "View Saved Lists",
      description: "Manage your segments",
      url: "/app/my-saved-lists",
      icon: CollectionIcon,
      variant: "secondary" as const,
    },
    {
      title: "Open Settings",
      description: "Configure your app",
      url: "/app/settings",
      icon: SettingsIcon,
      variant: "secondary" as const,
    },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Quick Actions
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Jump straight into the features you need
          </Text>
        </BlockStack>

        <Grid>
          {quickLinks.map((link, index) => (
            <Grid.Cell
              key={index}
              columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
            >
              <Card>
                <BlockStack gap="300">
                  <InlineStack gap="200" align="start">
                    <Icon source={link.icon} tone="base" />

                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {link.title}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {link.description}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <Button
                    variant={link.variant}
                    onClick={() => navigate(link.url)}
                    fullWidth
                  >
                    {link.title}
                  </Button>
                </BlockStack>
              </Card>
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Card>
  );
}
