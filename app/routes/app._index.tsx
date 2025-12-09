/**
 * Welcome Screen for AI Audience Insight Shopify App
 *
 * This page serves as the first-time onboarding experience for merchants.
 * It includes video tutorials, progress tracking, and quick action buttons
 * to help users get started with customer segmentation and campaigns.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Import home page components
import { WelcomeHeader } from "../components/home/WelcomeHeader";
import { VideoTutorial } from "../components/home/VideoTutorial";
import { QuickStartChecklist } from "../components/home/QuickStartChecklist";
import { FeedbackRating } from "../components/home/FeedbackRating";
import { ProgressMetrics } from "../components/home/ProgressMetrics";
import { CustomerSupport } from "../components/home/CustomerSupport";
import { QuickActions } from "../components/home/QuickActions";

/**
 * Loader Function - Fetch onboarding progress from Prisma
 *
 * This function runs on the server before the page loads.
 * It authenticates the user and fetches their onboarding progress.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Fetch onboarding progress from database using Prisma
    const config = await db.config.findUnique({
      where: { shop },
      select: { completedSteps: true },
    });

    // If no record exists yet, return empty array
    if (!config) {
      return { completedSteps: [] };
    }

    return { completedSteps: config.completedSteps };
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    return { completedSteps: [] };
  }
};

/**
 * Action Function - Update onboarding progress in Prisma
 *
 * Handles POST requests to update completed steps
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const body = await request.json();
    const { completedSteps } = body;

    // Validate input
    if (!Array.isArray(completedSteps)) {
      return { success: false, error: "completedSteps must be an array" };
    }

    // Convert numbers to strings if needed
    const stepsAsStrings = completedSteps.map(step => String(step));

    // Upsert the record (insert if doesn't exist, update if it does)
    const config = await db.config.upsert({
      where: { shop },
      update: {
        completedSteps: stepsAsStrings,
        updatedAt: new Date(),
      },
      create: {
        shop,
        completedSteps: stepsAsStrings,
      },
      select: {
        id: true,
        shop: true,
        completedSteps: true,
        updatedAt: true,
      },
    });

    return { success: true, data: config };
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    return { success: false, error: "Failed to update data" };
  }
};

/**
 * Main Welcome Screen Component
 *
 * This is the default export that renders the welcome page.
 * It manages onboarding progress and displays interactive tutorials.
 */
export default function Index() {
  // Track which onboarding steps the user has completed
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    (loaderData?.completedSteps || []).map((step: string) => parseInt(step, 10))
  );
  const [loadingStepId, setLoadingStepId] = useState<number | null>(null);

  // Handle clicking "Mark Complete" or "Undo" on onboarding steps
  // Handle clicking "Mark Complete" or "Undo" on onboarding steps
  const toggleStep = (stepId: number) => {
    // Optimistic UI update
    const newCompletedSteps = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompletedSteps);
    setLoadingStepId(stepId);

    // Sync with database using the action function via fetcher
    fetcher.submit(
      { completedSteps: newCompletedSteps },
      { method: "POST", encType: "application/json" }
    );
     
    // Reset loading state after a short delay (or rely on fetcher.state)
    setTimeout(() => setLoadingStepId(null), 500);
  };

  return (
    <Page>
      <TitleBar title="AI Audience Insight" />

      <BlockStack gap="500">
        <Layout>
          {/* Welcome Header Section */}
          <Layout.Section>
            <WelcomeHeader />
          </Layout.Section>

          {/* Video Tutorial Section */}
          <Layout.Section>
            <VideoTutorial />
          </Layout.Section>

          {/* Quick Start Checklist Section */}
          <Layout.Section>
            <QuickStartChecklist 
              completedSteps={completedSteps}
              onToggleStep={toggleStep}
              loadingStepId={loadingStepId}
            />
          </Layout.Section>

          {/* Feedback & Rating Section */}
          <Layout.Section>
            <FeedbackRating />
          </Layout.Section>

          {/* Progress Metrics Sidebar */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <ProgressMetrics />
              <CustomerSupport />
            </BlockStack>
          </Layout.Section>

          {/* Quick Action Links Section */}
          <Layout.Section>
            <QuickActions />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
