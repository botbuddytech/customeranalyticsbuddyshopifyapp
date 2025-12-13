/**
 * Geographic Location Query Builder
 * 
 * This file contains the query logic for filtering customers by geographic location (countries).
 * 
 * Query Structure:
 * - Fetches customers with their defaultAddress.country
 * - Filters customers whose country matches the selected countries
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

import type { AdminGraphQL } from "../../../services/dashboard.server";

export interface GeographicLocationFilter {
  countries: string[];
}

/**
 * Normalize country names and expand regions to actual countries
 */
export function normalizeCountries(countries: string[]): string[] {
  if (!countries || countries.length === 0) {
    return [];
  }

  const regionMap: Record<string, string[]> = {
    "North America": ["United States", "Canada", "Mexico"],
    "Europe": [
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Netherlands",
      "Belgium",
      "Switzerland",
      "Austria",
      "Sweden",
      "Norway",
      "Denmark",
      "Finland",
      "Poland",
      "Portugal",
      "Greece",
      "Ireland",
    ],
    "Asia": [
      "India",
      "Japan",
      "China",
      "South Korea",
      "Singapore",
      "Thailand",
      "Malaysia",
      "Indonesia",
      "Philippines",
      "Vietnam",
    ],
    "South America": [
      "Brazil",
      "Argentina",
      "Chile",
      "Colombia",
      "Peru",
      "Venezuela",
    ],
  };

  const normalizedCountries = countries.map((country) => {
    if (regionMap[country]) {
      return regionMap[country];
    }
    return [country];
  });

  // Flatten the array of country arrays
  return normalizedCountries.flat();
}

/**
 * Build GraphQL query fragment for geographic location filtering
 * 
 * This returns the fields needed in the customer query to filter by location
 */
export function buildGeographicLocationQueryFragment(): string {
  return `
    defaultAddress {
      country
      countryCodeV2
    }
  `;
}

/**
 * Filter customers by geographic location
 * 
 * This function filters the already-fetched customers based on their country
 */
export function filterByGeographicLocation(
  customers: any[],
  filter: GeographicLocationFilter
): any[] {
  if (!filter.countries || filter.countries.length === 0) {
    return customers; // No filter applied, return all
  }

  const targetCountries = normalizeCountries(filter.countries);

  return customers.filter((customer: any) => {
    const defaultCountry = customer.defaultAddress?.country;
    return defaultCountry && targetCountries.includes(defaultCountry);
  });
}

/**
 * Get customer country for display
 */
export function getCustomerCountry(customer: any): string {
  return customer.defaultAddress?.country || "Unknown";
}

