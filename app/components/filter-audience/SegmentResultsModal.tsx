import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Banner,
  Badge,
  Tag,
  DataTable,
  Spinner,
  Box,
} from "@shopify/polaris";
import { ExportIcon, EmailIcon, SaveIcon } from "@shopify/polaris-icons";
import { ProtectedDataAccessModal } from "../dashboard/ProtectedDataAccessModal";
import { useState, useEffect } from "react";
import type { SegmentResults } from "./types";

interface SegmentResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: SegmentResults | null;
  isLoading?: boolean;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onCreateCampaign?: () => void;
  onSaveList?: () => void;
}

/**
 * Segment Results Modal Component
 *
 * Displays segment creation results in a modal dialog
 */
export function SegmentResultsModal({
  open,
  onClose,
  results,
  isLoading = false,
  onExportCSV,
  onExportExcel,
  onCreateCampaign,
  onSaveList,
}: SegmentResultsModalProps) {
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Show protected data access modal if needed
  useEffect(() => {
    if (results?.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      setShowAccessModal(true);
    }
  }, [results?.error]);

  // Show loading state
  if (isLoading || !results) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Generating Segment"
        primaryAction={{
          content: "Close",
          onAction: onClose,
        }}
      >
        <Modal.Section>
          <Box padding="800">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Spinner size="large" />
            </div>
          </Box>
        </Modal.Section>
      </Modal>
    );
  }

  // Prepare table data if customers are available
  const tableRows =
    results.customers?.map((customer) => [
      customer.name,
      customer.email,
      customer.country,
      customer.createdAt,
      customer.numberOfOrders.toString(),
      customer.totalSpent,
    ]) || [];

  const tableHeadings = [
    "Name",
    "Email",
    "Country",
    "Created Date",
    "Orders",
    "Total Spent",
  ];

  // Handle export to CSV
  const handleExportCSVInternal = () => {
    if (!results.customers || results.customers.length === 0) {
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Country",
      "Created Date",
      "Orders",
      "Total Spent",
    ];
    const csvRows = [
      headers.join(","),
      ...results.customers.map((customer) =>
        [
          `"${customer.name.replace(/"/g, '""')}"`,
          `"${customer.email.replace(/"/g, '""')}"`,
          `"${customer.country.replace(/"/g, '""')}"`,
          `"${customer.createdAt}"`,
          customer.numberOfOrders.toString(),
          `"${customer.totalSpent}"`,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customer-segment-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onExportCSV) {
      onExportCSV();
    }
  };

  // Handle protected data access error
  if (results.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
    return (
      <>
        <Modal
          open={open}
          onClose={onClose}
          title="Segment Generation Failed"
          primaryAction={{
            content: "Close",
            onAction: onClose,
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Banner tone="critical">
                <p>
                  Access to customer data is required to generate segments.
                  Please request access in your Partner Dashboard.
                </p>
              </Banner>
            </BlockStack>
          </Modal.Section>
        </Modal>
        <ProtectedDataAccessModal
          open={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          dataType="customer"
          featureName="Filter Audience"
        />
      </>
    );
  }

  // Handle other errors
  if (
    results.error &&
    results.error !== "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED"
  ) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Segment Generation Failed"
        primaryAction={{
          content: "Close",
          onAction: onClose,
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Banner tone="critical">
              <p>
                An error occurred while generating the segment: {results.error}
              </p>
            </Banner>
          </BlockStack>
        </Modal.Section>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="🎉 Segment Created Successfully"
        primaryAction={{
          content: "Close",
          onAction: onClose,
        }}
        secondaryActions={[
          {
            content: "Save List",
            icon: SaveIcon,
            onAction: onSaveList || (() => {}),
            disabled: !results.customers || results.customers.length === 0,
          },
          {
            content: "Export CSV",
            icon: ExportIcon,
            onAction: handleExportCSVInternal,
            disabled: !results.customers || results.customers.length === 0,
          },
          {
            content: "Create Campaign",
            icon: EmailIcon,
            onAction: onCreateCampaign || (() => {}),
            disabled: !results.customers || results.customers.length === 0,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {/* Header with count */}
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Segment Results
              </Text>
              <Badge tone="success">{`${results.matchCount} customers`}</Badge>
            </InlineStack>

            {/* Success/Info Banner */}
            {results.matchCount > 0 ? (
              <Banner tone="success">
                <p>
                  Your audience segment has been created successfully! You can
                  now export the data or create targeted campaigns.
                </p>
              </Banner>
            ) : (
              <Banner tone="info">
                <p>
                  No customers found matching the selected filters. Try
                  adjusting your filter criteria.
                </p>
              </Banner>
            )}

            {/* Applied Filters */}
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Applied Filters:
              </Text>
              <InlineStack gap="200" wrap>
                {Object.entries(results.filters).flatMap(([section, values]) =>
                  (values as string[]).length > 0
                    ? (values as string[]).map((value, index) => (
                        <Tag key={`${section}-${index}`}>{value}</Tag>
                      ))
                    : [],
                )}
              </InlineStack>
            </BlockStack>

            {/* Customer Table */}
            {results.customers && results.customers.length > 0 && (
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  Customers ({results.customers.length}):
                </Text>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "numeric",
                      "text",
                    ]}
                    headings={tableHeadings}
                    rows={tableRows}
                  />
                </div>
              </BlockStack>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
