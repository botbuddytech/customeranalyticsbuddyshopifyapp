/**
 * Saved Lists Mapper
 * 
 * Maps Prisma SavedCustomerList data to the component's SavedList format
 */

import type { SavedCustomerList } from "./saved-lists.server";
import type { SavedList } from "../components/my-saved-lists/types";
import type { FilterData } from "../components/filter-audience/types";

/**
 * Generate description from filter data
 */
function generateDescription(queryData: FilterData): string {
  const parts: string[] = [];

  if (queryData.location && queryData.location.length > 0) {
    parts.push(`Customers from ${queryData.location.slice(0, 2).join(", ")}${queryData.location.length > 2 ? ` and ${queryData.location.length - 2} more` : ""}`);
  }

  if (queryData.products && queryData.products.length > 0) {
    parts.push(`who purchased ${queryData.products.slice(0, 2).join(", ")}`);
  }

  if (queryData.timing && queryData.timing.length > 0) {
    parts.push(`shopping during ${queryData.timing.join(", ")}`);
  }

  if (queryData.device && queryData.device.length > 0) {
    parts.push(`using ${queryData.device.join(", ")}`);
  }

  if (queryData.device && queryData.device.length > 0) {
    parts.push(`using ${queryData.device.join(", ")}`);
  }

  // Handle GraphQL query from AI Search
  if (parts.length === 0 && queryData.graphqlQuery) {
    return "AI-generated customer segment based on natural language search";
  }

  if (parts.length === 0) {
    return "Custom customer segment";
  }

  return parts.join(" ");
}

/**
 * Generate tags from filter data
 */
function generateTags(queryData: FilterData): string[] {
  const tags: string[] = [];

  if (queryData.location && queryData.location.length > 0) {
    tags.push(...queryData.location.slice(0, 2).map(loc => loc.toLowerCase().replace(/\s+/g, "-")));
  }

  if (queryData.products && queryData.products.length > 0) {
    tags.push("products");
  }

  if (queryData.timing && queryData.timing.length > 0) {
    tags.push("timing");
  }

  if (queryData.device && queryData.device.length > 0) {
    tags.push(...queryData.device.map(dev => dev.toLowerCase()));
  }

  if (queryData.graphqlQuery) {
    tags.push("ai-generated");
  }

  return tags.slice(0, 5); // Limit to 5 tags
}

/**
 * Generate criteria string from filter data
 */
function generateCriteria(queryData: FilterData): string {
  const criteria: string[] = [];

  if (queryData.location && queryData.location.length > 0) {
    criteria.push(`Location: ${queryData.location.join(", ")}`);
  }

  if (queryData.products && queryData.products.length > 0) {
    criteria.push(`Products: ${queryData.products.join(", ")}`);
  }

  if (queryData.timing && queryData.timing.length > 0) {
    criteria.push(`Timing: ${queryData.timing.join(", ")}`);
  }

  if (queryData.device && queryData.device.length > 0) {
    criteria.push(`Device: ${queryData.device.join(", ")}`);
  }

  if (queryData.payment && queryData.payment.length > 0) {
    criteria.push(`Payment: ${queryData.payment.join(", ")}`);
  }

  if (queryData.delivery && queryData.delivery.length > 0) {
    criteria.push(`Delivery: ${queryData.delivery.join(", ")}`);
  }

  if (queryData.delivery && queryData.delivery.length > 0) {
    criteria.push(`Delivery: ${queryData.delivery.join(", ")}`);
  }

  // Handle GraphQL query from AI Search
  if (criteria.length === 0 && queryData.graphqlQuery) {
    // Truncate query if too long for display
    const queryDisplay = queryData.graphqlQuery.length > 100
      ? queryData.graphqlQuery.substring(0, 100) + "..."
      : queryData.graphqlQuery;
    return `GraphQL Query: ${queryDisplay}`;
  }

  return criteria.length > 0 ? criteria.join(" | ") : "Custom filters";
}

/**
 * Map Prisma SavedCustomerList to component SavedList format
 */
export function mapToSavedList(
  prismaList: SavedCustomerList
): SavedList {
  const customerCount = prismaList.customerIds?.length || 0;
  const queryData = prismaList.queryData;

  return {
    id: prismaList.id,
    name: prismaList.listName,
    description: generateDescription(queryData),
    customerCount,
    createdAt: prismaList.createdAt.toISOString().split("T")[0],
    lastUpdated: prismaList.updatedAt.toISOString().split("T")[0],
    source: prismaList.source,
    criteria: generateCriteria(queryData),
    tags: generateTags(queryData),
    status: prismaList.status,
  };
}

/**
 * Map multiple Prisma lists to component format
 */
export function mapToSavedLists(
  prismaLists: SavedCustomerList[]
): SavedList[] {
  return prismaLists.map(mapToSavedList);
}

