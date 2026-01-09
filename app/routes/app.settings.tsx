/**
 * Settings Page for AI Audience Insight Shopify App
 *
 * This page provides a comprehensive settings interface for merchants to configure:
 * - WhatsApp and Email communication settings
 * - Plan selection and billing preferences
 * - Automated reporting schedules
 * - AI campaign suggestion preferences
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  useLoaderData,
  useActionData,
  useSubmit,
  useNavigation,
} from "react-router";
import { Page, Frame, Toast, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { Settings } from "../components/settings";
import type {
  LoaderData,
  ActionData,
  UserPreferences,
} from "../components/settings/types";
import { useState, useEffect, useCallback } from "react";
import {
  getUserPreferences,
  saveUserPreferences,
} from "../services/user-preferences.server";
import { getShopInfo } from "../services/shop-info.server";
import { getCurrentPlanName } from "../services/subscription.server";
import { getMailchimpConfig } from "../services/mailchimp.server";
import { UpgradeBanner } from "../components/UpgradeBanner";

// ==========================================
// Server-side Functions
// ==========================================

/**
 * Loader Function - Fetch Current Settings
 *
 * Retrieves the merchant's current settings from the database.
 * In a real app, this would query your settings table.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const defaultLanguage =
    (session as any).locale?.toString().split(/[-_]/)[0] || "en";

  const userPreferences = await getUserPreferences(shop, defaultLanguage);

  // Fetch shop information (name and contact email)
  const shopInfo = await getShopInfo(admin, shop);

  // Fetch Mailchimp connection status
  const mailchimpConnection = await getMailchimpConfig(shop);

  // Fetch the merchant's current app subscription from Shopify
  const currentPlanName = await getCurrentPlanName(admin);
  const selectedPlan = currentPlanName || "Managed via Shopify billing";

  // Check if dev mode is enabled
  const enableAllFeatures = process.env.ENABLE_ALL_FEATURES;
  let isDevMode = false;
  if (enableAllFeatures === "true") {
    isDevMode = true;
  } else if (enableAllFeatures === "false") {
    isDevMode = false;
  } else if (process.env.NODE_ENV === "development") {
    isDevMode = true;
  }

  return {
    settings: {
      whatsappNumber: "+1234567890",
      emailId: shopInfo.email || "merchant@example.com",
      selectedPlan,
      shopName: shopInfo.name,
      reportSchedule: {
        frequency: "weekly",
        day: "monday",
        time: "09:00",
      },
      aiSuggestions: true,
      aiAudienceAnalysis: true,
    },
    userPreferences,
    mailchimpConnection: mailchimpConnection
      ? {
          isConnected: true,
          connectedAt: mailchimpConnection.connectedAt.toISOString(),
        }
      : undefined,
    currentPlan: currentPlanName,
    isDevMode,
  };
};

/**
 * Action Function - Save Settings
 *
 * Handles form submissions and saves settings to the database.
 * Also handles test message/email sending.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const actionType = formData.get("actionType");

  try {
    switch (actionType) {
      case "saveSettings":
        // Save all settings to database
        const settings = {
          whatsappNumber: formData.get("whatsappNumber"),
          emailId: formData.get("emailId"),
          selectedPlan: formData.get("selectedPlan"),
          reportSchedule: {
            frequency: formData.get("reportFrequency"),
            day: formData.get("reportDay"),
            time: formData.get("reportTime"),
          },
          aiSuggestions: formData.get("aiSuggestions") === "true",
          aiAudienceAnalysis: formData.get("aiAudienceAnalysis") === "true",
        };

        // In a real app, save to database here (Prisma/Supabase/etc.)
        const language = (formData.get("language") as string) || "en";
        const userPreferences: UserPreferences = {
          language,
        };

        await saveUserPreferences(shop, userPreferences);

        return {
          success: true,
          message: "Settings saved successfully!",
          settings,
          userPreferences,
        };

      case "testWhatsApp":
        const whatsappNumber = formData.get("whatsappNumber");
        // In a real app, integrate with WhatsApp Business API
        console.log("Sending test WhatsApp to:", whatsappNumber);

        return {
          success: true,
          message: `Test WhatsApp message sent to ${whatsappNumber}`,
          type: "whatsapp",
        };

      case "testEmail":
        const emailId = formData.get("emailId");
        // In a real app, integrate with email service (SendGrid, etc.)
        console.log("Sending test email to:", emailId);

        return {
          success: true,
          message: `Test email sent to ${emailId}`,
          type: "email",
        };

      default:
        return {
          success: false,
          message: "Invalid action type",
        };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while saving settings",
    };
  }
};

/**
 * Settings Page Component
 *
 * Route handler that loads data and renders the main Settings component
 */
export default function SettingsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Toast state for success/error messages
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Handle Mailchimp callback query parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    const mailchimpStatus = url.searchParams.get("mailchimp");
    
    if (mailchimpStatus === "connected") {
      setToastMessage("✅ Mailchimp connected successfully!");
      setToastError(false);
      setToastActive(true);
      // Clean up URL
      window.history.replaceState({}, "", "/app/settings");
    } else if (mailchimpStatus === "error") {
      setToastMessage("❌ Failed to connect Mailchimp. Please try again.");
      setToastError(true);
      setToastActive(true);
      // Clean up URL
      window.history.replaceState({}, "", "/app/settings");
    }
  }, []);

  // Show toast messages based on action results
  useEffect(() => {
    if (actionData) {
      setToastMessage(actionData.message);
      setToastError(!actionData.success);
      setToastActive(true);
    }
  }, [actionData]);

  // Loading states
  const isLoading = navigation.state === "submitting";
  const isSaving = navigation.formData?.get("actionType") === "saveSettings";
  const isTestingWhatsApp =
    navigation.formData?.get("actionType") === "testWhatsApp";
  const isTestingEmail = navigation.formData?.get("actionType") === "testEmail";

  // Handle form submission
  const handleSubmit = useCallback(
    (formData: FormData) => {
      submit(formData, { method: "post" });
    },
    [submit],
  );

  return (
    <Frame>
      {/* <UpgradeBanner /> */}
      <Page>
        <TitleBar title="Settings" />

        {/* Toast for success/error messages */}
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <Settings
          settings={loaderData.settings}
          initialLanguage={loaderData.userPreferences.language}
          mailchimpConnection={loaderData.mailchimpConnection}
          actionData={actionData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isSaving={isSaving}
          isTestingWhatsApp={isTestingWhatsApp}
          isTestingEmail={isTestingEmail}
        />
      </Page>
    </Frame>
  );
}
