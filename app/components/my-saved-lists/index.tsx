/**
 * My Saved Lists Main Component
 * 
 * Orchestrates all saved lists components and handles state management
 */

import React, { useState, useCallback } from "react";
import { Layout, BlockStack } from "@shopify/polaris";
import { useSubmit, useNavigation } from "react-router";
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortValue, setSortValue] = useState("date-desc");

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

  // Event Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

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

  const handleDuplicate = useCallback(
    (listId: string) => {
      const formData = new FormData();
      formData.append("actionType", "duplicateList");
      formData.append("listId", listId);
      submit(formData, { method: "post" });
      setActionPopoverOpen({});
    },
    [submit]
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
  const filteredLists = filterLists(savedLists, searchQuery, selectedTab);
  const sortedLists = sortLists(filteredLists, sortValue);
  const tabs = getTabs(savedLists);

  return (
    <>
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
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                    formatDate={formatDate}
                    getSourceBadge={getSourceBadge}
                  />
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>

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

