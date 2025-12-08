/**
 * My Saved Lists Page for AI Audience Insight Shopify App
 *
 * This page displays and manages saved customer segments created from:
 * - AI Search Analyzer queries
 * - Filter Audience configurations
 * - Manual customer selections
 *
 * Features:
 * - View all saved customer lists/segments
 * - Search and filter saved lists
 * - Export customer data (CSV, Excel)
 * - Delete or archive old lists
 * - View detailed customer information
 * - Create campaigns from saved lists
 */

import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import {
  Page,
  Layout,
  Card,
  DataTable,
  TextField,
  Button,
  Modal,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
  EmptyState,
  Filters,
  Tabs,
  ResourceList,
  ResourceItem,
  Avatar,
  Thumbnail,
  Popover,
  ActionList,
  Toast,
  Frame,
  Divider,
  Banner,
  Pagination,
} from "@shopify/polaris";
import {
  SearchIcon,
  ExportIcon,
  DeleteIcon,
  EditIcon,
  ViewIcon,
  PlusIcon,
  FilterIcon,
  PersonIcon,
  CalendarIcon,
  EmailIcon,
  ChatIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// ==========================================
// Types and Interfaces
// ==========================================

interface SavedList {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  createdAt: string;
  lastUpdated: string;
  source: "ai-search" | "filter-audience" | "manual";
  criteria: string;
  tags: string[];
  status: "active" | "archived";
}

interface LoaderData {
  savedLists: SavedList[];
  totalLists: number;
  recentActivity: {
    listsCreated: number;
    customersExported: number;
    campaignsSent: number;
  };
}

interface ActionData {
  success: boolean;
  message: string;
  type?: string;
}

// ==========================================
// Server-side Functions
// ==========================================

/**
 * Loader Function - Fetch Saved Customer Lists
 *
 * Retrieves all saved customer segments from the database.
 * In a real app, this would query your saved_lists table.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock saved lists data - replace with actual database query
  const mockSavedLists: SavedList[] = [
    {
      id: "list-001",
      name: "High-Value Customers",
      description: "Customers who have spent over $1000",
      customerCount: 245,
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-20",
      source: "ai-search",
      criteria: "Total spent > $1000",
      tags: ["high-value", "vip"],
      status: "active"
    },
    {
      id: "list-002",
      name: "Inactive Customers (90+ days)",
      description: "Customers who haven't ordered in the last 90 days",
      customerCount: 156,
      createdAt: "2024-01-10",
      lastUpdated: "2024-01-18",
      source: "ai-search",
      criteria: "Last purchase > 90 days ago",
      tags: ["inactive", "re-engagement"],
      status: "active"
    },
    {
      id: "list-003",
      name: "Mobile Shoppers - Premium Products",
      description: "Mobile users who buy premium category items",
      customerCount: 89,
      createdAt: "2024-01-08",
      lastUpdated: "2024-01-16",
      source: "filter-audience",
      criteria: "Device: Mobile + Category: Premium",
      tags: ["mobile", "premium"],
      status: "active"
    },
    {
      id: "list-004",
      name: "Weekend Shoppers",
      description: "Customers who primarily shop on weekends",
      customerCount: 312,
      createdAt: "2024-01-05",
      lastUpdated: "2024-01-14",
      source: "filter-audience",
      criteria: "Purchase timing: Saturday-Sunday",
      tags: ["weekend", "timing"],
      status: "active"
    },
    {
      id: "list-005",
      name: "Cart Abandoners - Last 30 Days",
      description: "Customers who abandoned carts recently",
      customerCount: 78,
      createdAt: "2024-01-03",
      lastUpdated: "2024-01-12",
      source: "ai-search",
      criteria: "Abandoned cart in last 30 days",
      tags: ["cart-abandonment", "recent"],
      status: "archived"
    }
  ];

  return {
    savedLists: mockSavedLists,
    totalLists: mockSavedLists.length,
    recentActivity: {
      listsCreated: 12,
      customersExported: 1847,
      campaignsSent: 8
    }
  };
};

/**
 * Action Function - Handle List Operations
 *
 * Handles CRUD operations for saved customer lists.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();

  // Coerce form values to strings
  const actionType = String(formData.get("actionType") || "");
  const listId = String(formData.get("listId") || "");

  // Validate actionType is present
  if (!actionType) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Action type is required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Validate actionType is one of the allowed actions
  const allowedActions = ["deleteList", "archiveList", "exportList", "duplicateList"];
  if (!allowedActions.includes(actionType)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Invalid action type. Must be one of: ${allowedActions.join(", ")}`
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Validate listId is present
  if (!listId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "List ID is required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    switch (actionType) {
      case "deleteList":
        // In a real app, delete from database
        console.log("Deleting list:", listId);

        return {
          success: true,
          message: "Customer list deleted successfully",
          type: "delete"
        };

      case "archiveList":
        // In a real app, update status in database
        console.log("Archiving list:", listId);

        return {
          success: true,
          message: "Customer list archived successfully",
          type: "archive"
        };

      case "exportList":
        const format = String(formData.get("format") || "");

        // Validate format is present
        if (!format) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Export format is required"
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        // Validate format is a supported value
        const supportedFormats = ["csv", "json", "excel"];
        if (!supportedFormats.includes(format)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: `Invalid export format. Must be one of: ${supportedFormats.join(", ")}`
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        // In a real app, generate and download file
        console.log("Exporting list:", listId, "as", format);

        return {
          success: true,
          message: `Customer list exported as ${format}`,
          type: "export"
        };

      case "duplicateList":
        // In a real app, create copy in database
        console.log("Duplicating list:", listId);

        return {
          success: true,
          message: "Customer list duplicated successfully",
          type: "duplicate"
        };

      default:
        // This should never be reached due to validation above
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid action type"
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while processing your request"
    };
  }
};

// ==========================================
// Main Component
// ==========================================

/**
 * My Saved Lists Page Component
 *
 * Displays and manages all saved customer segments with comprehensive
 * filtering, searching, and action capabilities.
 */
export default function MySavedListsPage() {
  // ==========================================
  // Hooks and State Management
  // ==========================================

  const { savedLists, totalLists, recentActivity } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortValue, setSortValue] = useState("date-desc");

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [actionPopoverOpen, setActionPopoverOpen] = useState<Record<string, boolean>>({});

  // Toast state
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Loading states
  const isLoading = navigation.state === "submitting";

  // ==========================================
  // Event Handlers
  // ==========================================

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle tab changes (All, Active, Archived)
  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  // Handle action popover toggle
  const toggleActionPopover = useCallback((listId: string) => {
    setActionPopoverOpen(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = useCallback((listId: string) => {
    setSelectedListId(listId);
    setDeleteModalOpen(true);
    setActionPopoverOpen({});
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (selectedListId) {
      const formData = new FormData();
      formData.append("actionType", "deleteList");
      formData.append("listId", selectedListId);

      submit(formData, { method: "post" });
      setDeleteModalOpen(false);
      setSelectedListId(null);
    }
  }, [submit, selectedListId]);

  // Handle export action
  const handleExport = useCallback((listId: string, format: string) => {
    const formData = new FormData();
    formData.append("actionType", "exportList");
    formData.append("listId", listId);
    formData.append("format", format);

    submit(formData, { method: "post" });
    setActionPopoverOpen({});
  }, [submit]);

  // Handle archive action
  const handleArchive = useCallback((listId: string) => {
    const formData = new FormData();
    formData.append("actionType", "archiveList");
    formData.append("listId", listId);

    submit(formData, { method: "post" });
    setActionPopoverOpen({});
  }, [submit]);

  // Show toast messages based on action results
  const showToast = useCallback((message: string, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  }, []);

  // Handle action data changes (success/error responses)
  useState(() => {
    if (actionData) {
      showToast(actionData.message, !actionData.success);
    }
  });

  // ==========================================
  // Data Processing and Filtering
  // ==========================================

  // Filter lists based on search query and selected tab
  const filteredLists = savedLists.filter(list => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Tab filter
    let matchesTab = true;
    if (selectedTab === 1) { // Active only
      matchesTab = list.status === "active";
    } else if (selectedTab === 2) { // Archived only
      matchesTab = list.status === "archived";
    }

    return matchesSearch && matchesTab;
  });

  // Sort filtered lists
  const sortedLists = [...filteredLists].sort((a, b) => {
    switch (sortValue) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "customers-asc":
        return a.customerCount - b.customerCount;
      case "customers-desc":
        return b.customerCount - a.customerCount;
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "date-desc":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // ==========================================
  // Helper Functions
  // ==========================================

  // Get source badge properties
  const getSourceBadge = (source: string) => {
    switch (source) {
      case "ai-search":
        return { tone: "info" as const, text: "AI Search" };
      case "filter-audience":
        return { tone: "success" as const, text: "Filter Audience" };
      case "manual":
        return { tone: "warning" as const, text: "Manual" };
      default:
        return { tone: "critical" as const, text: "Unknown" };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // ==========================================
  // Tab Configuration
  // ==========================================

  const tabs = [
    {
      id: "all",
      content: `All Lists (${savedLists.length})`,
    },
    {
      id: "active",
      content: `Active (${savedLists.filter(l => l.status === "active").length})`,
    },
    {
      id: "archived",
      content: `Archived (${savedLists.filter(l => l.status === "archived").length})`,
    },
  ];

  // Sort options
  const sortOptions = [
    { label: "Date created (newest first)", value: "date-desc" },
    { label: "Date created (oldest first)", value: "date-asc" },
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Customer count (high to low)", value: "customers-desc" },
    { label: "Customer count (low to high)", value: "customers-asc" },
  ];

  // ==========================================
  // Component Render
  // ==========================================

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="My Saved Lists" />

        {/* Toast for success/error messages */}
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <Layout>
          <Layout.Section>
            <BlockStack gap="500">

              {/* ==========================================
                   Compact Header with Inline Stats
                   ========================================== */}

              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h1" variant="headingLg">
                    📋 My Saved Customer Lists
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Manage and export your customer segments
                  </Text>
                </BlockStack>
                <Button
                  variant="primary"
                  icon={PlusIcon}
                  url="/app/ai-search-analyzer"
                >
                  Create New List
                </Button>
              </InlineStack>

              {/* ==========================================
                   Compact Stats & Controls Row
                   ========================================== */}

              <Layout>
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h3" variant="headingMd">
                        📊 Quick Stats
                      </Text>
                      <InlineStack gap="400">
                        <BlockStack gap="050" align="center">
                          <Text as="p" variant="headingMd" fontWeight="bold">
                            {recentActivity.listsCreated}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Lists
                          </Text>
                        </BlockStack>

                        <BlockStack gap="050" align="center">
                          <Text as="p" variant="headingMd" fontWeight="bold">
                            {recentActivity.customersExported.toLocaleString()}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Exported
                          </Text>
                        </BlockStack>

                        <BlockStack gap="050" align="center">
                          <Text as="p" variant="headingMd" fontWeight="bold">
                            {recentActivity.campaignsSent}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Campaigns
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Layout.Section>

                <Layout.Section>
                  <Card>
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          🔍 Search & Filter
                        </Text>
                        <InlineStack gap="200">
                          <Button
                            size="slim"
                            icon={FilterIcon}
                            onClick={() => {/* Open advanced filters */}}
                          >
                            Filters
                          </Button>

                          <Button
                            size="slim"
                            icon={ExportIcon}
                            onClick={() => {/* Export all lists */}}
                          >
                            Export All
                          </Button>
                        </InlineStack>
                      </InlineStack>

                      <InlineStack gap="300" align="space-between">
                        <div style={{ flexGrow: 1, maxWidth: "350px" }}>
                          <TextField
                            label=""
                            labelHidden
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search lists..."
                            prefix={<Icon source={SearchIcon} />}
                            clearButton
                            onClearButtonClick={() => setSearchQuery("")}
                            autoComplete="off"
                          />
                        </div>

                        <Tabs
                          tabs={tabs}
                          selected={selectedTab}
                          onSelect={handleTabChange}
                          fitted
                        />
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>

              {/* ==========================================
                   Compact Lists Grid
                   ========================================== */}

              {sortedLists.length === 0 ? (
                /* Compact Empty State */
                <Card>
                  <EmptyState
                    heading="No saved lists found"
                    action={{
                      content: "Create your first list",
                      url: "/app/ai-search-analyzer"
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>
                      {searchQuery
                        ? `No lists match "${searchQuery}". Try different search terms.`
                        : "Create customer segments using AI Search or Filter Audience tools."
                      }
                    </p>
                  </EmptyState>
                </Card>
              ) : (
                /* Compact Grid Layout */
                <BlockStack gap="300">
                  {sortedLists.map((list) => {
                    const { id, name, description, customerCount, createdAt, source, tags, status } = list;
                    const sourceBadge = getSourceBadge(source);

                    return (
                      <Card key={id}>
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
                              url={`/app/my-saved-lists/${id}`}
                            >
                              View
                            </Button>

                            <Button
                              size="slim"
                              variant="secondary"
                              icon={ExportIcon}
                              onClick={() => handleExport(id, "csv")}
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
                              active={actionPopoverOpen[id] || false}
                              activator={
                                <Button
                                  size="slim"
                                  icon={EditIcon}
                                  onClick={() => toggleActionPopover(id)}
                                  accessibilityLabel="More actions"
                                />
                              }
                              onClose={() => toggleActionPopover(id)}
                            >
                              <ActionList
                                items={[
                                  {
                                    content: "Export as Excel",
                                    icon: ExportIcon,
                                    onAction: () => handleExport(id, "excel"),
                                  },
                                  {
                                    content: "Duplicate List",
                                    icon: PlusIcon,
                                    onAction: () => {
                                      const formData = new FormData();
                                      formData.append("actionType", "duplicateList");
                                      formData.append("listId", id);
                                      submit(formData, { method: "post" });
                                      setActionPopoverOpen({});
                                    },
                                  },
                                  {
                                    content: status === "active" ? "Archive" : "Unarchive",
                                    icon: CalendarIcon,
                                    onAction: () => handleArchive(id),
                                  },
                                  {
                                    content: "Delete",
                                    icon: DeleteIcon,
                                    destructive: true,
                                    onAction: () => handleDeleteClick(id),
                                  },
                                ]}
                              />
                            </Popover>
                          </InlineStack>
                        </InlineStack>
                      </Card>
                    );
                  })}
                </BlockStack>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* ==========================================
             Delete Confirmation Modal
             ========================================== */}

        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Customer List"
          primaryAction={{
            content: "Delete",
            destructive: true,
            onAction: handleDeleteConfirm,
            loading: isLoading,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setDeleteModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <Text as="p">
              Are you sure you want to delete this customer list? This action cannot be undone.
            </Text>
          </Modal.Section>
        </Modal>

      </Page>
    </Frame>
  );
}
