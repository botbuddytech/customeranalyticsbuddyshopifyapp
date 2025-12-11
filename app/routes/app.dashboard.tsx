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

import { useState } from "react";
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
import { DashboardControls } from "../components/dashboard/DashboardControls";
import { CustomersOverview } from "../components/dashboard/CustomersOverview/index";
import { PurchaseOrderBehavior } from "../components/dashboard/PurchaseOrderBehavior";
import { EngagementPatterns } from "../components/dashboard/EngagementPatterns";
import { PurchaseTiming } from "../components/dashboard/PurchaseTiming";
import { VisualAnalytics } from "../components/dashboard/VisualAnalytics";

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
 * Main component for the dashboard
 *
 * Each section component fetches its own data independently.
 * No prop passing - clean and modular!
 */
export default function Dashboard() {
  const [activeSegmentModal, setActiveSegmentModal] = useState<string | null>(
    null,
  );
  const [dateRangeValue, setDateRangeValue] = useState("last30Days");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Function to handle the view segment button click
  const handleViewSegment = (segmentName: string) => {
    setActiveSegmentModal(segmentName);
  };

  // Function to handle customize dashboard modal
  const handleCustomizeDashboard = () => {
    setShowCustomizeModal(true);
  };

  // Function to save dashboard customization
  const handleSaveCustomization = () => {
    // Here you would typically save the settings to backend/localStorage
    alert("Dashboard customization saved! Your changes will be applied.");
    setShowCustomizeModal(false);
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
        />

        {/* Customers Overview Section - Fetches its own data */}
        <Layout>
          <CustomersOverview
            dateRange={apiDateRange}
            onViewSegment={handleViewSegment}
          />
        </Layout>

        {/* Purchase & Order Behavior Section - Fetches its own data */}
        <Layout>
          <PurchaseOrderBehavior
            dateRange={apiDateRange}
            onViewSegment={handleViewSegment}
          />
        </Layout>

        {/* Engagement Patterns Section - Fetches its own data */}
        <Layout>
          <EngagementPatterns
            dateRange={apiDateRange}
            onViewSegment={handleViewSegment}
          />
        </Layout>

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
