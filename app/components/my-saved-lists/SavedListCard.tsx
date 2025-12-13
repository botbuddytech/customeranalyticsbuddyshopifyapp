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
} from "@shopify/polaris";
import {
  PersonIcon,
  ViewIcon,
  ExportIcon,
  EmailIcon,
  EditIcon,
  PlusIcon,
  CalendarIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";
import { useCallback } from "react";
import type { SavedList } from "./types";

interface SavedListCardProps {
  list: SavedList;
  actionPopoverOpen: boolean;
  onTogglePopover: () => void;
  onView: (listId: string) => void;
  onExport: (listId: string, format: string) => void;
  onArchive: (listId: string) => void;
  onUnarchive: (listId: string) => void;
  onDelete: (listId: string) => void;
  onDuplicate: (listId: string) => void;
  formatDate: (dateString: string) => string;
  getSourceBadge: (source: string) => { tone: "info" | "success" | "warning" | "critical"; text: string };
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
  onArchive,
  onUnarchive,
  onDelete,
  onDuplicate,
  formatDate,
  getSourceBadge,
}: SavedListCardProps) {
  const { id, name, description, customerCount, createdAt, source, tags, status } = list;
  const sourceBadge = getSourceBadge(source);

  const handleView = useCallback(() => {
    onView(id);
  }, [id, onView]);

  const handleExportCSV = useCallback(() => {
    onExport(id, "csv");
  }, [id, onExport]);

  const handleExportExcel = useCallback(() => {
    onExport(id, "excel");
  }, [id, onExport]);

  const handleArchive = useCallback(() => {
    onArchive(id);
  }, [id, onArchive]);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(id);
  }, [id, onDuplicate]);

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
              <Badge tone="attention" size="small">Archived</Badge>
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

          <Button
            size="slim"
            variant="secondary"
            icon={ExportIcon}
            onClick={handleExportCSV}
          >
            Export
          </Button>

          <Button
            size="slim"
            variant="primary"
            icon={EmailIcon}
            url={`/app/campaigns/new?listId=${id}`}
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
                {
                  content: "Export as Excel",
                  icon: ExportIcon,
                  onAction: handleExportExcel,
                },
                {
                  content: "Duplicate List",
                  icon: PlusIcon,
                  onAction: handleDuplicate,
                },
                {
                  content: status === "active" ? "Archive" : "Unarchive",
                  icon: CalendarIcon,
                  onAction: status === "active" ? handleArchive : () => onUnarchive(id),
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

