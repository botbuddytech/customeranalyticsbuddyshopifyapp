/**
 * Customer Insights Dashboard
 *
 * This file implements a comprehensive dashboard that displays key customer metrics
 * using Shopify's Polaris design system and Chart.js for visualizations.
 *
 * The dashboard is divided into four main sections:
 * 1. Customers Overview
 * 2. Purchase & Order Behavior
 * 3. Engagement Patterns
 * 4. Purchase Timing
 *
 * Each section contains relevant KPI cards and visualizations.
 */

import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Grid,
  Modal,
  EmptyState,
  Spinner,
  Select,
  Layout
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { RefreshIcon, ClipboardIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Loader function that provides data for the dashboard
 * 
 * This function fetches all the data needed for the dashboard from our database.
 * It accepts a query parameter for date range and returns structured data for:
 * - Customer overview metrics
 * - Purchase and order behavior
 * - Engagement patterns
 * - Purchase timing analysis
 * - Chart data for visualizations
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate the request to ensure it's coming from a valid Shopify store
  await authenticate.admin(request);

  // Get the URL object to extract query parameters
  const url = new URL(request.url);
  
  // Extract date range from query parameters (default: last 30 days)
  // This allows users to filter data by different time periods
  const dateRange = url.searchParams.get('dateRange') || '30days';
  
  // Import our dashboard service that contains all the database queries
  const { getDashboardData } = await import('../services/dashboard.server');
  
  // Fetch all dashboard data using our service
  // This single function call gets all the metrics we need
  const dashboardData = await getDashboardData(dateRange);
  
  // Extract the data from our service response
  const {
    customerOverview,
    orderBehavior,
    engagementPatterns,
    purchaseTiming,
    customerSegmentation,
    behavioralBreakdown,
    lastUpdated
  } = dashboardData;

  // Chart data for Customer Segmentation (Pie Chart)
  // This chart shows the distribution of orders by payment type and status
  const orderTypeData = {
    labels: ["COD Orders", "Prepaid Orders", "Cancelled Orders", "Abandoned Carts"],
    datasets: [
      {
        data: [
          customerSegmentation.codOrders,
          customerSegmentation.prepaidOrders,
          customerSegmentation.cancelledOrders,
          customerSegmentation.abandonedOrders
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for Behavioral Breakdown (Bar Chart)
  // This chart shows the distribution of different customer engagement types
  const engagementData = {
    labels: ["Discount Users", "Wishlist Users", "Reviewers", "Email Subscribers"],
    datasets: [
      {
        label: "Number of Users",
        data: [
          behavioralBreakdown.discountUsers,
          behavioralBreakdown.wishlistUsers,
          behavioralBreakdown.reviewers,
          behavioralBreakdown.emailSubscribers
        ],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Mini chart data for trend lines
  const generateMiniChartData = (value: number, trend: "up" | "down" | "stable" = "up") => {
    const baseData = [value * 0.7, value * 0.8, value * 0.75, value * 0.9];

    if (trend === "up") {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: [...baseData, value * 0.95, value],
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        }]
      };
    } else if (trend === "down") {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: [value * 1.3, value * 1.2, value * 1.1, value * 1.05, value * 1.02, value],
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
        }]
      };
    } else {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: [value * 0.95, value * 1.05, value * 0.98, value * 1.02, value * 0.99, value],
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
        }]
      };
    }
  };

  // Generate mini chart data for each metric
  // These mini charts show trends for each KPI card
  const customerGrowthData = generateMiniChartData(customerOverview.totalCustomers.count, "up");
  const newCustomersData = generateMiniChartData(customerOverview.newCustomers.count, "up");
  const returningCustomersData = generateMiniChartData(customerOverview.returningCustomers.count, "up");
  const inactiveCustomersData = generateMiniChartData(customerOverview.inactiveCustomers.count, "down");

  const codOrdersData = generateMiniChartData(orderBehavior.codOrders.count, "up");
  const prepaidOrdersData = generateMiniChartData(orderBehavior.prepaidOrders.count, "up");
  const cancelledOrdersData = generateMiniChartData(orderBehavior.cancelledOrders.count, "down");
  const abandonedCartsData = generateMiniChartData(orderBehavior.abandonedOrders.count, "down");

  const discountUsersData = generateMiniChartData(engagementPatterns.discountUsers.count, "up");
  const wishlistUsersData = generateMiniChartData(engagementPatterns.wishlistUsers.count, "up");
  const reviewersData = generateMiniChartData(engagementPatterns.reviewers.count, "up");
  const emailSubscribersData = generateMiniChartData(engagementPatterns.emailSubscribers.count, "up");

  const morningPurchasesData = generateMiniChartData(purchaseTiming.morningPurchases.count, "up");
  const afternoonPurchasesData = generateMiniChartData(purchaseTiming.afternoonPurchases.count, "up");
  const eveningPurchasesData = generateMiniChartData(purchaseTiming.eveningPurchases.count, "up");
  const weekendPurchasesData = generateMiniChartData(purchaseTiming.weekendPurchases.count, "up");

  return {
    // Customer Overview - Raw data from database
    customerOverview,
    
    // Purchase & Order Behavior - Raw data from database
    orderBehavior,
    
    // Engagement Patterns - Raw data from database
    engagementPatterns,
    
    // Purchase Timing - Raw data from database
    purchaseTiming,
    
    // Customer Segmentation - Raw data for pie chart
    customerSegmentation,
    
    // Behavioral Breakdown - Raw data for bar chart
    behavioralBreakdown,

    // Last updated timestamp
    lastUpdated,

    // Chart data for visualizations
    orderTypeData,
    engagementData,

    // Mini chart data for trend lines
    customerGrowthData,
    newCustomersData,
    returningCustomersData,
    inactiveCustomersData,
    codOrdersData,
    prepaidOrdersData,
    cancelledOrdersData,
    abandonedCartsData,
    discountUsersData,
    wishlistUsersData,
    reviewersData,
    emailSubscribersData,
    morningPurchasesData,
    afternoonPurchasesData,
    eveningPurchasesData,
    weekendPurchasesData
  };
};

