/**
 * My Saved Lists Main Component
 * 
 * Orchestrates all saved lists components and handles state management
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Layout, BlockStack } from "@shopify/polaris";
import { useSubmit, useNavigation, useNavigate } from "react-router";
import { SavedListsHeader } from "./SavedListsHeader";
import { QuickStatsCard } from "./QuickStatsCard";
import { SearchAndFilterCard } from "./SearchAndFilterCard";
import { SavedListCard } from "./SavedListCard";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { EmptyStateCard } from "./EmptyStateCard";
import { ViewListModal } from "./ViewListModal";
import {
  filterLists,
  sortLists,
  getTabs,
  getSourceBadge,
  formatDate,
} from "./utils";
import type { LoaderData, SavedList } from "./types";

interface MySavedListsProps {
  loaderData: LoaderData;
}

/**
 * Main My Saved Lists Component
 */
export function MySavedLists({ loaderData }: MySavedListsProps) {
  const { savedLists, recentActivity } = loaderData;
  const submit = useSubmit();
  const navigation = useNavigation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortValue, setSortValue] = useState("date-desc");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const [actionPopoverOpen, setActionPopoverOpen] = useState<
    Record<string, boolean>
  >({});

  // Loading states
  const isLoading = navigation.state === "submitting";
  const [exportingListId, setExportingListId] = useState<string | null>(null);

  // Event Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Debounce search query
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const toggleActionPopover = useCallback((listId: string) => {
    setActionPopoverOpen((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  }, []);

  const handleDeleteClick = useCallback(
    (listId: string) => {
      setSelectedListId(listId);
      setDeleteModalOpen(true);
      setActionPopoverOpen({});
    },
    []
  );

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

  const handleExport = useCallback(
    (listId: string, format: string) => {
      const formData = new FormData();
      formData.append("actionType", "exportList");
      formData.append("listId", listId);
      formData.append("format", format);

      submit(formData, { method: "post" });
      setActionPopoverOpen({});
    },
    [submit]
  );

  // Export handlers for PDF, CSV, Excel
  const handleExportPDF = useCallback(async (listId: string) => {
    setExportingListId(listId);
    try {
      // Fetch customer data
      const formData = new FormData();
      formData.append("listId", listId);
      const response = await fetch("/api/my-saved-lists/get-customers", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        console.error("Protected customer data access denied");
        return;
      }

      if (!data.customers || data.customers.length === 0) {
        console.error("No customers to export");
        return;
      }

      // Create PDF (HTML format)
      const headers = [
        "Name",
        "Email",
        "Country",
        "Created Date",
        "Orders",
        "Total Spent",
      ];

      let htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer List Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Customer List Export</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Customers: ${data.total}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map((h) => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${data.customers
                  .map(
                    (customer: any) => `
                  <tr>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.country}</td>
                    <td>${customer.createdAt}</td>
                    <td>${customer.numberOfOrders}</td>
                    <td>${customer.totalSpent}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const list = savedLists.find((l) => l.id === listId);
      const listName = list?.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "customer-list";
      link.setAttribute(
        "download",
        `${listName}-${new Date().toISOString().split("T")[0]}.html`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setExportingListId(null);
    }
  }, [savedLists]);

  const handleExportCSV = useCallback(async (listId: string) => {
    setExportingListId(listId);
    try {
      // Fetch customer data
      const formData = new FormData();
      formData.append("listId", listId);
      const response = await fetch("/api/my-saved-lists/get-customers", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        console.error("Protected customer data access denied");
        return;
      }

      if (!data.customers || data.customers.length === 0) {
        console.error("No customers to export");
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
        ...data.customers.map((customer: any) =>
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
      const list = savedLists.find((l) => l.id === listId);
      const listName = list?.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "customer-list";
      link.setAttribute(
        "download",
        `${listName}-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportingListId(null);
    }
  }, [savedLists]);

  const handleExportExcel = useCallback(async (listId: string) => {
    setExportingListId(listId);
    try {
      // Fetch customer data
      const formData = new FormData();
      formData.append("listId", listId);
      const response = await fetch("/api/my-saved-lists/get-customers", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        console.error("Protected customer data access denied");
        return;
      }

      if (!data.customers || data.customers.length === 0) {
        console.error("No customers to export");
        return;
      }

      // Create CSV format (Excel can open CSV files)
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
        ...data.customers.map((customer: any) =>
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
      const blob = new Blob([csvContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const list = savedLists.find((l) => l.id === listId);
      const listName = list?.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "customer-list";
      link.setAttribute(
        "download",
        `${listName}-${new Date().toISOString().split("T")[0]}.xls`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportingListId(null);
    }
  }, [savedLists]);

  const handleArchive = useCallback(
    (listId: string) => {
      const formData = new FormData();
      formData.append("actionType", "archiveList");
      formData.append("listId", listId);

      submit(formData, { method: "post" });
      setActionPopoverOpen({});
    },
    [submit]
  );

  const handleUnarchive = useCallback(
    (listId: string) => {
      const formData = new FormData();
      formData.append("actionType", "unarchiveList");
      formData.append("listId", listId);

      submit(formData, { method: "post" });
      setActionPopoverOpen({});
    },
    [submit]
  );

  const navigate = useNavigate();
  
  const handleModify = useCallback(
    (listId: string) => {
      // Navigate to filter-audience page with listId as URL parameter
      navigate(`/app/filter-audience?modify=${listId}`);
      setActionPopoverOpen({});
    },
    [navigate]
  );

  const handleView = useCallback(
    (listId: string) => {
      const list = savedLists.find((l) => l.id === listId);
      if (list) {
        setSelectedList(list);
        setViewModalOpen(true);
      }
    },
    [savedLists]
  );

  // Data Processing
  const filteredLists = filterLists(savedLists, debouncedSearchQuery, selectedTab);
  const sortedLists = sortLists(filteredLists, sortValue);
  const tabs = getTabs(savedLists);

  return (
    <>
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              {/* Header */}
              <SavedListsHeader />

              {/* Stats & Search Row */}
              <Layout>
                <Layout.Section variant="oneThird">
                  <QuickStatsCard
                    listsCreated={recentActivity.listsCreated}
                    customersExported={recentActivity.customersExported}
                    campaignsSent={recentActivity.campaignsSent}
                  />
                </Layout.Section>

                <Layout.Section>
                  <SearchAndFilterCard
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    selectedTab={selectedTab}
                    onTabChange={handleTabChange}
                    tabs={tabs}
                  />
                </Layout.Section>
              </Layout>

              {/* Lists Grid */}
              {sortedLists.length === 0 ? (
                <EmptyStateCard searchQuery={searchQuery} />
              ) : (
                <BlockStack gap="300">
                  {sortedLists.map((list) => (
                    <SavedListCard
                      key={list.id}
                      list={list}
                      actionPopoverOpen={actionPopoverOpen[list.id] || false}
                      onTogglePopover={() => toggleActionPopover(list.id)}
                      onView={handleView}
                      onExport={handleExport}
                      onExportPDF={handleExportPDF}
                      onExportCSV={handleExportCSV}
                      onExportExcel={handleExportExcel}
                      onModify={handleModify}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onDelete={handleDeleteClick}
                      formatDate={formatDate}
                      getSourceBadge={getSourceBadge}
                      isExporting={exportingListId === list.id}
                    />
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />

      {/* View List Modal */}
      <ViewListModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedList(null);
        }}
        list={selectedList}
      />
    </>
  );
}

