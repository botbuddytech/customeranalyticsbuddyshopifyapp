import { useState, useEffect } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Select,
  Modal,
  Checkbox,
  Divider,
} from "@shopify/polaris";

interface DashboardControlsProps {
  dateRangeValue: string;
  onDateRangeChange: (value: string) => void;
  onCustomize: () => void;
  onVisibilityChange?: (visibility: DashboardVisibility) => void;
  initialVisibility?: DashboardVisibility | null;
  currentVisibility?: DashboardVisibility | null; // Current applied visibility state
}

export interface DashboardVisibility {
  customersOverview: {
    enabled: boolean;
    cards: {
      totalCustomers: boolean;
      newCustomers: boolean;
      returningCustomers: boolean;
      inactiveCustomers: boolean;
    };
  };
  purchaseOrderBehavior: {
    enabled: boolean;
    cards: {
      codOrders: boolean;
      prepaidOrders: boolean;
      cancelledOrders: boolean;
      abandonedCarts: boolean;
    };
  };
  engagementPatterns: {
    enabled: boolean;
    cards: {
      discountUsers: boolean;
      wishlistUsers: boolean;
      reviewers: boolean;
      emailSubscribers: boolean;
    };
  };
}

const DEFAULT_VISIBILITY: DashboardVisibility = {
  customersOverview: {
    enabled: true,
    cards: {
      totalCustomers: true,
      newCustomers: true,
      returningCustomers: true,
      inactiveCustomers: true,
    },
  },
  purchaseOrderBehavior: {
    enabled: true,
    cards: {
      codOrders: true,
      prepaidOrders: true,
      cancelledOrders: true,
      abandonedCarts: true,
    },
  },
  engagementPatterns: {
    enabled: true,
    cards: {
      discountUsers: true,
      wishlistUsers: true,
      reviewers: true,
      emailSubscribers: true,
    },
  },
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Dashboard Controls] Response not OK:", errorData);
        throw new Error(
          errorData.error || `Failed to save preferences: ${response.status}`,
        );
      }

      const data = await response.json();
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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionToggle = (section: keyof DashboardVisibility) => {
    setVisibility((prev) => {
      const prevSection = prev[section];
      const anyCardChecked = Object.values(prevSection.cards).some(
        (v) => v === true,
      );
      // If any card is checked, uncheck all. If all are unchecked, check all.
      const newValue = !anyCardChecked;

      let newVisibility: DashboardVisibility;
      if (section === "customersOverview") {
        newVisibility = {
          ...prev,
          customersOverview: {
            enabled: newValue, // Sync enabled state with card toggle
            cards: {
              totalCustomers: newValue,
              newCustomers: newValue,
              returningCustomers: newValue,
              inactiveCustomers: newValue,
            },
          },
        };
      } else if (section === "purchaseOrderBehavior") {
        newVisibility = {
          ...prev,
          purchaseOrderBehavior: {
            enabled: newValue, // Sync enabled state with card toggle
            cards: {
              codOrders: newValue,
              prepaidOrders: newValue,
              cancelledOrders: newValue,
              abandonedCarts: newValue,
            },
          },
        };
      } else {
        newVisibility = {
          ...prev,
          engagementPatterns: {
            enabled: newValue, // Sync enabled state with card toggle
            cards: {
              discountUsers: newValue,
              wishlistUsers: newValue,
              reviewers: newValue,
              emailSubscribers: newValue,
            },
          },
        };
      }

      // Don't save immediately - only update local state
      // Save will happen when user clicks "Save" button
      return newVisibility;
    });
  };

  const handleCardToggle = (
    section: keyof DashboardVisibility,
    card: string,
  ) => {
    setVisibility((prev) => {
      const prevSection = prev[section];
      const cardKey = card as keyof typeof prevSection.cards;
      const newCards = {
        ...prevSection.cards,
        [cardKey]: !prevSection.cards[cardKey],
      };

      // Update enabled state based on if any card is checked
      const isEnabled = Object.values(newCards).some((v) => v === true);

      const newVisibility = {
        ...prev,
        [section]: {
          ...prevSection,
          enabled: isEnabled, // Sync enabled state
          cards: newCards,
        },
      };

      // Don't save immediately - only update local state
      // Save will happen when user clicks "Save" button
      return newVisibility;
    });
  };

  const handleSelectAll = (section: keyof DashboardVisibility) => {
    const sectionData = visibility[section];
    const allSelected = Object.values(sectionData.cards).every(
      (v) => v === true,
    );
    setVisibility((prev) => {
      const prevSection = prev[section];
      const newValue = !allSelected;
      let newVisibility: DashboardVisibility;
      if (section === "customersOverview") {
        newVisibility = {
          ...prev,
          customersOverview: {
            enabled: newValue, // Sync enabled state
            cards: {
              totalCustomers: newValue,
              newCustomers: newValue,
              returningCustomers: newValue,
              inactiveCustomers: newValue,
            },
          },
        };
      } else if (section === "purchaseOrderBehavior") {
        newVisibility = {
          ...prev,
          purchaseOrderBehavior: {
            enabled: newValue, // Sync enabled state
            cards: {
              codOrders: newValue,
              prepaidOrders: newValue,
              cancelledOrders: newValue,
              abandonedCarts: newValue,
            },
          },
        };
      } else {
        newVisibility = {
          ...prev,
          engagementPatterns: {
            enabled: newValue, // Sync enabled state
            cards: {
              discountUsers: newValue,
              wishlistUsers: newValue,
              reviewers: newValue,
              emailSubscribers: newValue,
            },
          },
        };
      }

      // Don't save immediately - only update local state
      // Save will happen when user clicks "Save" button
      return newVisibility;
    });
  };

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
                options={[
                  { label: "Today", value: "today" },
                  { label: "Yesterday", value: "yesterday" },
                  { label: "Last 7 days", value: "last7Days" },
                  { label: "Last 30 days", value: "last30Days" },
                  { label: "Last 90 days", value: "last90Days" },
                  { label: "This month", value: "thisMonth" },
                  { label: "Last month", value: "lastMonth" },
                  { label: "Custom range", value: "custom" },
                ]}
                value={dateRangeValue}
                onChange={onDateRangeChange}
              />
            </InlineStack>

            <InlineStack gap="200">
              <Button onClick={handleCustomizeClick} variant="secondary">
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

      <Modal
        open={showCustomizeModal}
        onClose={() => {
          if (!isSaving) {
            setShowCustomizeModal(false);
          }
        }}
        title="Customize Dashboard"
        primaryAction={{
          content: isSaving ? "Saving..." : "Save",
          onAction: handleSave,
          loading: isSaving,
          disabled: isSaving,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              if (!isSaving) {
                setShowCustomizeModal(false);
              }
            },
            disabled: isSaving,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <Text variant="bodyMd" as="p" tone="subdued">
              Select which sections and cards you want to display on your
              dashboard.
            </Text>

            {/* Customers Overview */}
            <BlockStack gap="300">
              <Checkbox
                label="Customers Overview"
                checked={Object.values(visibility.customersOverview.cards).some(
                  (v) => v === true,
                )}
                onChange={() => handleSectionToggle("customersOverview")}
              />
              {visibility.customersOverview.enabled && (
                <BlockStack gap="200">
                  <div style={{ paddingLeft: "24px" }}>
                    <Button
                      variant="plain"
                      onClick={() => handleSelectAll("customersOverview")}
                      size="micro"
                    >
                      {Object.values(visibility.customersOverview.cards).every(
                        (v) => v === true,
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div style={{ paddingLeft: "24px" }}>
                    <BlockStack gap="200">
                      <Checkbox
                        label="Total Customers"
                        checked={
                          visibility.customersOverview.cards.totalCustomers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "customersOverview",
                            "totalCustomers",
                          )
                        }
                      />
                      <Checkbox
                        label="New Customers"
                        checked={
                          visibility.customersOverview.cards.newCustomers
                        }
                        onChange={() =>
                          handleCardToggle("customersOverview", "newCustomers")
                        }
                      />
                      <Checkbox
                        label="Returning Customers"
                        checked={
                          visibility.customersOverview.cards.returningCustomers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "customersOverview",
                            "returningCustomers",
                          )
                        }
                      />
                      <Checkbox
                        label="Inactive Customers"
                        checked={
                          visibility.customersOverview.cards.inactiveCustomers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "customersOverview",
                            "inactiveCustomers",
                          )
                        }
                      />
                    </BlockStack>
                  </div>
                </BlockStack>
              )}
            </BlockStack>

            <Divider />

            {/* Purchase & Order Behavior */}
            <BlockStack gap="300">
              <Checkbox
                label="Purchase & Order Behavior"
                checked={Object.values(
                  visibility.purchaseOrderBehavior.cards,
                ).some((v) => v === true)}
                onChange={() => handleSectionToggle("purchaseOrderBehavior")}
              />
              {visibility.purchaseOrderBehavior.enabled && (
                <BlockStack gap="200">
                  <div style={{ paddingLeft: "24px" }}>
                    <Button
                      variant="plain"
                      onClick={() => handleSelectAll("purchaseOrderBehavior")}
                      size="micro"
                    >
                      {Object.values(
                        visibility.purchaseOrderBehavior.cards,
                      ).every((v) => v === true)
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div style={{ paddingLeft: "24px" }}>
                    <BlockStack gap="200">
                      <Checkbox
                        label="COD Orders"
                        checked={
                          visibility.purchaseOrderBehavior.cards.codOrders
                        }
                        onChange={() =>
                          handleCardToggle("purchaseOrderBehavior", "codOrders")
                        }
                      />
                      <Checkbox
                        label="Prepaid Orders"
                        checked={
                          visibility.purchaseOrderBehavior.cards.prepaidOrders
                        }
                        onChange={() =>
                          handleCardToggle(
                            "purchaseOrderBehavior",
                            "prepaidOrders",
                          )
                        }
                      />
                      <Checkbox
                        label="Cancelled Orders"
                        checked={
                          visibility.purchaseOrderBehavior.cards.cancelledOrders
                        }
                        onChange={() =>
                          handleCardToggle(
                            "purchaseOrderBehavior",
                            "cancelledOrders",
                          )
                        }
                      />
                      <Checkbox
                        label="Abandoned Carts"
                        checked={
                          visibility.purchaseOrderBehavior.cards.abandonedCarts
                        }
                        onChange={() =>
                          handleCardToggle(
                            "purchaseOrderBehavior",
                            "abandonedCarts",
                          )
                        }
                      />
                    </BlockStack>
                  </div>
                </BlockStack>
              )}
            </BlockStack>

            <Divider />

            {/* Engagement Patterns */}
            <BlockStack gap="300">
              <Checkbox
                label="Engagement Patterns"
                checked={Object.values(
                  visibility.engagementPatterns.cards,
                ).some((v) => v === true)}
                onChange={() => handleSectionToggle("engagementPatterns")}
              />
              {visibility.engagementPatterns.enabled && (
                <BlockStack gap="200">
                  <div style={{ paddingLeft: "24px" }}>
                    <Button
                      variant="plain"
                      onClick={() => handleSelectAll("engagementPatterns")}
                      size="micro"
                    >
                      {Object.values(visibility.engagementPatterns.cards).every(
                        (v) => v === true,
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div style={{ paddingLeft: "24px" }}>
                    <BlockStack gap="200">
                      <Checkbox
                        label="Discount Users"
                        checked={
                          visibility.engagementPatterns.cards.discountUsers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "engagementPatterns",
                            "discountUsers",
                          )
                        }
                      />
                      <Checkbox
                        label="Wishlist Users"
                        checked={
                          visibility.engagementPatterns.cards.wishlistUsers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "engagementPatterns",
                            "wishlistUsers",
                          )
                        }
                      />
                      <Checkbox
                        label="Reviewers"
                        checked={visibility.engagementPatterns.cards.reviewers}
                        onChange={() =>
                          handleCardToggle("engagementPatterns", "reviewers")
                        }
                      />
                      <Checkbox
                        label="Email Subscribers"
                        checked={
                          visibility.engagementPatterns.cards.emailSubscribers
                        }
                        onChange={() =>
                          handleCardToggle(
                            "engagementPatterns",
                            "emailSubscribers",
                          )
                        }
                      />
                    </BlockStack>
                  </div>
                </BlockStack>
              )}
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
