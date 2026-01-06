import { useState, useCallback, useEffect, type ReactNode } from "react";
import { BlockStack, InlineStack, Text, Button, Box } from "@shopify/polaris";
import { CommunicationSettingsCard } from "./CommunicationSettingsCard";
import { AIAutomationCard } from "./AIAutomationCard";
import { PlanBillingCard } from "./PlanBillingCard";
import { WhatsAppModal } from "./WhatsAppModal";
import { EmailModal } from "./EmailModal";
import { ScheduleModal } from "./ScheduleModal";
import { LanguageSettingsCard, LANGUAGE_CONFIG } from "./LanguageSettingsCard";
import { IntegrationSettings } from "./integration";
import { saveUserPreferencesToCookie } from "../../utils/userPreferences.client";
import type { Settings, ActionData } from "./types";

interface SettingsProps {
  settings: Settings;
  actionData?: ActionData;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  isSaving: boolean;
  isTestingWhatsApp: boolean;
  isTestingEmail: boolean;
  initialLanguage: string;
  mailchimpConnection?: {
    isConnected: boolean;
    connectedAt?: string;
  };
}

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Reusable two‑column settings section.
 * Left: title + description. Right: settings card/content.
 * Uses flexbox for layout (2 columns on desktop, stacked on mobile).
 */
function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <Box paddingBlockStart="400">
      <div
        style={{
          display: "flex",
          gap: "var(--p-space-400)",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "0 0 260px",
            maxWidth: "260px",
          }}
        >
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              {title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          </BlockStack>
        </div>
        <div
          style={{
            flex: "1 1 0",
            minWidth: "260px",
          }}
        >
          {children}
        </div>
      </div>
    </Box>
  );
}

/**
 * Main Settings Component
 *
 * Provides a comprehensive settings interface with modals for
 * WhatsApp/Email configuration and form controls for all other settings.
 */
