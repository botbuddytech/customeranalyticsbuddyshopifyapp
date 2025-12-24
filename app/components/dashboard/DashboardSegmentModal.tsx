import { Modal, BlockStack, Text, DataTable, Spinner } from "@shopify/polaris";
import { useState } from "react";
import { ProtectedDataAccessModal } from "./ProtectedDataAccessModal";

export interface DashboardCustomer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
  country?: string;
}

export interface DashboardSegmentData {
  customers: DashboardCustomer[];
  total: number;
  error?: string;
}

interface DashboardSegmentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: DashboardSegmentData | null;
  isLoading?: boolean;
  dateRangeLabel?: string;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  featureName?: string;
  onShowToast?: (message: string) => void;
}

/**
 * Reusable Dashboard Segment Modal Component
 *
 * Displays customer list in a modal with export functionality.
 * Used by all dashboard insight cards.
 */
export function DashboardSegmentModal({
  open,
  onClose,
  title,
  data,
  isLoading = false,
  dateRangeLabel,
  onExportCSV,
  onExportPDF,
  onExportExcel,
  featureName,
  onShowToast,
}: DashboardSegmentModalProps) {
  const [showAccessModal, setShowAccessModal] = useState(false);

  const hasCustomers = data?.customers && data.customers.length > 0;
  const hasError = data?.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED";

  const handleCreateCampaign = () => {
    if (onShowToast) {
      onShowToast("Coming soon");
    }
  };

  // Show protected data access modal if needed
  if (hasError && open) {
    if (!showAccessModal) {
      setShowAccessModal(true);
    }
  }

  // Prepare table data
  const tableHeadings = [
    "Name",
    "Email",
    "Created Date",
    "Orders",
    "Total Spent",
  ];

  const tableRows =
    data?.customers?.map((customer) => [
      customer.name,
      customer.email,
      customer.createdAt,
      customer.numberOfOrders.toString(),
      customer.totalSpent,
    ]) || [];

  // Build secondary actions for export and campaign
  // NOTE: "Create Campaign" button is ALWAYS shown (first button)
  // Export buttons (PDF, CSV, Excel) are optional and only show if handlers are provided
  const secondaryActions = [];

  // Always add Create Campaign button first (always visible, but disabled if no customers)
  secondaryActions.push({
    content: "Create Campaign",
    onAction: handleCreateCampaign,
    disabled: !hasCustomers || isLoading,
  });

  // Add export actions (only if handlers are provided)
  if (onExportPDF) {
    secondaryActions.push({
      content: "Export as PDF",
      onAction: () => {
        if (onExportPDF) onExportPDF();
      },
      disabled: !hasCustomers || isLoading,
    });
  }
  if (onExportCSV) {
    secondaryActions.push({
      content: "Export as CSV",
      onAction: () => {
        if (onExportCSV) onExportCSV();
      },
      disabled: !hasCustomers || isLoading,
    });
  }
  if (onExportExcel) {
    secondaryActions.push({
      content: "Export as Excel",
      onAction: () => {
        if (onExportExcel) onExportExcel();
      },
      disabled: !hasCustomers || isLoading,
    });
  }

  return (
    <>
      <Modal
        open={open && !showAccessModal}
        onClose={onClose}
        title={title}
        primaryAction={{
          content: "Close",
          onAction: onClose,
        }}
        secondaryActions={secondaryActions}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner size="large" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Loading customers...
                </Text>
              </div>
            ) : hasError ? (
              <Text as="p" variant="bodyMd" tone="critical">
                Access to customer data is required to view this list. Please
                request access in your Partner Dashboard.
              </Text>
            ) : hasCustomers ? (
              <>
                <Text as="p" variant="bodyMd">
                  Showing {data.total} customer{data.total !== 1 ? "s" : ""}
                  {dateRangeLabel ? ` for ${dateRangeLabel}` : ""}.
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "numeric",
                    "text",
                  ]}
                  headings={tableHeadings}
                  rows={tableRows}
                />
              </>
            ) : (
              <Text as="p" variant="bodyMd">
                No customers found
                {dateRangeLabel ? ` for ${dateRangeLabel}` : ""}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      <ProtectedDataAccessModal
        open={showAccessModal}
        onClose={() => {
          setShowAccessModal(false);
          onClose();
        }}
        dataType="customer"
        featureName={featureName || title}
      />
    </>
  );
}
