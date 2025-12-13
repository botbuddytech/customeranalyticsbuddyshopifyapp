import {
  Modal,
  BlockStack,
  Text,
  Button,
} from "@shopify/polaris";
import { ExportIcon } from "@shopify/polaris-icons";
import type { SegmentResults } from "./types";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  results: SegmentResults | null;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

/**
 * Export Modal Component
 *
 * Modal for selecting export format (PDF, CSV, Excel)
 */
export function ExportModal({
  open,
  onClose,
  results,
  onExportPDF,
  onExportCSV,
  onExportExcel,
}: ExportModalProps) {
  const hasCustomers = results?.customers && results.customers.length > 0;

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
    onClose();
  };

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
    }
    onClose();
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Segment"
      primaryAction={{
        content: "Close",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Choose a format to export your customer segment. The export will
            include all {results?.matchCount || 0} customers matching your
            filters.
          </Text>

          {!hasCustomers && (
            <Text as="p" variant="bodySm" tone="critical">
              No customer data available to export. Please generate a segment
              first.
            </Text>
          )}

          <BlockStack gap="300">
            <Button
              fullWidth
              variant="secondary"
              icon={ExportIcon}
              disabled={!hasCustomers}
              onClick={handleExportPDF}
            >
              Export as PDF
            </Button>

            <Button
              fullWidth
              variant="secondary"
              icon={ExportIcon}
              disabled={!hasCustomers}
              onClick={handleExportCSV}
            >
              Export as CSV
            </Button>

            <Button
              fullWidth
              variant="secondary"
              icon={ExportIcon}
              disabled={!hasCustomers}
              onClick={handleExportExcel}
            >
              Export as Excel
            </Button>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

