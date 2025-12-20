import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Tag,
  DataTable,
  Banner,
  Box,
  Spinner,
} from "@shopify/polaris";
import { ExportIcon } from "@shopify/polaris-icons";
import { useState, useEffect, useCallback } from "react";
import type { SavedList } from "./types";

interface ViewListModalProps {
  open: boolean;
  onClose: () => void;
  list: SavedList | null;
  onExportCSV?: () => void;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
}

/**
 * View List Modal Component
 * 
 * Displays saved list details including filters, criteria, and customer data
 */
export function ViewListModal({
  open,
  onClose,
  list,
  onExportCSV,
}: ViewListModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers function
  const fetchCustomers = useCallback(async () => {
    if (!list) return;

    setIsLoading(true);
    setError(null);
    setCustomers([]); // Clear previous customers

    try {
      const formData = new FormData();
      formData.append("listId", list.id);

      console.log("[ViewListModal] Fetching customers for list:", list.id);

      const response = await fetch("/api/my-saved-lists/get-customers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("[ViewListModal] API Response:", data);

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        setError("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
        setCustomers([]);
      } else if (data.success) {
        // Ensure we have an array of customers
        const fetchedCustomers = Array.isArray(data.customers) ? data.customers : [];
        console.log(`[ViewListModal] Setting ${fetchedCustomers.length} customers`);
        setCustomers(fetchedCustomers);
        setError(null);
      } else {
        console.error("[ViewListModal] API error:", data);
        setError(data.error || "Failed to fetch customers");
        setCustomers([]);
      }
    } catch (err) {
      console.error("[ViewListModal] Error fetching customers:", err);
      setError("Failed to fetch customer details");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [list]);

  // Fetch customers when modal opens
  useEffect(() => {
    if (open && list) {
      // Always fetch customers when modal opens (re-run the query)
      fetchCustomers();
    } else {
      // Reset state when modal closes
      setCustomers([]);
      setError(null);
      setIsLoading(false);
    }
  }, [open, list, fetchCustomers]);

  if (!list) {
    return null;
  }

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

  const sourceBadge = getSourceBadge(list.source);

  // Prepare table data if customers are available
  const tableRows = customers.length > 0
    ? customers.map((customer) => [
        customer.name || "N/A",
        customer.email || "N/A",
        customer.country || "Unknown",
        customer.createdAt || "N/A",
        (customer.numberOfOrders || 0).toString(),
        customer.totalSpent || "0.00",
      ])
    : [];

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
    if (!customers || customers.length === 0) {
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
      ...customers.map((customer) =>
        [
          `"${customer.name.replace(/"/g, '""')}"`,
          `"${customer.email.replace(/"/g, '""')}"`,
          `"${customer.country.replace(/"/g, '""')}"`,
          `"${customer.createdAt}"`,
          customer.numberOfOrders.toString(),
          `"${customer.totalSpent}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${list.name.replace(/[^a-z0-9]/gi, "_")}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onExportCSV) {
      onExportCSV();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={list.name}
      primaryAction={{
        content: "Close",
        onAction: onClose,
      }}
      secondaryActions={[
        {
          content: "Export CSV",
          icon: ExportIcon,
          onAction: handleExportCSVInternal,
          disabled: !customers || customers.length === 0,
        },
      ]}
      size="large"
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* Header with count and source */}
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">
                List Details
              </Text>
              <Badge tone={sourceBadge.tone}>{sourceBadge.text}</Badge>
              {list.status === "archived" && (
                <Badge tone="attention">Archived</Badge>
              )}
            </InlineStack>
            <Badge tone="success">
              {isLoading
                ? "Loading..."
                : `${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
            </Badge>
          </InlineStack>

          {/* Description */}
          <Text as="p" variant="bodyMd">
            {list.description}
          </Text>

          {/* Criteria */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">
              Filter Criteria:
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {list.criteria}
            </Text>
          </BlockStack>

          {/* Tags */}
          {list.tags && list.tags.length > 0 && (
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Tags:
              </Text>
              <InlineStack gap="200" wrap>
                {list.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </InlineStack>
            </BlockStack>
          )}

          {/* Metadata */}
          <InlineStack gap="400">
            <Text as="p" variant="bodySm" tone="subdued">
              Created: {new Date(list.createdAt).toLocaleDateString()}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Last Updated: {new Date(list.lastUpdated).toLocaleDateString()}
            </Text>
          </InlineStack>

          {/* Loading State */}
          {isLoading && (
            <div
              style={{
                padding: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Spinner size="large" />
            </div>
          )}

          {/* Customer Table */}
          {!isLoading && customers && customers.length > 0 && (
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Customers ({customers.length}):
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

          {/* Error Message */}
          {error && error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" && (
            <Banner tone="critical">
              <p>
                Access to customer data is required to view customer details.
                Please request access in your Partner Dashboard.
              </p>
            </Banner>
          )}

          {error && error !== "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" && (
            <Banner tone="critical">
              <p>{error}</p>
            </Banner>
          )}

          {/* No Customers Message */}
          {!isLoading &&
            !error &&
            (!customers || customers.length === 0) && (
              <Banner tone="info">
                <p>
                  No customers found matching the saved filter criteria. The
                  customer data may have changed since this list was created.
                </p>
              </Banner>
            )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