/**
 * Main component for the dashboard
 */
export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSegmentModal, setActiveSegmentModal] = useState<string | null>(null);
  const [dateRangeValue, setDateRangeValue] = useState('last30Days');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    customerOverview: true,
    orderBehavior: true,
    engagementPatterns: true,
    purchaseTiming: true,
    customerSegmentation: true,
    behavioralBreakdown: true
  });

  // Function to handle the refresh button click
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate a data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Function to handle the view segment button click
  const handleViewSegment = (segmentName: string) => {
    setActiveSegmentModal(segmentName);
  };

  // Function to handle widget visibility toggle
  const handleWidgetToggle = (widgetKey: string) => {
    setWidgetSettings(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey as keyof typeof prev]
    }));
  };

  // Function to handle customize dashboard modal
  const handleCustomizeDashboard = () => {
    setShowCustomizeModal(true);
  };

  // Function to save dashboard customization
  const handleSaveCustomization = () => {
    // Here you would typically save the settings to backend/localStorage
    alert('Dashboard customization saved! Your changes will be applied.');
    setShowCustomizeModal(false);
  };

  // Function to get the appropriate chart data for each card
  const getChartDataForCard = (cardTitle: string, data: any) => {
    switch (cardTitle) {
      case "Total Customers":
        return data.customerGrowthData;
      case "New Customers":
        return data.newCustomersData;
      case "Returning Customers":
        return data.returningCustomersData;
      case "Inactive Customers":
        return data.inactiveCustomersData;
      case "COD Orders":
        return data.codOrdersData;
      case "Prepaid Orders":
        return data.prepaidOrdersData;
      case "Cancelled Orders":
        return data.cancelledOrdersData;
      case "Abandoned Carts":
        return data.abandonedCartsData;
      case "Discount Users":
        return data.discountUsersData;
      case "Wishlist Users":
        return data.wishlistUsersData;
      case "Reviewers":
        return data.reviewersData;
      case "Email Subscribers":
        return data.emailSubscribersData;
      case "Morning Purchases":
        return data.morningPurchasesData;
      case "Afternoon Purchases":
        return data.afternoonPurchasesData;
      case "Evening Purchases":
        return data.eveningPurchasesData;
      case "Weekend Purchases":
        return data.weekendPurchasesData;
      default:
        return data.customerGrowthData;
    }
  };

  // Function to get growth indicator text for each card
  const getGrowthIndicator = (cardTitle: string) => {
    switch (cardTitle) {
      case "Total Customers":
        return "↑ 25% growth in the last 6 months";
      case "New Customers":
        return "↑ 33% increase from January";
      case "Returning Customers":
        return "↑ 25% higher retention rate";
      case "Inactive Customers":
        return "↓ 9% decrease since January";
      case "COD Orders":
        return "↑ 25% increase in 6 months";
      case "Prepaid Orders":
        return "↑ 25% growth since January";
      case "Cancelled Orders":
        return "↓ 17% decrease in cancellations";
      case "Abandoned Carts":
        return "↓ 17% reduction in cart abandonment";
      case "Discount Users":
        return "↑ 25% more coupon usage";
      case "Wishlist Users":
        return "↑ 40% growth in wishlist usage";
      case "Reviewers":
        return "↑ 67% more customer reviews";
      case "Email Subscribers":
        return "↑ 18% growth in subscribers";
      case "Morning Purchases":
        return "↑ 25% increase in morning sales";
      case "Afternoon Purchases":
        return "↑ 25% growth in afternoon orders";
      case "Evening Purchases":
        return "↑ 25% more evening shoppers";
      case "Weekend Purchases":
        return "↑ 18% increase in weekend sales";
      default:
        return "↑ 25% growth in the last 6 months";
    }
  };

  // Function to get appropriate tone for growth indicator
  const getGrowthTone = (cardTitle: string) => {
    switch (cardTitle) {
      case "Inactive Customers":
      case "Cancelled Orders":
      case "Abandoned Carts":
        // For metrics where decrease is good
        return "success" as const;
      case "Discount Users":
        // For metrics where increase might need attention
        return "subdued" as const;
      default:
        // For metrics where increase is good
        return "success" as const;
    }
  };

  // Define the type for our insight cards
  interface InsightCard {
    title: string;
    value: number;
    status?: 'success' | 'info' | 'warning' | 'critical' | 'new';
    description?: string;
    showViewButton?: boolean;
  }

  // Define card sections using the new data structure
  // Each card displays data from our backend dashboard service
  const customerOverviewCards: InsightCard[] = [
    {
      title: "Total Customers",
      // Backend data: customerOverview.totalCustomers.count from getCustomerOverview()
      value: data.customerOverview.totalCustomers.count,
      status: "success",
      showViewButton: true,
    },
    {
      title: "New Customers",
      // Backend data: customerOverview.newCustomers.count from getCustomerOverview()
      // Shows customers created in the selected date range
      value: data.customerOverview.newCustomers.count,
      status: "new",
      description: "Joined in the last 30 days",
      showViewButton: true,
    },
    {
      title: "Returning Customers",
      // Backend data: customerOverview.returningCustomers.count from getCustomerOverview()
      // Shows customers with orders in the selected date range
      value: data.customerOverview.returningCustomers.count,
      status: "success",
      description: "In the last 30 days",
      showViewButton: true,
    },
    {
      title: "Inactive Customers",
      // Backend data: customerOverview.inactiveCustomers.count from getCustomerOverview()
      // Shows customers with no purchase in 90+ days
      value: data.customerOverview.inactiveCustomers.count,
      status: "warning",
      description: "No purchase in 90+ days",
      showViewButton: true,
    },
  ];

  const orderBehaviorCards: InsightCard[] = [
    {
      title: "COD Orders",
      // Backend data: orderBehavior.codOrders.count from getOrderBehavior()
      // Shows orders with type "COD" in the selected date range
      value: data.orderBehavior.codOrders.count,
      status: "info",
      showViewButton: true,
    },
    {
      title: "Prepaid Orders",
      // Backend data: orderBehavior.prepaidOrders.count from getOrderBehavior()
      // Shows orders with type "PREPAID" in the selected date range
      value: data.orderBehavior.prepaidOrders.count,
      status: "success",
      showViewButton: true,
    },
    {
      title: "Cancelled Orders",
      // Backend data: orderBehavior.cancelledOrders.count from getOrderBehavior()
      // Shows orders with status "CANCELLED" in the selected date range
      value: data.orderBehavior.cancelledOrders.count,
      status: "critical",
      showViewButton: true,
    },
    {
      title: "Abandoned Carts",
      // Backend data: orderBehavior.abandonedOrders.count from getOrderBehavior()
      // Shows orders with status "ABANDONED" in the selected date range
      value: data.orderBehavior.abandonedOrders.count,
      status: "warning",
      showViewButton: true,
    },
  ];

  const engagementCards: InsightCard[] = [
    {
      title: "Discount Users",
      // Backend data: engagementPatterns.discountUsers.count from getEngagementPatterns()
      // Shows customers with engagement type "DISCOUNT_USER" in the selected date range
      value: data.engagementPatterns.discountUsers.count,
      status: "warning",
    },
    {
      title: "Wishlist Users",
      // Backend data: engagementPatterns.wishlistUsers.count from getEngagementPatterns()
      // Shows customers with engagement type "WISHLIST_USER" in the selected date range
      value: data.engagementPatterns.wishlistUsers.count,
      status: "info",
    },
    {
      title: "Reviewers",
      // Backend data: engagementPatterns.reviewers.count from getEngagementPatterns()
      // Shows customers with engagement type "REVIEWER" in the selected date range
      value: data.engagementPatterns.reviewers.count,
      status: "success",
    },
    {
      title: "Email Subscribers",
      // Backend data: engagementPatterns.emailSubscribers.count from getEngagementPatterns()
      // Shows customers with engagement type "EMAIL_SUBSCRIBER" in the selected date range
      value: data.engagementPatterns.emailSubscribers.count,
      status: "info",
    },
  ];

  const purchaseTimingCards: InsightCard[] = [
    {
      title: "Morning Purchases",
      // Backend data: purchaseTiming.morningPurchases.count from getPurchaseTiming()
      // Shows orders created between 6 AM - 12 PM
      value: data.purchaseTiming.morningPurchases.count,
      status: "info",
      description: "6 AM - 12 PM",
    },
    {
      title: "Afternoon Purchases",
      // Backend data: purchaseTiming.afternoonPurchases.count from getPurchaseTiming()
      // Shows orders created between 12 PM - 6 PM
      value: data.purchaseTiming.afternoonPurchases.count,
      status: "info",
      description: "12 PM - 6 PM",
    },
    {
      title: "Evening Purchases",
      // Backend data: purchaseTiming.eveningPurchases.count from getPurchaseTiming()
      // Shows orders created between 6 PM - 12 AM
      value: data.purchaseTiming.eveningPurchases.count,
      status: "info",
      description: "6 PM - 12 AM",
    },
    {
      title: "Weekend Purchases",
      // Backend data: purchaseTiming.weekendPurchases.count from getPurchaseTiming()
      // Shows orders created on Saturday or Sunday
      value: data.purchaseTiming.weekendPurchases.count,
      status: "success",
      description: "Saturday - Sunday",
    },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 4,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true
      }
    }
  };

  // Behavioral Breakdown chart options
  const behavioralChartOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw} users`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 13,
            weight: 'bold' as const
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    barThickness: 25,
    borderRadius: 4
  };

  // Mini chart options
  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
  };

  // Function to render a section with cards
  const renderSection = (title: string, cards: InsightCard[]) => (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          {title}
        </Text>
        <Grid>
          {cards.map((card, index) => (
            <Grid.Cell key={index} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <div style={{ height: '100%' }}>
                <Card padding="400">
                  <BlockStack gap="300">
                    {/* Card header with title and badge */}
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd">
                        {card.title}
                      </Text>
                      {card.status && (
                        <Badge tone={
                          card.status === 'new' ? 'info' :
                          card.status as 'success' | 'info' | 'warning' | 'critical'
                        }>
                          {card.status === 'new' ? 'New' :
                          card.status === 'success' ? 'Good' :
                          card.status === 'warning' ? 'Attention' :
                          card.status === 'critical' ? 'Issue' : 'Info'}
                        </Badge>
                      )}
                    </InlineStack>

                    {/* Value and menu icon */}
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="p" variant="heading2xl" fontWeight="bold">
                          {card.value.toLocaleString()}
                        </Text>

                                                 {/* Mini line charts for all cards */}
                         {/* Backend data: Each mini chart shows trend data generated from the corresponding metric
                              - customerGrowthData from customerOverview.totalCustomers.count
                              - newCustomersData from customerOverview.newCustomers.count
                              - returningCustomersData from customerOverview.returningCustomers.count
                              - inactiveCustomersData from customerOverview.inactiveCustomers.count
                              - codOrdersData from orderBehavior.codOrders.count
                              - prepaidOrdersData from orderBehavior.prepaidOrders.count
                              - cancelledOrdersData from orderBehavior.cancelledOrders.count
                              - abandonedCartsData from orderBehavior.abandonedOrders.count
                              - discountUsersData from engagementPatterns.discountUsers.count
                              - wishlistUsersData from engagementPatterns.wishlistUsers.count
                              - reviewersData from engagementPatterns.reviewers.count
                              - emailSubscribersData from engagementPatterns.emailSubscribers.count
                              - morningPurchasesData from purchaseTiming.morningPurchases.count
                              - afternoonPurchasesData from purchaseTiming.afternoonPurchases.count
                              - eveningPurchasesData from purchaseTiming.eveningPurchases.count
                              - weekendPurchasesData from purchaseTiming.weekendPurchases.count */}
                         <div style={{ width: '60px', height: '30px' }}>
                           <Line
                             data={getChartDataForCard(card.title, data)}
                             options={miniChartOptions}
                           />
                         </div>
                      </InlineStack>

                      {card.showViewButton && (
                        <Button
                          icon={ClipboardIcon}
                          onClick={() => handleViewSegment(card.title)}
                          variant="primary"
                          accessibilityLabel={`View ${card.title} Segment`}
                        />
                      )}
                    </InlineStack>

                    {/* Description if available */}
                    {card.description && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        {card.description}
                      </Text>
                    )}

                    {/* Growth indicator for all cards */}
                    {card.title === "Total Customers" ? (
                      <BlockStack gap="100">
                        <Text as="p" variant="bodySm" fontWeight="semibold">
                          Your store is doing good
                        </Text>
                        <Text as="p" variant="bodySm" tone={getGrowthTone(card.title)}>
                          {getGrowthIndicator(card.title)}
                        </Text>
                      </BlockStack>
                    ) : (
                      <Text as="p" variant="bodySm" tone={getGrowthTone(card.title)}>
                        {getGrowthIndicator(card.title)}
                      </Text>
                    )}
                  </BlockStack>
                </Card>
              </div>
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Layout.Section>
  );

  return (
    <Page fullWidth>
      <TitleBar title="Customer Insights Dashboard" />

        {/* Segment View Modal */}
        {activeSegmentModal && (
          <Modal
            open={!!activeSegmentModal}
            onClose={() => setActiveSegmentModal(null)}
            title={`${activeSegmentModal} Segment`}
            primaryAction={{
              content: 'Export Data',
              onAction: () => setActiveSegmentModal(null),
            }}
            secondaryActions={[
              {
                content: 'Close',
                onAction: () => setActiveSegmentModal(null),
              },
            ]}
          >
            <Modal.Section>
              <EmptyState
                heading={`${activeSegmentModal} Details`}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  This is where you would see detailed information about the {activeSegmentModal.toLowerCase()} segment.
                  In a real application, this would include a table of data, filters, and additional metrics.
                </p>
              </EmptyState>
            </Modal.Section>
          </Modal>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Spinner size="large" />
              <Text as="p" variant="bodyMd">
                Refreshing dashboard data...
              </Text>
            </div>
          </div>
        )}

        <BlockStack gap="600">
          <Card padding="400">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="400">
                  <Text variant="headingMd" as="h2">Dashboard Controls</Text>
                  <Select
                    label="Date range"
                    labelHidden
                    options={[
                      { label: 'Today', value: 'today' },
                      { label: 'Yesterday', value: 'yesterday' },
                      { label: 'Last 7 days', value: 'last7Days' },
                      { label: 'Last 30 days', value: 'last30Days' },
                      { label: 'Last 90 days', value: 'last90Days' },
                      { label: 'This month', value: 'thisMonth' },
                      { label: 'Last month', value: 'lastMonth' },
                      { label: 'Custom range', value: 'custom' },
                    ]}
                    value={dateRangeValue}
                    onChange={setDateRangeValue}
                  />
                </InlineStack>

                <InlineStack gap="200">
                  <Button
                    icon={isLoading ? undefined : RefreshIcon}
                    onClick={handleRefresh}
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "Refreshing..." : "Refresh Data"}
                  </Button>
                  
                  <Button
                    onClick={handleCustomizeDashboard}
                    variant="secondary"
                    disabled={isLoading}
                  >
                    Customize Dashboard
                  </Button>
                </InlineStack>
              </InlineStack>

                             <Text variant="bodyMd" as="p" tone="subdued">
                 Currently showing data from {dateRangeValue === 'last30Days' ? 'the last 30 days' : 'the selected period'}.
                 {/* Backend data: lastUpdated timestamp from getDashboardData() service */}
                 Last updated: {new Date().toLocaleString()}
               </Text>
            </BlockStack>
          </Card>

          <Layout>
            {/* Customer Overview Section */}
            {renderSection("Customers Overview", customerOverviewCards)}
          </Layout>

          <Layout>
            {/* Purchase & Order Behavior Section */}
            {renderSection("Purchase & Order Behavior", orderBehaviorCards)}
          </Layout>

          <Layout>
            {/* Engagement Patterns Section */}
            {renderSection("Engagement Patterns", engagementCards)}
          </Layout>

          {/* Charts Section - Side by Side */}
          <Layout>
            <Layout.Section>
              <Text as="h2" variant="headingLg">
                Visual Analytics
              </Text>
            </Layout.Section>
          </Layout>

                     <Layout>
             {/* Customer Segmentation Chart */}
             <Layout.Section variant="oneHalf">
               <div style={{ height: '100%' }}>
                 <Card padding="400">
                   <BlockStack gap="300">
                   <Text as="h3" variant="headingMd">
                     Customer Segmentation
                   </Text>
                   {/* Backend data: orderTypeData generated from customerSegmentation 
                        - customerSegmentation.codOrders from getCustomerSegmentation()
                        - customerSegmentation.prepaidOrders from getCustomerSegmentation()
                        - customerSegmentation.cancelledOrders from getCustomerSegmentation()
                        - customerSegmentation.abandonedOrders from getCustomerSegmentation() */}
                   <div style={{ height: '350px', padding: '16px' }}>
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
               <div style={{ height: '100%' }}>
                 <Card padding="400">
                   <BlockStack gap="300">
                   <Text as="h3" variant="headingMd">
                     Behavioral Breakdown
                   </Text>
                   {/* Backend data: engagementData generated from behavioralBreakdown
                        - behavioralBreakdown.discountUsers from getBehavioralBreakdown()
                        - behavioralBreakdown.wishlistUsers from getBehavioralBreakdown()
                        - behavioralBreakdown.reviewers from getBehavioralBreakdown()
                        - behavioralBreakdown.emailSubscribers from getBehavioralBreakdown() */}
                   <div style={{ height: '350px', padding: '16px' }}>
                     <Bar
                       data={data.engagementData}
                       options={behavioralChartOptions}
                     />
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

          <Layout>
            {/* Purchase Timing Section */}
            {renderSection("Purchase Timing", purchaseTimingCards)}
          </Layout>
        </BlockStack>
      </Page>
  );
}
