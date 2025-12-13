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
import { useLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import { Page, Frame, Toast, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { Settings } from "../components/settings";
import type { LoaderData, ActionData } from "../components/settings/types";
import { useState, useEffect, useCallback } from "react";

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
  await authenticate.admin(request);

  // Mock current settings - replace with actual database query
  return {
    settings: {
      whatsappNumber: "+1234567890", // Current WhatsApp number
      emailId: "merchant@example.com", // Current email
      selectedPlan: "basic", // Current plan
      reportSchedule: {
        frequency: "weekly",
        day: "monday",
        time: "09:00"
      },
      aiSuggestions: true, // AI suggestions enabled/disabled
      aiAudienceAnalysis: true, // AI audience analysis enabled/disabled (default: true)
    }
  };
};

/**
 * Action Function - Save Settings
 *
 * Handles form submissions and saves settings to the database.
 * Also handles test message/email sending.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

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

        // In a real app, save to database here
        console.log("Saving settings:", settings);

        return {
          success: true,
          message: "Settings saved successfully!",
          settings
        };

      case "testWhatsApp":
        const whatsappNumber = formData.get("whatsappNumber");
        // In a real app, integrate with WhatsApp Business API
        console.log("Sending test WhatsApp to:", whatsappNumber);

        return {
          success: true,
          message: `Test WhatsApp message sent to ${whatsappNumber}`,
          type: "whatsapp"
        };

      case "testEmail":
        const emailId = formData.get("emailId");
        // In a real app, integrate with email service (SendGrid, etc.)
        console.log("Sending test email to:", emailId);

        return {
          success: true,
          message: `Test email sent to ${emailId}`,
          type: "email"
        };

      default:
        return {
          success: false,
          message: "Invalid action type"
        };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while saving settings"
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
  const isTestingWhatsApp = navigation.formData?.get("actionType") === "testWhatsApp";
  const isTestingEmail = navigation.formData?.get("actionType") === "testEmail";

  // Handle form submission
  const handleSubmit = useCallback((formData: FormData) => {
    submit(formData, { method: "post" });
  }, [submit]);

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="Settings" />

        {/* Toast for success/error messages */}
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <Layout>
          <Layout.Section>
            <Settings
              settings={loaderData.settings}
              actionData={actionData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isSaving={isSaving}
              isTestingWhatsApp={isTestingWhatsApp}
              isTestingEmail={isTestingEmail}
            />
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
