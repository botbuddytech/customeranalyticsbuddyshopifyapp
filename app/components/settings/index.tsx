/**
 * Settings Main Component
 * 
 * Orchestrates all settings components and handles state management
 */

import { useState, useCallback, useEffect } from "react";
import { Layout, BlockStack, InlineStack, Text, Badge, Card, Button } from "@shopify/polaris";
import { CommunicationSettingsCard } from "./CommunicationSettingsCard";
import { AIAutomationCard } from "./AIAutomationCard";
import { PlanBillingCard } from "./PlanBillingCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { WhatsAppModal } from "./WhatsAppModal";
import { EmailModal } from "./EmailModal";
import { ScheduleModal } from "./ScheduleModal";
import type { Settings, ActionData } from "./types";

interface SettingsProps {
  settings: Settings;
  actionData?: ActionData;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  isSaving: boolean;
  isTestingWhatsApp: boolean;
  isTestingEmail: boolean;
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
}: SettingsProps) {
  // Modal states
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Form states
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber);
  const [emailId, setEmailId] = useState(initialSettings.emailId);
  const [selectedPlan, setSelectedPlan] = useState(initialSettings.selectedPlan);
  const [reportFrequency, setReportFrequency] = useState(initialSettings.reportSchedule.frequency);
  const [reportDay, setReportDay] = useState(initialSettings.reportSchedule.day);
  const [reportTime, setReportTime] = useState(initialSettings.reportSchedule.time);
  const [aiSuggestions, setAiSuggestions] = useState(initialSettings.aiSuggestions);
  const [aiAudienceAnalysis, setAiAudienceAnalysis] = useState(initialSettings.aiAudienceAnalysis ?? true);

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

    onSubmit(formData);
  }, [onSubmit, whatsappNumber, emailId, selectedPlan, reportFrequency, reportDay, reportTime, aiSuggestions, aiAudienceAnalysis]);

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
          <CommunicationSettingsCard
            whatsappNumber={whatsappNumber}
            emailId={emailId}
            onConfigureWhatsApp={() => setWhatsappModalOpen(true)}
            onConfigureEmail={() => setEmailModalOpen(true)}
          />

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
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <PlanBillingCard
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />

          <QuickActionsCard />
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
  );
}

