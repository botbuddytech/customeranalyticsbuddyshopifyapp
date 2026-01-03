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
 *
 * NOTE: Each component fetches its own data independently via API routes.
 */

import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  BlockStack,
  Modal,
  EmptyState,
  Text,
  Layout,
  Box,
  Frame,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
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

// Import modular dashboard components
import { DashboardControls } from "../components/dashboard/DashboardControls";
import {
  type DashboardVisibility,
  DEFAULT_VISIBILITY,
} from "../components/dashboard/dashboardConfig";
import { CustomersOverview } from "../components/dashboard/CustomersOverview/index";
import { PurchaseOrderBehavior } from "../components/dashboard/PurchaseOrderBehavior/index";
import { EngagementPatterns } from "../components/dashboard/EngagementPatterns/index";
import { PurchaseTiming } from "../components/dashboard/PurchaseTiming/index";
import { VisualAnalytics } from "../components/dashboard/VisualAnalytics/index";
import { getDashboardPreferences } from "../services/dashboard-preferences.server";
import { authenticate } from "../shopify.server";
import { getCurrentPlanName } from "../services/subscription.server";
import { UpgradeBanner } from "../components/UpgradeBanner";

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
  Legend,
);

/**
 * Loader function - Load dashboard preferences from Supabase
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const preferences = await getDashboardPreferences(shop);
    const currentPlan = await getCurrentPlanName(admin);
    // Check if dev mode is enabled (allows all features regardless of plan)
    // Priority: 1. ENABLE_ALL_FEATURES=true → enable, 2. ENABLE_ALL_FEATURES=false → disable, 3. NODE_ENV=development → enable
    const enableAllFeatures = process.env.ENABLE_ALL_FEATURES;
    let isDevMode = false;
    if (enableAllFeatures === "true") {
      isDevMode = true;
    } else if (enableAllFeatures === "false") {
      isDevMode = false;
    } else if (process.env.NODE_ENV === "development") {
      isDevMode = true;
    }
    return { preferences, currentPlan, isDevMode };
  } catch (error) {
    console.error(
      `[Dashboard] Error loading preferences for shop ${shop}:`,
      error,
    );
    // Return default preferences on error
    const enableAllFeatures = process.env.ENABLE_ALL_FEATURES;
    let isDevMode = false;
    if (enableAllFeatures === "true") {
      isDevMode = true;
    } else if (enableAllFeatures === "false") {
      isDevMode = false;
    } else if (process.env.NODE_ENV === "development") {
      isDevMode = true;
    }
    return { preferences: null, currentPlan: null, isDevMode };
  }
};

/**
 * Main component for the dashboard
 *
 * Each section component fetches its own data independently.
 * No prop passing - clean and modular!
 */
export default function Dashboard() {
  const { preferences: savedPreferences, currentPlan, isDevMode } = useLoaderData<typeof loader>();
  const [activeSegmentModal, setActiveSegmentModal] = useState<string | null>(
    null,
  );
  const [dateRangeValue, setDateRangeValue] = useState("last7Days");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [visibility, setVisibility] = useState<DashboardVisibility | null>(
    savedPreferences || DEFAULT_VISIBILITY,
  );
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setToastActive(true);
  };

  // Load saved preferences on mount
  useEffect(() => {
    if (savedPreferences) {
      setVisibility(savedPreferences);
    }
  }, [savedPreferences]);

  // Function to handle the view segment button click
  const handleViewSegment = (segmentName: string) => {
    setActiveSegmentModal(segmentName);
  };

  // Function to handle customize dashboard modal
  const handleCustomizeDashboard = () => {
    setShowCustomizeModal(true);
  };

  // Function to handle visibility changes
  const handleVisibilityChange = (newVisibility: DashboardVisibility) => {
    setVisibility(newVisibility);
  };

  // Convert dateRangeValue to API format
  const apiDateRange =
    dateRangeValue === "last30Days"
      ? "30days"
      : dateRangeValue === "last7Days"
        ? "7days"
        : dateRangeValue === "last90Days"
          ? "90days"
          : dateRangeValue === "today"
            ? "today"
            : dateRangeValue === "yesterday"
              ? "yesterday"
              : dateRangeValue === "thisMonth"
                ? "thisMonth"
                : dateRangeValue === "lastMonth"
                  ? "lastMonth"
                  : "30days";

  return (
    <Frame>
      <UpgradeBanner currentPlan={currentPlan} isDevMode={isDevMode} />
      <Page>
        <TitleBar title="Customer Insights Dashboard" />

        {toastActive && (
          <Toast
            content={toastMessage}
            onDismiss={() => setToastActive(false)}
          />
        )}

        {/* Segment View Modal */}
        {activeSegmentModal && (
          <Modal
            open={!!activeSegmentModal}
            onClose={() => setActiveSegmentModal(null)}
            title={`${activeSegmentModal} Segment`}
            primaryAction={{
              content: "Export Data",
              onAction: () => setActiveSegmentModal(null),
            }}
            secondaryActions={[
              {
                content: "Close",
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
                  This is where you would see detailed information about the{" "}
                  {activeSegmentModal.toLowerCase()} segment. In a real
                  application, this would include a table of data, filters, and
                  additional metrics.
                </p>
              </EmptyState>
            </Modal.Section>
          </Modal>
        )}

        <Box paddingInlineStart="400" paddingInlineEnd="400">
          <BlockStack gap="600">
            {/* Dashboard Controls */}
            <DashboardControls
              dateRangeValue={dateRangeValue}
              onDateRangeChange={setDateRangeValue}
              onCustomize={handleCustomizeDashboard}
              onVisibilityChange={handleVisibilityChange}
              initialVisibility={savedPreferences}
              currentVisibility={visibility}
              currentPlan={currentPlan}
              isDevMode={isDevMode}
            />

            {/* Customers Overview Section - Fetches its own data */}
            {visibility?.customersOverview.enabled !== false && (
              <Layout>
                <CustomersOverview
                  dateRange={apiDateRange}
                  onViewSegment={handleViewSegment}
                  onShowToast={handleShowToast}
                  visibility={visibility?.customersOverview.cards}
                />
              </Layout>
            )}

            {/* Purchase & Order Behavior Section - Fetches its own data */}
            {visibility?.purchaseOrderBehavior.enabled !== false && (
              <Layout>
                <PurchaseOrderBehavior
                  dateRange={apiDateRange}
                  onViewSegment={handleViewSegment}
                  onShowToast={handleShowToast}
                  visibility={visibility?.purchaseOrderBehavior.cards}
                />
              </Layout>
            )}

            {/* Engagement Patterns Section - Fetches its own data */}
            {visibility?.engagementPatterns.enabled !== false && (
              <Layout>
                <EngagementPatterns
                  dateRange={apiDateRange}
                  onViewSegment={handleViewSegment}
                  onShowToast={handleShowToast}
                  visibility={visibility?.engagementPatterns.cards}
                />
              </Layout>
            )}

            {/* Visual Analytics Section - Fetches its own data */}
            <VisualAnalytics dateRange={apiDateRange} />

            {/* Purchase Timing Section - Fetches its own data */}
            <Layout>
              <PurchaseTiming
                dateRange={apiDateRange}
                onViewSegment={handleViewSegment}
                onShowToast={handleShowToast}
              />
            </Layout>
          </BlockStack>
        </Box>
      </Page>
    </Frame>
  );
}
