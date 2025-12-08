/**
 * Filter Audience Page for AI Audience Insight Shopify App
 *
 * This page provides a comprehensive filtering interface for creating
 * targeted customer segments based on various criteria including:
 * - Geographic location and demographics
 * - Purchase behavior and product preferences
 * - Device usage and browsing patterns
 * - Engagement metrics and customer lifecycle
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, Form } from "react-router";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Grid,
  Banner,
  Tag,
  Collapsible,
  Badge,
  Icon,
  Box,
  Tooltip,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LocationIcon,
  ProductIcon,
  ClockIcon,
  PhoneIcon,
  CreditCardIcon,
  DeliveryIcon,
  PersonIcon,
  FilterIcon,
  ExportIcon,
  EmailIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

// Loader function to authenticate and provide initial data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // In a real app, you would fetch data from your database or Shopify API
  return {
    // Mock data for demonstration
    locations: {
      popular: ["United States", "Canada", "United Kingdom", "Australia"],
      regions: [
        "North America",
        "Europe",
        "Asia",
        "South America",
        "Africa",
        "Oceania",
      ],
      international: [
        "India",
        "Germany",
        "France",
        "Japan",
        "Brazil",
        "Mexico",
      ],
    },
    products: ["Product A", "Product B", "Product C", "Product D"],
    categories: ["Category 1", "Category 2", "Category 3"],
    collections: ["Summer Collection", "Winter Collection", "Special Offers"],
  };
};

// Action function to handle form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  // Get form data
  const formData = await request.formData();
  const filterData = Object.fromEntries(formData);

  // In a real app, this would create a Prisma query or Shopify GraphQL query
  // For now, we'll just return the filter data
  return {
    success: true,
    filterData,
    matchCount: Math.floor(Math.random() * 100), // Mock count of matching customers
  };
};

/**
 * Main Filter Audience Page Component
 *
 * Provides a compact, modern interface for creating customer segments
 * with comprehensive filtering options and real-time preview.
 */
export default function FilterAudiencePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page fullWidth>
      <TitleBar title="Filter Audience" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* ==========================================
                   Compact Header
                   ========================================== */}

            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="h1" variant="headingLg">
                  🎯 Filter Audience
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Create targeted customer segments with advanced filters
                </Text>
              </BlockStack>
              <Badge tone="info">Segment Builder</Badge>
            </InlineStack>

            <AudienceFilterForm />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * Compact Audience Filter Form Component
 *
 * Provides an organized, space-efficient interface for building
 * customer segments with multiple filter categories.
 */
