import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Banner,
  Badge,
  Tag,
  DataTable,
  EmptyState,
} from "@shopify/polaris";
import { ExportIcon, EmailIcon } from "@shopify/polaris-icons";
import { ProtectedDataAccessModal } from "../dashboard/ProtectedDataAccessModal";
import { useState, useEffect } from "react";
import type { SegmentResults, FilterData } from "./types";

interface ResultsSectionProps {
  results: SegmentResults;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onCreateCampaign?: () => void;
}

/**
 * Results Section Component
 * 
 * Displays segment creation results with applied filters
 */
export function ResultsSection({
  results,
  onExportCSV,
  onExportExcel,
  onCreateCampaign,
}: ResultsSectionProps) {
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Show modal when protected data access is denied
  useEffect(() => {
    if (results.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      setShowAccessModal(true);
    }
  }, [results.error]);

  // Handle protected data access error
  if (results.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
    return (
      <>
        <Card>
          <BlockStack gap="400">
            <Banner tone="critical">
              <p>
                Access to customer data is required to generate segments. Please
                request access in your Partner Dashboard.
              </p>
            </Banner>
          </BlockStack>
        </Card>
        <ProtectedDataAccessModal
          open={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          dataType="customer"
          featureName="Filter Audience"
        />
      </>
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

    const headers = ["Name", "Email", "Country", "Created Date", "Orders", "Total Spent"];
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
      `customer-segment-${new Date().toISOString().split("T")[0]}.csv`
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
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            🎉 Segment Created
          </Text>
          <Badge tone="success">{`${results.matchCount} customers`}</Badge>
        </InlineStack>

        {results.matchCount > 0 ? (
          <Banner tone="success">
            <p>
              Your audience segment has been created successfully! You can now
              export the data or create targeted campaigns.
            </p>
          </Banner>
        ) : (
          <Banner tone="info">
            <p>
              No customers found matching the selected filters. Try adjusting
              your filter criteria.
            </p>
          </Banner>
        )}

        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Applied Filters:
          </Text>
          <InlineStack gap="200" wrap>
            {Object.entries(results.filters).flatMap(([section, values]) =>
              (values as string[]).length > 0
                ? (values as string[]).map((value, index) => (
                    <Tag key={`${section}-${index}`}>{value}</Tag>
                  ))
                : []
            )}
          </InlineStack>
        </BlockStack>

        {/* Customer Table */}
        {results.customers && results.customers.length > 0 && (
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Customers ({results.customers.length}):
            </Text>
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
          </BlockStack>
        )}

        <InlineStack gap="200">
          <Button
            icon={ExportIcon}
            onClick={handleExportCSVInternal}
            disabled={!results.customers || results.customers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            icon={ExportIcon}
            onClick={onExportExcel}
            disabled={!results.customers || results.customers.length === 0}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            icon={EmailIcon}
            onClick={onCreateCampaign}
            disabled={!results.customers || results.customers.length === 0}
          >
            Create Campaign
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

