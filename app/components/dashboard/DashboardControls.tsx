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
}: DashboardControlsProps) {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [visibility, setVisibility] = useState<DashboardVisibility>(
    initialVisibility || DEFAULT_VISIBILITY,
  );

  // Update visibility when initialVisibility changes (from Supabase)
  useEffect(() => {
    if (initialVisibility) {
      setVisibility(initialVisibility);
      onVisibilityChange?.(initialVisibility);
    } else {
      onVisibilityChange?.(DEFAULT_VISIBILITY);
    }
  }, [initialVisibility]);

  const handleCustomizeClick = () => {
    setShowCustomizeModal(true);
    onCustomize();
  };

  // Save preferences to Supabase
  const savePreferences = async (newVisibility: DashboardVisibility) => {
    try {
      const formData = new FormData();
      formData.append("preferences", JSON.stringify(newVisibility));

      const response = await fetch("/api/dashboard/preferences", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("[Dashboard Controls] Error saving preferences:", error);
      // Continue even if save fails - user can retry
    }
  };

  const handleSave = () => {
    savePreferences(visibility);
    onVisibilityChange?.(visibility);
    setShowCustomizeModal(false);
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
            enabled: true, // Keep section enabled, just toggle cards
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
            enabled: true, // Keep section enabled, just toggle cards
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
            enabled: true, // Keep section enabled, just toggle cards
            cards: {
              discountUsers: newValue,
              wishlistUsers: newValue,
              reviewers: newValue,
              emailSubscribers: newValue,
            },
          },
        };
      }

      // Save to Supabase
      savePreferences(newVisibility);
      onVisibilityChange?.(newVisibility);
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
      // Don't change section enabled state - just toggle the individual card
      // The section header checkbox will reflect the state automatically
      const newVisibility = {
        ...prev,
        [section]: {
          ...prevSection,
          cards: newCards,
        },
      };

      // Save to Supabase
      savePreferences(newVisibility);
      onVisibilityChange?.(newVisibility);
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
            enabled: true, // Keep section enabled
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
            enabled: true, // Keep section enabled
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
            enabled: true, // Keep section enabled
            cards: {
              discountUsers: newValue,
              wishlistUsers: newValue,
              reviewers: newValue,
              emailSubscribers: newValue,
            },
          },
        };
      }

      // Save to Supabase
      savePreferences(newVisibility);
      onVisibilityChange?.(newVisibility);
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
            . Last updated: {new Date().toLocaleString()}
          </Text>
        </BlockStack>
      </Card>

      <Modal
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        title="Customize Dashboard"
        primaryAction={{
          content: "Save",
          onAction: handleSave,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowCustomizeModal(false),
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