function AudienceFilterForm() {
  // ==========================================
  // State Management
  // ==========================================

  // Compact state for essential sections only
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    location: true,
    products: false,
    timing: false,
    device: false,
    payment: false,
    delivery: false,
  });

  // Selected filters state
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    location: [],
    products: [],
    timing: [],
    device: [],
    payment: [],
    delivery: [],
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewCount, setPreviewCount] = useState<number>(0);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    section: string,
    value: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedFilters({
        ...selectedFilters,
        [section]: [...(selectedFilters[section] || []), value],
      });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [section]: (selectedFilters[section] || []).filter(
          (item) => item !== value,
        ),
      });
    }
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setResults({
        matchCount: Math.floor(Math.random() * 1000) + 1,
        filters: selectedFilters,
      });
      setIsSubmitting(false);
    }, 1500);
  };

  // ==========================================
  // Helper Functions
  // ==========================================

  // Get total selected filters count
  const getTotalFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, filters) => total + filters.length,
      0,
    );
  };

  // Get section icon
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "location":
        return LocationIcon;
      case "products":
        return ProductIcon;
      case "timing":
        return ClockIcon;
      case "device":
        return PhoneIcon;
      case "payment":
        return CreditCardIcon;
      case "delivery":
        return DeliveryIcon;
      default:
        return FilterIcon;
    }
  };

  // Render compact filter section
  const renderCompactFilterSection = (
    title: string,
    section: string,
    options: string[],
    emoji: string,
  ) => {
    const selectedCount = selectedFilters[section]?.length || 0;
    const isExpanded = expandedSections[section];

    return (
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                {emoji} {title}
              </Text>
              {selectedCount > 0 && (
                <Badge tone="info" size="small">
                  {`${selectedCount} selected`}
                </Badge>
              )}
            </InlineStack>
            <Button
              size="slim"
              variant="plain"
              icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              onClick={() => toggleSection(section)}
            />
          </InlineStack>

          <Collapsible open={isExpanded} id={`section-${section}`}>
            <Grid>
              {options.map((option, index) => (
                <Grid.Cell
                  key={index}
                  columnSpan={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 3 }}
                >
                  <Checkbox
                    label={option}
                    checked={
                      selectedFilters[section]?.includes(option) || false
                    }
                    onChange={(checked) =>
                      handleCheckboxChange(section, option, checked)
                    }
                  />
                </Grid.Cell>
              ))}
            </Grid>
          </Collapsible>
        </BlockStack>
      </Card>
    );
  };

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <Layout>
        {/* ==========================================
             Left Column: Filter Sections
             ========================================== */}

        <Layout.Section>
          <BlockStack gap="400">
            {/* Filter Summary Card */}
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">
                    🔍 Active Filters
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {getTotalFiltersCount()} filters applied
                  </Text>
                </BlockStack>
                <InlineStack gap="200">
                  <Button
                    size="slim"
                    onClick={() => setSelectedFilters({})}
                    disabled={getTotalFiltersCount() === 0}
                  >
                    Clear All
                  </Button>
                  <Button
                    size="slim"
                    variant="primary"
                    submit
                    loading={isSubmitting}
                    disabled={getTotalFiltersCount() === 0}
                  >
                    Generate Segment
                  </Button>
                </InlineStack>
              </InlineStack>
            </Card>

            {/* Compact Filter Sections */}
            {renderCompactFilterSection(
              "Geographic Location",
              "location",
              [
                "United States",
                "Canada",
                "United Kingdom",
                "Australia",
                "India",
                "Germany",
                "France",
                "Japan",
                "Brazil",
                "Mexico",
                "North America",
                "Europe",
                "Asia",
                "South America",
              ],
              "🌍",
            )}

            {renderCompactFilterSection(
              "Products & Categories",
              "products",
              [
                "Product A",
                "Product B",
                "Product C",
                "Product D",
                "Category 1",
                "Category 2",
                "Category 3",
                "Summer Collection",
                "Winter Collection",
                "Special Offers",
              ],
              "🛍️",
            )}

            {renderCompactFilterSection(
              "Shopping Timing",
              "timing",
              [
                "Morning (6am-12pm)",
                "Afternoon (12pm-6pm)",
                "Evening (6pm-12am)",
                "Night (12am-6am)",
                "Weekdays",
                "Weekends",
                "Holidays",
                "Sale Events",
              ],
              "⏰",
            )}

            {renderCompactFilterSection(
              "Device & Platform",
              "device",
              [
                "Desktop",
                "Mobile",
                "Tablet",
                "iOS",
                "Android",
                "Windows",
                "Mac",
              ],
              "📱",
            )}

            {/* Payment & Delivery Row */}
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                {renderCompactFilterSection(
                  "Payment Methods",
                  "payment",
                  [
                    "Credit Card",
                    "PayPal",
                    "Apple Pay",
                    "Google Pay",
                    "Cash on Delivery",
                    "Bank Transfer",
                    "Gift Card",
                    "Store Credit",
                  ],
                  "💳",
                )}
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                {renderCompactFilterSection(
                  "Delivery Preferences",
                  "delivery",
                  [
                    "Standard Shipping",
                    "Express Shipping",
                    "Free Shipping",
                    "Local Pickup",
                    "Same-day Delivery",
                    "International Shipping",
                    "Scheduled Delivery",
                    "Eco-friendly Packaging",
                  ],
                  "🚚",
                )}
              </Grid.Cell>
            </Grid>
          </BlockStack>
        </Layout.Section>

        {/* ==========================================
             Right Column: Preview & Actions
             ========================================== */}

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            {/* Live Preview Card */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  📊 Segment Preview
                </Text>

                <Box
                  background="bg-surface-secondary"
                  padding="400"
                  borderRadius="200"
                >
                  <BlockStack gap="200" align="center">
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {previewCount.toLocaleString()}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Estimated customers
                    </Text>
                  </BlockStack>
                </Box>

                <Text as="p" variant="bodySm" tone="subdued">
                  Preview updates as you add filters
                </Text>
              </BlockStack>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  ⚡ Quick Actions
                </Text>

                <BlockStack gap="200">
                  <Button
                    variant="secondary"
                    fullWidth
                    icon={ExportIcon}
                    disabled={!results}
                  >
                    Export Segment
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth
                    icon={EmailIcon}
                    disabled={!results}
                  >
                    Create Campaign
                  </Button>

                  <Button variant="secondary" fullWidth disabled={!results}>
                    Save to Lists
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Filter Tips Card */}
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  💡 Tips
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  • Start with location or product filters • Combine multiple
                  criteria for precision • Use timing filters for seasonal
                  campaigns • Preview updates in real-time
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Results Section - Outside Layout */}
      {results && (
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingLg">
                🎉 Segment Created
              </Text>
              <Badge tone="success">{`${results.matchCount} customers`}</Badge>
            </InlineStack>

            <Banner tone="success">
              <p>
                Your audience segment has been created successfully! You can now
                export the data or create targeted campaigns.
              </p>
            </Banner>

            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                Applied Filters:
              </Text>
              <InlineStack gap="200" wrap>
                {Object.entries(results.filters).flatMap(([section, values]) =>
                  (values as string[]).map((value, index) => (
                    <Tag key={`${section}-${index}`}>{value}</Tag>
                  )),
                )}
              </InlineStack>
            </BlockStack>

            <InlineStack gap="200">
              <Button icon={ExportIcon}>Export CSV</Button>
              <Button icon={ExportIcon}>Export Excel</Button>
              <Button variant="primary" icon={EmailIcon}>
                Create Campaign
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      )}
    </Form>
  );
}
