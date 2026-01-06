/**
 * Amount Spent Query Builder
 * 
 * This file contains the query logic for filtering customers by the total amount they've spent.
 * 
 * Query Structure:
 * - Uses the amountSpent field that's already included in the base customer query
 * - Filters customers based on minimum or maximum amount spent
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

export interface AmountSpentFilter {
  amount: number | null;
  operator: "min" | "max" | null; // "min" means minimum (>=), "max" means maximum (<=)
}

/**
 * Build GraphQL query fragment for amount spent filtering
 * 
 * Note: The amountSpent field is already included in the base customer query,
 * so we don't need to add any additional fields here.
 */
export function buildAmountSpentQueryFragment(): string {
  // No additional fields needed - amountSpent is already in base query
  return "";
}

/**
 * Filter customers by amount spent
 * 
 * This function filters customers based on their total amount spent
 * - "min" operator: customers who spent >= the specified amount
 * - "max" operator: customers who spent <= the specified amount
 */
export function filterByAmountSpent(
  customers: any[],
  filter: AmountSpentFilter
): any[] {
  if (!filter.amount || !filter.operator) {
    return customers; // No filter applied, return all
  }

  const filterAmount = filter.amount;

  return customers.filter((customer: any) => {
    const amountSpent = customer.amountSpent;
    
    // If no amount spent data, treat as 0
    const customerAmount = amountSpent && amountSpent.amount 
      ? parseFloat(amountSpent.amount) 
      : 0;

    if (filter.operator === "min") {
      // Minimum: customer must have spent >= filterAmount
      // If customer has no spending data (0), they don't meet minimum requirement
      return customerAmount >= filterAmount;
    } else if (filter.operator === "max") {
      // Maximum: customer must have spent <= filterAmount
      // If customer has no spending data (0), they are included (0 <= max)
      return customerAmount <= filterAmount;
    }

    return false;
  });
}

