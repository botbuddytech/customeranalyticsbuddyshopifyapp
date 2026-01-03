/**
 * Customer Created From Query Builder
 * 
 * This file contains the query logic for filtering customers by their creation date.
 * 
 * Query Structure:
 * - Uses the createdAt field that's already included in the base customer query
 * - Filters customers based on creation date (customers created on or after the specified date)
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

export interface CustomerCreatedFromFilter {
  date: string | null; // ISO date string (YYYY-MM-DD)
}

/**
 * Build GraphQL query fragment for customer created from filtering
 * 
 * Note: The createdAt field is already included in the base customer query,
 * so we don't need to add any additional fields here.
 */
export function buildCustomerCreatedFromQueryFragment(): string {
  // No additional fields needed - createdAt is already in base query
  return "";
}

/**
 * Filter customers by creation date
 * 
 * This function filters customers based on when they were created
 * - Returns customers created on or after the specified date
 */
export function filterByCustomerCreatedFrom(
  customers: any[],
  filter: CustomerCreatedFromFilter
): any[] {
  if (!filter.date) {
    return customers; // No filter applied, return all
  }

  const filterDate = new Date(filter.date);
  // Set to start of day for comparison
  filterDate.setHours(0, 0, 0, 0);

  return customers.filter((customer: any) => {
    if (!customer.createdAt) {
      return false; // No creation date, exclude from results
    }

    const customerCreatedAt = new Date(customer.createdAt);
    // Set to start of day for comparison
    customerCreatedAt.setHours(0, 0, 0, 0);

    // Return customers created on or after the filter date
    return customerCreatedAt >= filterDate;
  });
}

