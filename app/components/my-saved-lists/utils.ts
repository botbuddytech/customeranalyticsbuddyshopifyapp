/**
 * Utility Functions for My Saved Lists
 */

import type { SavedList } from "./types";

/**
 * Get source badge properties
 */
export function getSourceBadge(source: string): {
  tone: "info" | "success" | "warning" | "critical";
  text: string;
} {
  switch (source) {
    case "ai-search":
      return { tone: "info", text: "AI Search" };
    case "filter-audience":
      return { tone: "success", text: "Filter Audience" };
    case "manual":
      return { tone: "warning", text: "Manual" };
    default:
      return { tone: "critical", text: "Unknown" };
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Filter lists based on search query and status
 */
export function filterLists(
  lists: SavedList[],
  searchQuery: string,
  selectedTab: number
): SavedList[] {
  return lists.filter((list) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Tab filter
    let matchesTab = true;
    if (selectedTab === 1) {
      // Active only
      matchesTab = list.status === "active";
    } else if (selectedTab === 2) {
      // Archived only
      matchesTab = list.status === "archived";
    }

    return matchesSearch && matchesTab;
  });
}

/**
 * Sort lists based on sort value
 */
export function sortLists(
  lists: SavedList[],
  sortValue: string
): SavedList[] {
  return [...lists].sort((a, b) => {
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
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "date-desc":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}

/**
 * Get tab configuration
 */
export function getTabs(lists: SavedList[]) {
  return [
    {
      id: "all",
      content: `All Lists (${lists.length})`,
    },
    {
      id: "active",
      content: `Active (${lists.filter((l) => l.status === "active").length})`,
    },
    {
      id: "archived",
      content: `Archived (${lists.filter((l) => l.status === "archived").length})`,
    },
  ];
}

/**
 * Sort options configuration
 */
export const sortOptions = [
  { label: "Date created (newest first)", value: "date-desc" },
  { label: "Date created (oldest first)", value: "date-asc" },
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Customer count (high to low)", value: "customers-desc" },
  { label: "Customer count (low to high)", value: "customers-asc" },
];

