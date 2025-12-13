import { Card, BlockStack, Text, Button, Popover, ActionList } from "@shopify/polaris";
import { ExportIcon, EmailIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

interface QuickActionsProps {
  hasResults: boolean;
  isExporting?: boolean;
  onExportPDF?: () => Promise<void>;
  onExportCSV?: () => Promise<void>;
  onExportExcel?: () => Promise<void>;
  onCreateCampaign?: () => void;
  onSaveToList?: () => void;
  onExportStart?: () => void;
}

export function QuickActions({
  hasResults,
  isExporting = false,
  onExportPDF,
  onExportCSV,
  onExportExcel,
  onCreateCampaign,
  onSaveToList,
  onExportStart,
}: QuickActionsProps) {
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);

  const toggleExportPopover = useCallback(() => {
    setExportPopoverOpen((prev) => !prev);
  }, []);

  const handleExportFormat = useCallback(
    async (format: "pdf" | "csv" | "excel") => {
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
    [onExportPDF, onExportCSV, onExportExcel, onExportStart],
  );

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          ⚡ Quick Actions
        </Text>

        <BlockStack gap="200">
          <Popover
            active={exportPopoverOpen}
            activator={
              <Button
                variant="secondary"
                fullWidth
                icon={isExporting ? undefined : ExportIcon}
                loading={isExporting}
                disabled={!hasResults || isExporting}
                onClick={toggleExportPopover}
              >
                Export Segment
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

          <Button
            variant="secondary"
            fullWidth
            icon={EmailIcon}
            disabled={true}
            onClick={onCreateCampaign}
          >
            Create Campaign
          </Button>

          <Button
            variant="secondary"
            fullWidth
            disabled={!hasResults}
            onClick={onSaveToList}
          >
            Save to Lists
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

