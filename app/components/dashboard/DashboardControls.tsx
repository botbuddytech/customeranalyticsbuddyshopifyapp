import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Select,
} from "@shopify/polaris";
import { CustomizeDashboardModal } from "./CustomizeDashboard/CustomizeDashboardModal";

interface DashboardControlsProps {
  dateRangeValue: string;
  onDateRangeChange: (value: string) => void;
  onCustomize: () => void;
  onVisibilityChange?: (visibility: DashboardVisibility) => void;
  initialVisibility?: DashboardVisibility | null;
  currentVisibility?: DashboardVisibility | null; // Current applied visibility state
}

import {
  DEFAULT_VISIBILITY,
  type DashboardVisibility,
} from "./dashboardConfig";

/**
 * Dashboard Controls Component
 *
 * Provides dashboard control options including:
 * - Date range selector
 * - Customize dashboard button with visibility controls
 */
export function DashboardControls({
  dateRangeValue,
  onDateRangeChange,
  onCustomize,
  onVisibilityChange,
  initialVisibility,
  currentVisibility,
}: DashboardControlsProps) {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [visibility, setVisibility] = useState<DashboardVisibility>(
    initialVisibility || DEFAULT_VISIBILITY,
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const fetcher = useFetcher();

  const isSaving = fetcher.state !== "idle";

  // Update visibility when initialVisibility changes (from Supabase on mount)
  useEffect(() => {
    if (initialVisibility) {
      setVisibility(initialVisibility);
    }
  }, [initialVisibility]);

  // Update visibility when currentVisibility changes (after save)
  useEffect(() => {
    if (currentVisibility) {
      setVisibility(currentVisibility);
    }
  }, [currentVisibility]);

  // Set last updated date only on client side to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  // Date range options - all features enabled for all users
  const dateRangeOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "last7Days" },
    { label: "Last 30 days", value: "last30Days" },
    { label: "Last 90 days", value: "last90Days" },
    { label: "This month", value: "thisMonth" },
    { label: "Last month", value: "lastMonth" },
    { label: "Custom range", value: "custom" },
  ];

  const handleCustomizeClick = () => {
    // Reset to current applied state when opening modal (discard any unsaved changes)
    // Use currentVisibility if available (after save), otherwise use initialVisibility
    const stateToUse = currentVisibility || initialVisibility;
    if (stateToUse) {
      setVisibility(stateToUse);
    }
    setShowCustomizeModal(true);
    onCustomize();
  };

  // Save preferences to Supabase
  const savePreferences = async (
    newVisibility: DashboardVisibility,
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("preferences", JSON.stringify(newVisibility));

      console.log("[Dashboard Controls] Sending save request...");
      const response = await fetch("/api/dashboard/preferences", {
        method: "POST",
        body: formData,
      });

      console.log(
        "[Dashboard Controls] Response status:",
        response.status,
        response.ok,
      );

      const responseText = await response.text();
      console.log("[Dashboard Controls] Response status:", response.status);
      console.log("[Dashboard Controls] Response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || `HTTP ${response.status}` };
        }
        console.error("[Dashboard Controls] Response not OK:", errorData);
        throw new Error(
          errorData.error || `Failed to save preferences: ${response.status}`,
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "[Dashboard Controls] Failed to parse response:",
          parseError,
        );
        throw new Error("Invalid response from server");
      }

      console.log("[Dashboard Controls] Response data:", data);

      // Check if the response indicates success
      if (data.success === true) {
        console.log("[Dashboard Controls] Save successful!");
        return true;
      } else {
        console.error("[Dashboard Controls] Response indicates failure:", data);
        throw new Error(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("[Dashboard Controls] Error saving preferences:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent double submission

    try {
      console.log("[Dashboard Controls] Saving preferences:", visibility);
      const success = await savePreferences(visibility);
      console.log("[Dashboard Controls] Save result:", success);

      if (success) {
        // Update UI and close modal after successful save
        console.log(
          "[Dashboard Controls] Preferences saved successfully, closing modal",
        );
        onVisibilityChange?.(visibility);
        // Close modal immediately after successful save
        setShowCustomizeModal(false);
      } else {
        // Keep modal open on error - user can try again
        console.error(
          "[Dashboard Controls] Failed to save preferences - keeping modal open",
        );
      }
    } catch (error) {
      console.error("[Dashboard Controls] Error in handleSave:", error);
      // Keep modal open on error so user can retry
    }
  };

  // Handlers moved to CustomizeDashboardModal

  return (
    <>
      <Card padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="400">
              <Text variant="headingMd" as="h2">
                Dashboard Controls
              </Text>
              <Select
                label="Date range"
                labelHidden
                options={dateRangeOptions}
                value={dateRangeValue}
                onChange={onDateRangeChange}
              />
            </InlineStack>

            <InlineStack gap="200" blockAlign="center">
              <Button
                onClick={handleCustomizeClick}
                variant="secondary"
              >
                Customize Dashboard
              </Button>
            </InlineStack>
          </InlineStack>

          <Text variant="bodyMd" as="p" tone="subdued">
            Currently showing data from{" "}
            {dateRangeValue === "last30Days"
              ? "the last 30 days"
              : "the selected period"}
            {lastUpdated && `. Last updated: ${lastUpdated}`}
          </Text>
        </BlockStack>
      </Card>

      <CustomizeDashboardModal
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        initialVisibility={visibility}
        onSave={async (newVisibility) => {
          const success = await savePreferences(newVisibility);
          if (success) {
            console.log(
              "[Dashboard Controls] Save successful, updating local state",
            );
            // Update local state to reflect changes immediately
            setVisibility(newVisibility);
            // Also notify parent if needed
            onVisibilityChange?.(newVisibility);
            return true;
          }
          return false;
        }}
      />
    </>
  );
}
