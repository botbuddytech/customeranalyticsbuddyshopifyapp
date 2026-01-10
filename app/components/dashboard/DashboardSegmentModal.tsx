import {
  Modal,
  BlockStack,
  Text,
  DataTable,
  Spinner,
  ActionList,
  Card,
} from "@shopify/polaris";
import { ExportIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
}: DashboardSegmentModalProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportMenuPosition, setExportMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const exportButtonRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const hasCustomers = data?.customers && data.customers.length > 0;
  const hasError = data?.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED";
  const hasAnyExportHandler = !!(onExportCSV || onExportPDF || onExportExcel);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  // Show protected data access modal if needed
  if (hasError && open) {
    if (!showAccessModal) {
      setShowAccessModal(true);
    }
  }

  // ============================================================================
  // TABLE DATA PREPARATION
  // ============================================================================
  const tableHeadings = [
    "Name",
    "Email",
    "Created Date",
    "Orders",
    "Total Spent",
  ];

  const tableRows =
    data?.customers?.map((customer: DashboardCustomer) => [
      customer.name,
      customer.email,
      customer.createdAt,
      customer.numberOfOrders.toString(),
      customer.totalSpent,
    ]) || [];

  // ============================================================================
  // EXPORT HANDLERS
  // ============================================================================
  const toggleExportMenu = useCallback(() => {
    if (!exportMenuOpen) {
      // Find export button and position menu
      const findExportButton = () => {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const buttons = modal.querySelectorAll("button");
          const exportButton = Array.from(buttons).find((btn) => {
            const text = btn.textContent?.trim() || "";
            return text.includes("Export");
          });

          if (exportButton) {
            const rect = exportButton.getBoundingClientRect();
            const menuHeight = 150; // Approximate height of menu with 3 items
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Position above if not enough space below, otherwise below
            const positionAbove =
              spaceBelow < menuHeight && spaceAbove > menuHeight;

            setExportMenuPosition({
              top: positionAbove
                ? rect.top - menuHeight - 8 // 8px above button
                : rect.bottom + 8, // 8px below button
              left: Math.max(8, rect.right - 180), // Align to right, min 8px from left edge, 180px wide menu
            });
            setExportMenuOpen(true);
          }
        }
      };

      // Small delay to ensure modal is rendered
      setTimeout(findExportButton, 50);
    } else {
      setExportMenuOpen(false);
      setExportMenuPosition(null);
    }
  }, [exportMenuOpen]);

  const handleExportFormat = useCallback(
    async (format: "pdf" | "csv" | "excel") => {
      if (!hasCustomers) {
        return;
      }

      setExportMenuOpen(false);
      setExportMenuPosition(null);

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
    [hasCustomers, onExportPDF, onExportCSV, onExportExcel],
  );

  // Close export menu when clicking outside
  useEffect(() => {
    if (!exportMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        exportButtonRef.current &&
        !exportButtonRef.current.contains(target) &&
        !target
          .closest('[role="dialog"]')
          ?.querySelector("button")
          ?.textContent?.includes("Export")
      ) {
        setExportMenuOpen(false);
        setExportMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuOpen]);

  // ============================================================================
  // EXPORT MENU ACTIONS
  // ============================================================================
  // Always show all three options, but disable ones without handlers
  const exportMenuItems = [
    {
      content: "Export as CSV",
      onAction: () => handleExportFormat("csv"),
      disabled: !hasCustomers || isLoading || !onExportCSV,
    },
    {
      content: "Export as PDF",
      onAction: () => handleExportFormat("pdf"),
      disabled: !hasCustomers || isLoading || !onExportPDF,
    },
    {
      content: "Export as Excel",
      onAction: () => handleExportFormat("excel"),
      disabled: !hasCustomers || isLoading || !onExportExcel,
    },
  ];

  // ============================================================================
  // SECONDARY ACTIONS (Export button beside Close button)
  // ============================================================================
  const secondaryActions = hasAnyExportHandler
    ? [
        {
          content: "Export",
          icon: ExportIcon,
          onAction: toggleExportMenu,
          disabled: !hasCustomers || isLoading,
        },
      ]
    : [];

  // ============================================================================
  // RENDER
  // ============================================================================
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
            {/* Loading State */}
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner size="large" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Loading customers...
                </Text>
              </div>
            ) : hasError ? (
              /* Error State */
              <Text as="p" variant="bodyMd" tone="critical">
                Access to customer data is required to view this list. Please
                request access in your Partner Dashboard.
              </Text>
            ) : hasCustomers ? (
              /* Customers List */
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
              /* Empty State */
              <Text as="p" variant="bodyMd">
                No customers found
                {dateRangeLabel ? ` for ${dateRangeLabel}` : ""}.
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Export Menu - Simple dropdown positioned near Export button */}
      {hasAnyExportHandler &&
        open &&
        exportMenuOpen &&
        exportMenuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={exportButtonRef}
            style={{
              position: "fixed",
              top: `${Math.max(8, Math.min(exportMenuPosition.top, window.innerHeight - 200))}px`, // Ensure it's always visible (min 8px from top, max 200px from bottom)
              left: `${exportMenuPosition.left}px`,
              zIndex: 10000,
              minWidth: "180px",
              maxHeight: "200px",
              overflow: "auto",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              borderRadius: "8px",
              backgroundColor: "white",
              border: "1px solid #e1e3e5",
            }}
          >
            <Card>
              <ActionList items={exportMenuItems} />
            </Card>
          </div>,
          document.body,
        )}

      {/* Protected Data Access Modal */}
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
