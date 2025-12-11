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
import {
  DashboardControls,
  type DashboardVisibility,
} from "../components/dashboard/DashboardControls";
import { CustomersOverview } from "../components/dashboard/CustomersOverview/index";
import { PurchaseOrderBehavior } from "../components/dashboard/PurchaseOrderBehavior/index";
import { EngagementPatterns } from "../components/dashboard/EngagementPatterns/index";
import { PurchaseTiming } from "../components/dashboard/PurchaseTiming/index";
import { VisualAnalytics } from "../components/dashboard/VisualAnalytics/index";
import { getDashboardPreferences } from "../services/dashboard-preferences.server";
import { authenticate } from "../shopify.server";

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
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const preferences = await getDashboardPreferences(shop);
    return { preferences };
  } catch (error) {
    console.error(
      `[Dashboard] Error loading preferences for shop ${shop}:`,
      error,
    );
    // Return default preferences on error
    return { preferences: null };
  }
};

/**
 * Main component for the dashboard
 *
 * Each section component fetches its own data independently.
 * No prop passing - clean and modular!
 */
export default function Dashboard() {
  const { preferences: savedPreferences } = useLoaderData<typeof loader>();
  const [activeSegmentModal, setActiveSegmentModal] = useState<string | null>(
    null,
  );
  const [dateRangeValue, setDateRangeValue] = useState("last30Days");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [visibility, setVisibility] = useState<DashboardVisibility | null>(
    savedPreferences || null,
  );

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
    <Page fullWidth>
      <TitleBar title="Customer Insights Dashboard" />

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

      <BlockStack gap="600">
        {/* Dashboard Controls */}
        <DashboardControls
          dateRangeValue={dateRangeValue}
          onDateRangeChange={setDateRangeValue}
          onCustomize={handleCustomizeDashboard}
          onVisibilityChange={handleVisibilityChange}
          initialVisibility={savedPreferences}
        />

        {/* Customers Overview Section - Fetches its own data */}
        {visibility?.customersOverview.enabled !== false && (
          <Layout>
            <CustomersOverview
              dateRange={apiDateRange}
              onViewSegment={handleViewSegment}
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
          />
        </Layout>
      </BlockStack>
    </Page>
  );
}
