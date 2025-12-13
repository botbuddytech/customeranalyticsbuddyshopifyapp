/**
 * Types for My Saved Lists Components
 */

export interface SavedList {
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

export interface LoaderData {
  savedLists: SavedList[];
  totalLists: number;
  recentActivity: {
    listsCreated: number;
    customersExported: number;
    campaignsSent: number;
  };
}

export interface ActionData {
  success: boolean;
  message: string;
  type?: string;
}

