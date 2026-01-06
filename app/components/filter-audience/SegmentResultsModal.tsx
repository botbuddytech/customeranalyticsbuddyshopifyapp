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
  Popover,
  ActionList,
} from "@shopify/polaris";
import { ExportIcon, EmailIcon, SaveIcon } from "@shopify/polaris-icons";
import { ProtectedDataAccessModal } from "../dashboard/ProtectedDataAccessModal";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { SegmentResults } from "./types";

interface SegmentResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: SegmentResults | null;
  isLoading?: boolean;
  isExporting?: boolean;
  onExportPDF?: () => Promise<void>;
  onExportCSV?: () => Promise<void>;
  onExportExcel?: () => Promise<void>;
  onCreateCampaign?: () => void;
  onSaveList?: () => void;
  onExportStart?: () => void;
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
  isExporting = false,
  onExportPDF,
  onExportCSV,
  onExportExcel,
  onCreateCampaign,
  onSaveList,
  onExportStart,
}: SegmentResultsModalProps) {
  // All hooks must be called before any conditional returns
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);

  const tableHeadings = [
    "Name",
    "Email",
    "Country",
    "Created Date",
    "Orders",
    "Total Spent",
  ];

  // Prepare table data if customers are available
  // Only compute if results and customers exist
  // MUST be called before any early returns
  const tableRows = useMemo(() => {
    try {
      if (!results || !results.customers || !Array.isArray(results.customers) || results.customers.length === 0) {
        return [];
      }
      
      const rows = results.customers.map((customer) => {
        if (!customer || typeof customer !== 'object') {
          return ["", "", "", "", "0", ""];
        }
        return [
          customer.name || "",
          customer.email || "",
          customer.country || "",
          customer.createdAt || "",
          customer.numberOfOrders != null ? String(customer.numberOfOrders) : "0",
          customer.totalSpent || "",
        ];
      });
      
      // Ensure all rows are valid arrays
      return rows.filter(row => Array.isArray(row) && row.length === 6);
    } catch (error) {
      console.error("Error preparing table rows:", error);
      return [];
    }
  }, [results?.customers]);

  // Show protected data access modal if needed
  useEffect(() => {
    if (results?.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      setShowAccessModal(true);
    }
  }, [results?.error]);

  const toggleExportPopover = useCallback(() => {
    setExportPopoverOpen((prev) => !prev);
  }, []);

  const handleExportFormat = useCallback(
    async (format: "pdf" | "csv" | "excel") => {
      if (!results?.customers || results.customers.length === 0) {
        return;
      }

      setExportPopoverOpen(false);
      // Set loading state immediately
      if (onExportStart) {
        onExportStart();
      }
      // Small delay to ensure popover closes and UI updates
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        if (format === "pdf" && onExportPDF) {
          await onExportPDF();
        } else if (format === "csv" && onExportCSV) {
          await onExportCSV();
        } else if (format === "excel" && onExportExcel) {
          await onExportExcel();
        }
      } catch (error) {
        console.error("Export error:", error);
      }
    },
    [results, onExportPDF, onExportCSV, onExportExcel, onExportStart],
  );

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
            content: "Create Campaign",
            icon: EmailIcon,
            onAction: onCreateCampaign || (() => {}),
            disabled: !results.customers || results.customers.length === 0,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {/* Header with count and export button */}
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Segment Results
                </Text>
                <Badge tone="success">{`${results.matchCount} customers`}</Badge>
              </InlineStack>
              <Popover
                active={exportPopoverOpen}
                activator={
                  <Button
                    size="slim"
                    icon={isExporting ? undefined : ExportIcon}
                    loading={isExporting}
                    disabled={
                      !results.customers ||
                      results.customers.length === 0 ||
                      isExporting
                    }
                    onClick={toggleExportPopover}
                  >
                    Export
                  </Button>
                }
                onClose={toggleExportPopover}
              >
                <ActionList
                  items={[
                    {
                      content: "Export as PDF",
                      onAction: () => handleExportFormat("pdf"),
                    },
                    {
                      content: "Export as CSV",
                      onAction: () => handleExportFormat("csv"),
                    },
                    {
                      content: "Export as Excel",
                      onAction: () => handleExportFormat("excel"),
                    },
                  ]}
                />
              </Popover>
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
                {results.filters && typeof results.filters === 'object'
                  ? Object.entries(results.filters).flatMap(([section, values]) => {
                      if (!values || (Array.isArray(values) && values.length === 0)) {
                        return [];
                      }
                      if (Array.isArray(values)) {
                        return values.map((value, index) => (
                          <Tag key={`${section}-${index}`}>{String(value)}</Tag>
                        ));
                      }
                      return [];
                    })
                  : null}
              </InlineStack>
            </BlockStack>

            {/* Customer Table */}
            {results.customers && 
             Array.isArray(results.customers) && 
             results.customers.length > 0 && 
             tableRows && 
             Array.isArray(tableRows) && 
             tableRows.length > 0 && (
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
