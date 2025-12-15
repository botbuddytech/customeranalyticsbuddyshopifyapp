/**
 * Welcome Screen for AI Audience Insight Shopify App
 *
 * This page serves as the first-time onboarding experience for merchants.
 * It includes video tutorials, progress tracking, and quick action buttons
 * to help users get started with customer segmentation and campaigns.
 */

import { useState, useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { checkAndUpdateAutomation } from "../services/onboarding/automation";

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
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Check automation and update tasks if criteria are met
    // Run automation FIRST to ensure database is updated before fetching config
    try {
      await checkAndUpdateAutomation(shop, admin);
    } catch (automationError) {
      console.error("Error checking automation (non-fatal):", automationError);
      // Continue even if automation check fails
    }

    // Fetch config AFTER automation check completes to get updated data
    const configData = await db.config.findUnique({
      where: { shop },
    });

    // If no record exists yet, return empty arrays
    if (!configData) {
      return {
        completedSteps: [],
        autoCompletedSteps: [],
      };
    }

    // Handle case where autoCompletedSteps field might not exist in DB yet
    const autoCompletedSteps = (configData as any)?.autoCompletedSteps || [];

    return {
      completedSteps: configData.completedSteps || [],
      autoCompletedSteps: autoCompletedSteps,
    };
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    return {
      completedSteps: [],
      autoCompletedSteps: [],
    };
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

    // Get current config to check auto-completed steps
    const currentConfig = await db.config.findUnique({
      where: { shop },
      select: { autoCompletedSteps: true },
    });

    const autoCompletedSteps = currentConfig?.autoCompletedSteps || [];

    // Convert numbers to strings if needed
    const stepsAsStrings = completedSteps.map((step) => String(step));

    // Prevent removing auto-completed steps
    // If user tries to undo an auto-completed step, keep it in the array
    const finalCompletedSteps = [
      ...new Set([...stepsAsStrings, ...autoCompletedSteps]),
    ];

    // Upsert the record (insert if doesn't exist, update if it does)
    const config = await db.config.upsert({
      where: { shop },
      update: {
        completedSteps: finalCompletedSteps,
        autoCompletedSteps: autoCompletedSteps, // Preserve auto-completed steps
        updatedAt: new Date(),
      },
      create: {
        shop,
        completedSteps: finalCompletedSteps,
        autoCompletedSteps: autoCompletedSteps,
      },
      select: {
        id: true,
        shop: true,
        completedSteps: true,
        autoCompletedSteps: true,
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
    (loaderData?.completedSteps || []).map((step: string) =>
      parseInt(step, 10),
    ),
  );
  const [autoCompletedSteps, setAutoCompletedSteps] = useState<number[]>(
    (loaderData?.autoCompletedSteps || []).map((step: string) =>
      parseInt(step, 10),
    ),
  );
  const [loadingStepId, setLoadingStepId] = useState<number | null>(null);
  const previousCompletedStepsRef = useRef<number[]>(completedSteps);

  // Sync state with loader data when it changes
  useEffect(() => {
    const loadedSteps = (loaderData?.completedSteps || []).map((step: string) =>
      parseInt(step, 10),
    );
    const loadedAutoSteps = (loaderData?.autoCompletedSteps || []).map(
      (step: string) => parseInt(step, 10),
    );
    setCompletedSteps(loadedSteps);
    setAutoCompletedSteps(loadedAutoSteps);
    previousCompletedStepsRef.current = loadedSteps;
  }, [loaderData?.completedSteps, loaderData?.autoCompletedSteps]);

  // Handle fetcher state changes and errors
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // Request completed
      setLoadingStepId(null);

      if (fetcher.data.success && fetcher.data.data) {
        // Success: sync with server response
        const serverSteps = (fetcher.data.data.completedSteps || []).map(
          (step: string) => parseInt(step, 10),
        );
        const serverAutoSteps = (
          fetcher.data.data.autoCompletedSteps || []
        ).map((step: string) => parseInt(step, 10));
        setCompletedSteps(serverSteps);
        setAutoCompletedSteps(serverAutoSteps);
        previousCompletedStepsRef.current = serverSteps;
      } else if (fetcher.data.success === false) {
        // Error: revert to previous state
        console.error(
          "Failed to update onboarding progress:",
          fetcher.data.error,
        );
        setCompletedSteps(previousCompletedStepsRef.current);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Handle clicking "Mark Complete" or "Undo" on onboarding steps
  const toggleStep = (stepId: number) => {
    // Save current state for potential rollback
    previousCompletedStepsRef.current = [...completedSteps];

    // Optimistic UI update
    const newCompletedSteps = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];

    setCompletedSteps(newCompletedSteps);
    setLoadingStepId(stepId);

    // Sync with database using the action function via fetcher
    fetcher.submit(
      { completedSteps: newCompletedSteps },
      { method: "POST", encType: "application/json" },
    );
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
              autoCompletedSteps={autoCompletedSteps}
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