export function Settings({
  settings: initialSettings,
  actionData,
  onSubmit,
  isLoading,
  isSaving,
  isTestingWhatsApp,
  isTestingEmail,
  initialLanguage,
  mailchimpConnection,
}: SettingsProps) {
  // Language / localization state (for future Weglot / i18n integration)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialLanguage || "en",
  );

  // Modal states
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Form states
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsappNumber,
  );
  const [emailId, setEmailId] = useState(initialSettings.emailId);
  const [selectedPlan, setSelectedPlan] = useState(
    initialSettings.selectedPlan,
  );
  const [reportFrequency, setReportFrequency] = useState(
    initialSettings.reportSchedule.frequency,
  );
  const [reportDay, setReportDay] = useState(
    initialSettings.reportSchedule.day,
  );
  const [reportTime, setReportTime] = useState(
    initialSettings.reportSchedule.time,
  );
  const [aiSuggestions, setAiSuggestions] = useState(
    initialSettings.aiSuggestions,
  );
  const [aiAudienceAnalysis, setAiAudienceAnalysis] = useState(
    initialSettings.aiAudienceAnalysis ?? true,
  );

  // Handle action data changes (success/error responses)
  useEffect(() => {
    if (actionData) {
      // Close modals on successful test
      if (actionData.success && actionData.type === "whatsapp") {
        setWhatsappModalOpen(false);
      }
      if (actionData.success && actionData.type === "email") {
        setEmailModalOpen(false);
      }
    }
  }, [actionData]);

  // Handle form submission for saving all settings
  const handleSaveSettings = useCallback(() => {
    // Keep cookie in sync with current selection
    saveUserPreferencesToCookie({ language: selectedLanguage });

    const formData = new FormData();
    formData.append("actionType", "saveSettings");
    formData.append("whatsappNumber", whatsappNumber);
    formData.append("emailId", emailId);
    formData.append("selectedPlan", selectedPlan);
    formData.append("reportFrequency", reportFrequency);
    formData.append("reportDay", reportDay);
    formData.append("reportTime", reportTime);
    formData.append("aiSuggestions", aiSuggestions.toString());
    formData.append("aiAudienceAnalysis", aiAudienceAnalysis.toString());
    formData.append("language", selectedLanguage);

    onSubmit(formData);
  }, [
    onSubmit,
    whatsappNumber,
    emailId,
    selectedPlan,
    reportFrequency,
    reportDay,
    reportTime,
    aiSuggestions,
    aiAudienceAnalysis,
    selectedLanguage,
  ]);

  // Handle WhatsApp test message
  const handleTestWhatsApp = useCallback(() => {
    const formData = new FormData();
    formData.append("actionType", "testWhatsApp");
    formData.append("whatsappNumber", whatsappNumber);

    onSubmit(formData);
  }, [onSubmit, whatsappNumber]);

  // Handle email test
  const handleTestEmail = useCallback(() => {
    const formData = new FormData();
    formData.append("actionType", "testEmail");
    formData.append("emailId", emailId);

    onSubmit(formData);
  }, [onSubmit, emailId]);

  // Handle WhatsApp modal save
  const handleWhatsAppSave = useCallback(() => {
    setWhatsappModalOpen(false);
    handleSaveSettings();
  }, [handleSaveSettings]);

  // Handle Email modal save
  const handleEmailSave = useCallback(() => {
    setEmailModalOpen(false);
    handleSaveSettings();
  }, [handleSaveSettings]);

  // Handle Schedule modal save
  const handleScheduleSave = useCallback(() => {
    setScheduleModalOpen(false);
    handleSaveSettings();
  }, [handleSaveSettings]);

  return (
    <div
      style={{
        // backgroundColor: "#F6F6F7",
        minHeight: "100vh",
        paddingBlock: "var(--p-space-400)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          paddingInline: "var(--p-space-400)",
        }}
      >
        <BlockStack gap="600">
          {/* Page Header aligned with content flex layout */}
          <Box paddingBlockEnd="200">
            <div
              style={{
                display: "flex",
                gap: "var(--p-space-400)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: "0 0 260px",
                  maxWidth: "260px",
                }}
              >
                <Text as="h1" variant="headingLg">
                  Settings
                </Text>
              </div>
              <div
                style={{
                  flex: "1 1 0",
                  minWidth: "260px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  loading={isSaving}
                >
                  Save
                </Button>
              </div>
            </div>
          </Box>

          {/* Section: Language & Localization */}
          <SettingsSection
            title="Language & Localization"
            description="Control which language your dashboard uses. Later, this can be connected to Weglot or another translation service."
          >
            <LanguageSettingsCard
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </SettingsSection>

          {/* Section: Waitlist Settings */}
          <SettingsSection
            title="Communication Settings"
            description="Customize your waitlist settings for out of stock products to ensure a seamless customer experience."
          >
            <CommunicationSettingsCard
              whatsappNumber={whatsappNumber}
              emailId={emailId}
              onConfigureWhatsApp={() => setWhatsappModalOpen(true)}
              onConfigureEmail={() => setEmailModalOpen(true)}
            />
          </SettingsSection>

          {/* Section: Email Settings */}
          <SettingsSection
            title="Email Settings"
            description="Customize the email template and tracking for your waitlist notifications."
          >
            <AIAutomationCard
              aiSuggestions={aiSuggestions}
              aiAudienceAnalysis={aiAudienceAnalysis}
              reportFrequency={reportFrequency}
              reportDay={reportDay}
              reportTime={reportTime}
              onToggleAISuggestions={setAiSuggestions}
              onToggleAIAudienceAnalysis={setAiAudienceAnalysis}
              onConfigureSchedule={() => setScheduleModalOpen(true)}
            />
          </SettingsSection>

          {/* Section: Integrations */}
          <SettingsSection
            title="Integrations"
            description="Connect your existing email tools like Mailchimp and Klaviyo (coming soon) with your audience insights."
          >
            <IntegrationSettings mailchimpConnection={mailchimpConnection} />
          </SettingsSection>

          {/* Section: Plan & Billing */}
          <SettingsSection
            title="Plan & Billing"
            description="View your current plan. Changes are managed directly in your Shopify billing settings."
          >
            <PlanBillingCard currentPlan={selectedPlan} />
          </SettingsSection>

          {/* Modals */}
          {/* Modals */}
          {/* Modals */}
          {/* Modals */}
          <WhatsAppModal
            open={whatsappModalOpen}
            onClose={() => setWhatsappModalOpen(false)}
            whatsappNumber={whatsappNumber}
            onNumberChange={setWhatsappNumber}
            onSave={handleWhatsAppSave}
            onTest={handleTestWhatsApp}
            isLoading={isSaving}
            isTesting={isTestingWhatsApp}
          />

          <EmailModal
            open={emailModalOpen}
            onClose={() => setEmailModalOpen(false)}
            emailId={emailId}
            onEmailChange={setEmailId}
            onSave={handleEmailSave}
            onTest={handleTestEmail}
            isLoading={isSaving}
            isTesting={isTestingEmail}
          />

          <ScheduleModal
            open={scheduleModalOpen}
            onClose={() => setScheduleModalOpen(false)}
            reportFrequency={reportFrequency}
            reportDay={reportDay}
            reportTime={reportTime}
            onFrequencyChange={setReportFrequency}
            onDayChange={setReportDay}
            onTimeChange={setReportTime}
            onSave={handleScheduleSave}
          />
        </BlockStack>
      </div>
    </div>
  );
}
