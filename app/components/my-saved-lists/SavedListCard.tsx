import {
  Card,
  InlineStack,
  BlockStack,
  Text,
  Badge,
  Button,
  Icon,
  Popover,
  ActionList,
  Spinner,
} from "@shopify/polaris";
import {
  PersonIcon,
  ViewIcon,
  ExportIcon,
  EmailIcon,
  EditIcon,
  CalendarIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import type { SavedList } from "./types";

// Custom spinner icon component for ActionList (matches Polaris icon format)
const SpinnerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    }}
  >
    <style>
      {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
    <circle
      cx="10"
      cy="10"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="11"
      strokeDashoffset="11"
      fill="none"
      opacity="0.25"
    />
    <path
      d="M 10 3 A 7 7 0 0 1 16.5 6.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

interface SavedListCardProps {
  list: SavedList;
  actionPopoverOpen: boolean;
  onTogglePopover: () => void;
  onView: (listId: string) => void;
  onExport: (listId: string, format: string) => void;
  onExportPDF?: (listId: string) => Promise<void>;
  onExportCSV?: (listId: string) => Promise<void>;
  onExportExcel?: (listId: string) => Promise<void>;
  onModify?: (listId: string) => void;
  onArchive: (listId: string) => void;
  onUnarchive: (listId: string) => void;
  onDelete: (listId: string) => void;
  formatDate: (dateString: string) => string;
  getSourceBadge: (source: string) => {
    tone: "info" | "success" | "warning" | "critical";
    text: string;
  };
  isExporting?: boolean;
}

/**
 * Saved List Card Component
 *
 * Displays a single saved customer list with actions
 */
export function SavedListCard({
  list,
  actionPopoverOpen,
  onTogglePopover,
  onView,
  onExport,
  onExportPDF,
  onExportCSV,
  onExportExcel,
  onModify,
  onArchive,
  onUnarchive,
  onDelete,
  formatDate,
  getSourceBadge,
  isExporting = false,
}: SavedListCardProps) {
  const {
    id,
    name,
    description,
    customerCount,
    createdAt,
    source,
    tags,
    status,
  } = list;
  const sourceBadge = getSourceBadge(source);
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  const handleView = useCallback(() => {
    onView(id);
  }, [id, onView]);

  const toggleExportPopover = useCallback(() => {
    setExportPopoverOpen((prev) => !prev);
  }, []);

  const handleExportFormat = useCallback(
    async (format: "pdf" | "csv" | "excel") => {
      setExportPopoverOpen(false);
      // Small delay to ensure popover closes and UI updates
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        if (format === "pdf" && onExportPDF) {
          await onExportPDF(id);
        } else if (format === "csv" && onExportCSV) {
          await onExportCSV(id);
        } else if (format === "excel" && onExportExcel) {
          await onExportExcel(id);
        } else {
          // Fallback to old export method
          onExport(id, format);
        }
      } catch (error) {
        console.error("Export error:", error);
      }
    },
    [id, onExportPDF, onExportCSV, onExportExcel, onExport],
  );

  const handleArchive = useCallback(() => {
    onArchive(id);
  }, [id, onArchive]);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  const handleModify = useCallback(() => {
    if (onModify) {
      setIsModifying(true);
      onModify(id);
      // Note: The loading state will persist until navigation completes
      // This is intentional to show the user that the action is processing
    }
  }, [id, onModify]);

  return (
    <Card>
      <InlineStack align="space-between" blockAlign="start">
        {/* Left: List Info */}
        <BlockStack gap="200" align="start">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="bodyMd" fontWeight="semibold">
              {name}
            </Text>
            <Badge tone={sourceBadge.tone} size="small">
              {sourceBadge.text}
            </Badge>
            {status === "archived" && (
              <Badge tone="attention" size="small">
                Archived
              </Badge>
            )}
          </InlineStack>

          <Text as="p" variant="bodySm" tone="subdued">
            {description}
          </Text>

          {/* Compact Stats Row */}
          <InlineStack gap="300">
            <InlineStack gap="100" blockAlign="center">
              <Icon source={PersonIcon} />
              <Text as="span" variant="bodySm" fontWeight="medium">
                {customerCount.toLocaleString()}
              </Text>
            </InlineStack>

            <Text as="span" variant="bodySm" tone="subdued">
              •
            </Text>

            <Text as="span" variant="bodySm" tone="subdued">
              {formatDate(createdAt)}
            </Text>

            {tags.length > 0 && (
              <>
                <Text as="span" variant="bodySm" tone="subdued">
                  •
                </Text>
                <InlineStack gap="100">
                  {tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} size="small">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 2 && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      +{tags.length - 2} more
                    </Text>
                  )}
                </InlineStack>
              </>
            )}
          </InlineStack>
        </BlockStack>

        {/* Right: Quick Actions */}
        <InlineStack gap="200">
          <Button
            size="slim"
            variant="secondary"
            icon={ViewIcon}
            onClick={handleView}
          >
            View
          </Button>

          <Popover
            active={exportPopoverOpen}
            activator={
              <Button
                size="slim"
                variant="secondary"
                icon={isExporting ? undefined : ExportIcon}
                loading={isExporting}
                disabled={isExporting}
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

          <Button
            size="slim"
            variant="primary"
            icon={EmailIcon}
            url={`/app/campaigns/new?listId=${id}`}
            disabled={true}
          >
            Campaign
          </Button>

          {/* More Actions Menu */}
          <Popover
            active={actionPopoverOpen}
            activator={
              <Button
                size="slim"
                icon={EditIcon}
                onClick={onTogglePopover}
                accessibilityLabel="More actions"
              />
            }
            onClose={onTogglePopover}
          >
            <ActionList
              items={[
                // Only show Modify button for filter-audience lists, not AI-generated lists
                ...(source !== "ai-search"
                  ? [
                      {
                        content: isModifying ? "Loading..." : "Modify",
                        icon: isModifying ? SpinnerIcon : EditIcon,
                        onAction: handleModify,
                        disabled: isModifying,
                      },
                    ]
                  : []),
                {
                  content: status === "active" ? "Archive" : "Unarchive",
                  icon: CalendarIcon,
                  onAction:
                    status === "active" ? handleArchive : () => onUnarchive(id),
                },
                {
                  content: "Delete",
                  icon: DeleteIcon,
                  destructive: true,
                  onAction: handleDelete,
                },
              ]}
            />
          </Popover>
        </InlineStack>
      </InlineStack>
    </Card>
  );
}
