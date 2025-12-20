import { useState, useEffect } from "react";
import {
  Modal,
  BlockStack,
  Text,
  Checkbox,
  Button,
  Divider,
} from "@shopify/polaris";
import { type DashboardVisibility } from "../dashboardConfig";

interface CustomizeDashboardModalProps {
  open: boolean;
  onClose: () => void;
  initialVisibility: DashboardVisibility;
  onSave: (visibility: DashboardVisibility) => Promise<boolean>;
}

export function CustomizeDashboardModal({
  open,
  onClose,
  initialVisibility,
  onSave,
}: CustomizeDashboardModalProps) {
  const [visibility, setVisibility] = useState<DashboardVisibility>(initialVisibility);
  const [isSaving, setIsSaving] = useState(false);

  // Reset visibility when modal opens
  useEffect(() => {
    if (open) {
      setVisibility(initialVisibility);
    }
  }, [open, initialVisibility]);

  const handleSaveInternal = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const success = await onSave(visibility);
      if (success) {
        onClose();
      }
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
      const newValue = !anyCardChecked;

      let newVisibility: DashboardVisibility;
      // We need to construct the new state carefully to maintain type safety across the known keys
      // Since the structure is consistent, we can map it, but explicit handling is safer for TS
      
      const newSectionState = {
          ...prevSection,
          enabled: newValue,
          cards: Object.keys(prevSection.cards).reduce((acc, key) => {
              acc[key] = newValue;
              return acc;
          }, {} as Record<string, boolean>) as typeof prevSection.cards
      };

      return {
          ...prev,
          [section]: newSectionState
      };
    });
  };

  const handleCardToggle = (
    section: keyof DashboardVisibility,
    card: string,
  ) => {
    setVisibility((prev) => {
      const prevSection = prev[section];
      const cardKey = card as keyof typeof prevSection.cards;
      
      // Update the specific card
      const newCards = {
        ...prevSection.cards,
        [cardKey]: !prevSection.cards[cardKey],
      };

      // Update enabled state based on if any card is checked
      const isEnabled = Object.values(newCards).some((v) => v === true);

      return {
        ...prev,
        [section]: {
          ...prevSection,
          enabled: isEnabled,
          cards: newCards,
        },
      };
    });
  };

  const handleSelectAll = (section: keyof DashboardVisibility) => {
    const sectionData = visibility[section];
    const allSelected = Object.values(sectionData.cards).every(
      (v) => v === true,
    );
    const newValue = !allSelected;
    
    setVisibility((prev) => {
         const prevSection = prev[section];
         const newSectionState = {
            ...prevSection,
            enabled: newValue,
            cards: Object.keys(prevSection.cards).reduce((acc, key) => {
                acc[key] = newValue;
                return acc;
            }, {} as Record<string, boolean>) as typeof prevSection.cards
        };
        
        return {
            ...prev,
            [section]: newSectionState
        };
    });
  };

  return (
      <Modal
        open={open}
        onClose={() => {
          if (!isSaving) {
            onClose();
          }
        }}
        title="Customize Dashboard"
        primaryAction={{
          content: isSaving ? "Saving..." : "Save",
          onAction: handleSaveInternal,
          loading: isSaving,
          disabled: isSaving,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              if (!isSaving) {
                onClose();
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
  );
}
