/**
 * Settings Page for AI Audience Insight Shopify App
 *
 * This page provides a comprehensive settings interface for merchants to configure:
 * - WhatsApp and Email communication settings
 * - Plan selection and billing preferences
 * - Automated reporting schedules
 * - AI campaign suggestion preferences
 */

import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Modal,
  Text,
  BlockStack,
  InlineStack,
  Checkbox,
  ChoiceList,
  Divider,
  Banner,
  Toast,
  Frame,
  Badge,
  Icon,
  Box,
} from "@shopify/polaris";
import {
  SettingsIcon,
  PhoneIcon,
  EmailIcon,
  CalendarIcon,
  MagicIcon,
  CheckIcon,
  ExportIcon,
  ViewIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

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

// ==========================================
// Types and Interfaces
// ==========================================

interface Settings {
  whatsappNumber: string;
  emailId: string;
  selectedPlan: string;
  reportSchedule: {
    frequency: string;
    day: string;
    time: string;
  };
  aiSuggestions: boolean;
}

interface LoaderData {
  settings: Settings;
}

interface ActionData {
  success: boolean;
  message: string;
  type?: string;
  settings?: Settings;
}

// ==========================================
// Main Settings Component
// ==========================================

/**
 * Main Settings Page Component
 *
 * Provides a comprehensive settings interface with modals for
 * WhatsApp/Email configuration and form controls for all other settings.
 */
export default function SettingsPage() {
  // ==========================================
  // Hooks and State Management
  // ==========================================

  const { settings } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Modal states
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Form states
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [emailId, setEmailId] = useState(settings.emailId);
  const [selectedPlan, setSelectedPlan] = useState(settings.selectedPlan);
  const [reportFrequency, setReportFrequency] = useState(settings.reportSchedule.frequency);
  const [reportDay, setReportDay] = useState(settings.reportSchedule.day);
  const [reportTime, setReportTime] = useState(settings.reportSchedule.time);
  const [aiSuggestions, setAiSuggestions] = useState(settings.aiSuggestions);

  // Toast state for success/error messages
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Loading states
  const isLoading = navigation.state === "submitting";
  const isSaving = navigation.formData?.get("actionType") === "saveSettings";

  // ==========================================
  // Event Handlers
  // ==========================================

  // Handle form submission for saving all settings
  const handleSaveSettings = useCallback(() => {
    const formData = new FormData();
    formData.append("actionType", "saveSettings");
    formData.append("whatsappNumber", whatsappNumber);
    formData.append("emailId", emailId);
    formData.append("selectedPlan", selectedPlan);
    formData.append("reportFrequency", reportFrequency);
    formData.append("reportDay", reportDay);
    formData.append("reportTime", reportTime);
    formData.append("aiSuggestions", aiSuggestions.toString());

    submit(formData, { method: "post" });
  }, [submit, whatsappNumber, emailId, selectedPlan, reportFrequency, reportDay, reportTime, aiSuggestions]);

  // Handle WhatsApp test message
  const handleTestWhatsApp = useCallback(() => {
    const formData = new FormData();
    formData.append("actionType", "testWhatsApp");
    formData.append("whatsappNumber", whatsappNumber);

    submit(formData, { method: "post" });
  }, [submit, whatsappNumber]);

  // Handle email test
  const handleTestEmail = useCallback(() => {
    const formData = new FormData();
    formData.append("actionType", "testEmail");
    formData.append("emailId", emailId);

    submit(formData, { method: "post" });
  }, [submit, emailId]);

  // Show toast messages based on action results
  const showToast = useCallback((message: string, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  }, []);

  // Handle action data changes (success/error responses)
  useState(() => {
    if (actionData) {
      showToast(actionData.message, !actionData.success);

      // Close modals on successful test
      if (actionData.success && actionData.type === "whatsapp") {
        setWhatsappModalOpen(false);
      }
      if (actionData.success && actionData.type === "email") {
        setEmailModalOpen(false);
      }
    }
  });

  // ==========================================
  // Plan Options Configuration
  // ==========================================

  const planOptions = [
    { label: "Free Plan - Basic features", value: "free" },
    { label: "Basic Plan - $29/month", value: "basic" },
    { label: "Growth Plan - $79/month", value: "growth" },
    { label: "Enterprise Plan - $199/month", value: "enterprise" },
  ];

  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  const dayOptions = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" },
  ];

  // ==========================================
  // Component Render
  // ==========================================

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
            <BlockStack gap="500">

              {/* Compact Page Header */}
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h1" variant="headingLg">
                    App Settings
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Configure your app preferences and communication settings
                  </Text>
                </BlockStack>
                <Badge tone="info">Configuration</Badge>
              </InlineStack>

              {/* Compact Settings Grid */}
              <Layout>
                <Layout.Section variant="oneHalf">

                  {/* Communication Settings Box */}
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        📱 Communication
                      </Text>

                      <FormLayout>
                        {/* WhatsApp Setting - Compact */}
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="050">
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                              WhatsApp Number
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {whatsappNumber || "Not configured"}
                            </Text>
                          </BlockStack>
                          <Button
                            size="slim"
                            onClick={() => setWhatsappModalOpen(true)}
                          >
                            Configure
                          </Button>
                        </InlineStack>

                        <Divider />

                        {/* Email Setting - Compact */}
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="050">
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                              Email Address
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {emailId || "Not configured"}
                            </Text>
                          </BlockStack>
                          <Button
                            size="slim"
                            onClick={() => setEmailModalOpen(true)}
                          >
                            Configure
                          </Button>
                        </InlineStack>
                      </FormLayout>
                    </BlockStack>
                  </Card>

                  {/* AI & Automation Box */}
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        🤖 AI & Automation
                      </Text>

                      <FormLayout>
                        {/* AI Suggestions - Compact */}
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="050">
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                              AI Campaign Suggestions
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Get intelligent recommendations
                            </Text>
                          </BlockStack>
                          <Checkbox
                            label=""
                            labelHidden
                            checked={aiSuggestions}
                            onChange={setAiSuggestions}
                          />
                        </InlineStack>

                        <Divider />

                        {/* Report Schedule - Compact */}
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="050">
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                              Automated Reports
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {reportFrequency} on {reportDay}s at {reportTime}
                            </Text>
                          </BlockStack>
                          <Button
                            size="slim"
                            onClick={() => setScheduleModalOpen(true)}
                          >
                            Schedule
                          </Button>
                        </InlineStack>
                      </FormLayout>
                    </BlockStack>
                  </Card>

                </Layout.Section>

                <Layout.Section variant="oneHalf">

                  {/* Plan & Billing Box */}
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        💰 Plan & Billing
                      </Text>

                      <FormLayout>
                        <Select
                          label="Current Plan"
                          options={planOptions}
                          value={selectedPlan}
                          onChange={setSelectedPlan}
                        />

                        {selectedPlan !== "free" && (
                          <Box
                            background="bg-surface-info"
                            padding="300"
                            borderRadius="200"
                          >
                            <Text as="p" variant="bodySm">
                              💡 Changes apply to your next billing cycle
                            </Text>
                          </Box>
                        )}
                      </FormLayout>
                    </BlockStack>
                  </Card>

                  {/* Quick Actions Box */}
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        ⚡ Quick Actions
                      </Text>

                      <BlockStack gap="200">
                        <Button
                          variant="secondary"
                          fullWidth
                          icon={ExportIcon}
                          onClick={() => {/* Export all data */}}
                        >
                          Export All Data
                        </Button>

                        <Button
                          variant="secondary"
                          fullWidth
                          icon={ViewIcon}
                          url="/app/help"
                        >
                          View Documentation
                        </Button>

                        <Button
                          variant="secondary"
                          fullWidth
                          icon={EmailIcon}
                          url="mailto:support@audienceinsight.com"
                          external
                        >
                          Contact Support
                        </Button>
                      </BlockStack>
                    </BlockStack>
                  </Card>

                </Layout.Section>
              </Layout>

              {/* Compact Save Button */}
              <Card>
                <InlineStack align="center">
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    loading={isSaving}
                    size="large"
                  >
                    💾 Save All Settings
                  </Button>
                </InlineStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* ==========================================
             WhatsApp Modal
             ========================================== */}

        <Modal
          open={whatsappModalOpen}
          onClose={() => setWhatsappModalOpen(false)}
          title="Set WhatsApp Number"
          primaryAction={{
            content: "Save Number",
            onAction: () => {
              setWhatsappModalOpen(false);
              showToast("WhatsApp number updated successfully!");
            },
          }}
          secondaryActions={[
            {
              content: "Send Test Message",
              onAction: handleTestWhatsApp,
              disabled: !whatsappNumber,
              loading: navigation.formData?.get("actionType") === "testWhatsApp",
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                Enter your WhatsApp Business number to receive notifications and send customer messages.
              </Text>

              <TextField
                label="WhatsApp Number"
                value={whatsappNumber}
                onChange={setWhatsappNumber}
                placeholder="+1234567890"
                helpText="Include country code (e.g., +1 for US)"
                autoComplete="tel"
              />

              <Banner tone="info">
                <p>
                  Make sure this number is connected to WhatsApp Business API for automated messaging.
                </p>
              </Banner>
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* ==========================================
             Email Modal
             ========================================== */}

        <Modal
          open={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          title="Set Email Address"
          primaryAction={{
            content: "Save Email",
            onAction: () => {
              setEmailModalOpen(false);
              showToast("Email address updated successfully!");
            },
          }}
          secondaryActions={[
            {
              content: "Send Test Email",
              onAction: handleTestEmail,
              disabled: !emailId,
              loading: navigation.formData?.get("actionType") === "testEmail",
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                Enter your email address to receive reports, notifications, and important updates.
              </Text>

              <TextField
                label="Email Address"
                value={emailId}
                onChange={setEmailId}
                placeholder="your-email@example.com"
                type="email"
                autoComplete="email"
              />

              <Banner tone="info">
                <p>
                  This email will be used for automated reports and system notifications.
                </p>
              </Banner>
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* ==========================================
             Schedule Modal
             ========================================== */}

        <Modal
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title="Set Report Schedule"
          primaryAction={{
            content: "Save Schedule",
            onAction: () => {
              setScheduleModalOpen(false);
              showToast("Report schedule updated successfully!");
            },
          }}
        >
          <Modal.Section>
            <FormLayout>
              <Text as="p" variant="bodyMd">
                Configure when you want to receive automated customer insight reports.
              </Text>

              <Select
                label="Report Frequency"
                options={frequencyOptions}
                value={reportFrequency}
                onChange={setReportFrequency}
              />

              {reportFrequency === "weekly" && (
                <Select
                  label="Day of Week"
                  options={dayOptions}
                  value={reportDay}
                  onChange={setReportDay}
                />
              )}

              <TextField
                label="Time"
                value={reportTime}
                onChange={setReportTime}
                type="time"
                helpText="Time in 24-hour format"
                autoComplete="off"
              />

              <Banner tone="success">
                <p>
                  Reports will be automatically generated and sent to your email address.
                </p>
              </Banner>
            </FormLayout>
          </Modal.Section>
        </Modal>

      </Page>
    </Frame>
  );
}
