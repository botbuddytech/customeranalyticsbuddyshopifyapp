/**
 * Welcome Screen for AI Audience Insight Shopify App
 *
 * This page serves as the first-time onboarding experience for merchants.
 * It includes video tutorials, progress tracking, and quick action buttons
 * to help users get started with customer segmentation and campaigns.
 *
 * Uses Supabase with RLS (Row Level Security) for automatic shop filtering.
 */

import { useState, useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { Page, Layout, BlockStack, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getSupabaseForShop } from "../services/supabase-jwt.server";
import { checkAndUpdateAutomation } from "../services/onboarding/automation";
import { sendRawEmail } from "../utils/email/sendEmail.server";
import { buildOwnerFeedbackEmail } from "../utils/email/templates/feedback/ownerFeedbackEmail.server";
import { buildUserFeedbackEmail } from "../utils/email/templates/feedback/userFeedbackEmail.server";

// Import home page components
import { WelcomeHeader } from "../components/home/WelcomeHeader";
import { VideoTutorial } from "../components/home/VideoTutorial";
import { QuickStartChecklist } from "../components/home/QuickStartChecklist";
import { FeedbackRating } from "../components/home/FeedbackRating";
import { ProgressMetrics } from "../components/home/ProgressMetrics";
import { CustomerSupport } from "../components/home/CustomerSupport";
import { QuickActions } from "../components/home/QuickActions";
import { OnboardingApp } from "../components/home/onboarding";

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

    // Fetch config AFTER automation check completes (RLS filters by shop)
    const supabase = getSupabaseForShop(shop);
    const { data: configData, error } = await supabase
      .from("onboardingtaskdata")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching onboarding progress:", error);
    }

    // If no record exists yet, return empty arrays
    if (!configData) {
      return {
        completedSteps: [],
        autoCompletedSteps: [],
      };
    }

    return {
      completedSteps: configData.completedSteps || [],
      autoCompletedSteps: configData.autoCompletedSteps || [],
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
 * Action Function - Update onboarding progress
 *
 * Handles POST requests to update completed steps
 * Uses Supabase with RLS for automatic shop filtering
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const body = await request.json();
    const { intent } = body as { intent?: string };

    if (intent === "feedback") {
      const { category, email, message } = body as {
        category?: string;
        email?: string;
        message?: string;
      };

      if (!category || !email || !message) {
        return { success: false, error: "Missing feedback fields" };
      }

      const ownerEmail = process.env.GMAIL_USER;
      if (!ownerEmail) {
        console.error(
          "GMAIL_USER is not configured; cannot send owner feedback email.",
        );
      }

      // Send thank-you email to the user
      const userEmailContent = buildUserFeedbackEmail({
        category: category as any,
        message,
      });

      await sendRawEmail({
        to: email,
        subject: userEmailContent.subject,
        html: userEmailContent.html,
        text: userEmailContent.text,
        replyTo: ownerEmail,
      });

      // Send notification email to the owner (if configured)
      if (ownerEmail) {
        const ownerEmailContent = buildOwnerFeedbackEmail({
          shop,
          userEmail: email,
          category: category as any,
          message,
        });

        await sendRawEmail({
          to: ownerEmail,
          subject: ownerEmailContent.subject,
          html: ownerEmailContent.html,
          text: ownerEmailContent.text,
          replyTo: email,
        });
      }

      return { success: true };
    }

    const { completedSteps } = body;

    // Validate input
    if (!Array.isArray(completedSteps)) {
      return { success: false, error: "completedSteps must be an array" };
    }

    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    // Get current config to check auto-completed steps (RLS filters by shop)
    const { data: currentConfig } = await supabase
      .from("onboardingtaskdata")
      .select("id, autoCompletedSteps, createdAt")
      .single();

    const autoCompletedSteps: string[] =
      currentConfig?.autoCompletedSteps || [];

    // Convert numbers to strings if needed
    const stepsAsStrings = completedSteps.map((step: unknown) => String(step));

    // Prevent removing auto-completed steps
    // If user tries to undo an auto-completed step, keep it in the array
    const finalCompletedSteps = [
      ...new Set([...stepsAsStrings, ...autoCompletedSteps]),
    ];

    // Upsert the record (RLS ensures we only update our own data)
    const { data: config, error } = await supabase
      .from("onboardingtaskdata")
      .upsert(
        {
          id: currentConfig?.id || crypto.randomUUID(),
          shop,
          completedSteps: finalCompletedSteps,
          autoCompletedSteps: autoCompletedSteps,
          createdAt: currentConfig?.createdAt || now,
          updatedAt: now,
        },
        {
          onConflict: "shop",
        },
      )
      .select("id, shop, completedSteps, autoCompletedSteps, updatedAt")
      .single();

    if (error) {
      console.error("Error updating onboarding progress:", error);
      return {
        success: false,
        error: error.message || "Failed to update data",
      };
    }

    return { success: true, data: config };
  } catch (error) {
    console.error("Error in action handler:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update data";
    return { success: false, error: message };
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
    <Frame>
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

            {/* Onboarding Steps Section */}
            <Layout.Section>
              <OnboardingApp />
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
            <Layout.Section>
              <BlockStack gap="500">
                {/* <ProgressMetrics /> */}
                {/* <CustomerSupport /> */}
              </BlockStack>
            </Layout.Section>

            {/* Quick Action Links Section */}
            {/* <Layout.Section>
              <QuickActions />
            </Layout.Section> */}
          </Layout>
        </BlockStack>
      </Page>
    </Frame>
  );
}
