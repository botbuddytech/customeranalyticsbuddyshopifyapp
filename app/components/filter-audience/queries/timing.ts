/**
 * Shopping Timing Query Builder
 * 
 * This file contains the query logic for filtering customers by when they place orders.
 * 
 * Query Structure:
 * - Fetches customers with their orders and order creation times
 * - Filters customers based on order placement timing (morning, afternoon, evening, night, weekdays, weekends, etc.)
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

export interface TimingFilter {
  timings: string[]; // e.g., ["Morning (6am-12pm)", "Weekdays", etc.]
}

/**
 * Build GraphQL query fragment for timing filtering
 * 
 * This returns the fields needed in the customer query to filter by order timing
 * 
 * Note: We limit to 10 orders to keep query cost low.
 */
export function buildTimingQueryFragment(): string {
  return `
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          createdAt
        }
      }
    }
  `;
}

/**
 * Check if a time falls within a specific time range
 */
function isTimeInRange(hour: number, startHour: number, endHour: number): boolean {
  if (startHour <= endHour) {
    // Normal range (e.g., 6am-12pm)
    return hour >= startHour && hour < endHour;
  } else {
    // Wraps around midnight (e.g., 10pm-2am)
    return hour >= startHour || hour < endHour;
  }
}

/**
 * Get time period from hour (morning, afternoon, evening, night)
 * Uses UTC hours since Shopify stores dates in UTC
 */
function getTimePeriod(hour: number): string {
  if (hour >= 6 && hour < 12) {
    return "Morning (6am-12pm)";
  } else if (hour >= 12 && hour < 18) {
    return "Afternoon (12pm-6pm)";
  } else if (hour >= 18 && hour < 24) {
    return "Evening (6pm-12am)";
  } else {
    return "Night (12am-6am)";
  }
}

/**
 * Check if a date is a weekday (Monday-Friday)
 * Uses UTC day since Shopify stores dates in UTC
 * getUTCDay() returns: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 */
function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  // Monday (1) through Friday (5)
  return day >= 1 && day <= 5;
}

/**
 * Check if a date is a weekend (Saturday-Sunday)
 * Uses UTC day since Shopify stores dates in UTC
 * getUTCDay() returns: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 */
function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  // Sunday (0) or Saturday (6)
  return day === 0 || day === 6;
}

/**
 * Check if a date is a holiday
 * Note: This is a simple implementation. You may want to use a holiday library
 * or maintain a list of holidays for more accurate results.
 * Uses UTC month/day since Shopify stores dates in UTC
 */
function isHoliday(date: Date): boolean {
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Common holidays (simplified - you may want to expand this)
  // New Year's Day
  if (month === 0 && day === 1) return true;
  // Christmas
  if (month === 11 && day === 25) return true;
  // Independence Day (US) - adjust for your country
  if (month === 6 && day === 4) return true;
  
  return false;
}

/**
 * Filter customers by shopping timing
 * 
 * This function filters customers based on when they placed their orders
 */
export function filterByTiming(
  customers: any[],
  filter: TimingFilter
): any[] {
  if (!filter.timings || filter.timings.length === 0) {
    return customers; // No filter applied, return all
  }

  return customers.filter((customer: any) => {
    const orders = customer.orders?.edges || [];
    
    // Check if any order matches the selected timing criteria
    for (const orderEdge of orders) {
      const createdAt = orderEdge.node?.createdAt;
      if (!createdAt) continue;

      const orderDate = new Date(createdAt);
      // Use UTC hours since Shopify stores dates in UTC
      const hour = orderDate.getUTCHours();
      const timePeriod = getTimePeriod(hour);

      // Check each selected timing option
      for (const timing of filter.timings) {
        let matches = false;

        // Time of day checks
        if (timing === "Morning (6am-12pm)" && timePeriod === "Morning (6am-12pm)") {
          matches = true;
        } else if (timing === "Afternoon (12pm-6pm)" && timePeriod === "Afternoon (12pm-6pm)") {
          matches = true;
        } else if (timing === "Evening (6pm-12am)" && timePeriod === "Evening (6pm-12am)") {
          matches = true;
        } else if (timing === "Night (12am-6am)" && timePeriod === "Night (12am-6am)") {
          matches = true;
        }
        // Day of week checks
        else if (timing === "Weekdays" && isWeekday(orderDate)) {
          matches = true;
        } else if (timing === "Weekends" && isWeekend(orderDate)) {
          matches = true;
        }
        // Holidays - removed for now, will be implemented separately
        // Sale Events - this would need to be determined by order data or tags
        // For now, we'll skip this or you can implement based on discount codes, tags, etc.
        else if (timing === "Sale Events") {
          // You could check for discount codes, tags, or other indicators
          // For now, we'll skip this check
          continue;
        }

        if (matches) {
          return true; // Customer has at least one order matching the criteria
        }
      }
    }

    return false; // No orders match the timing criteria
  });
}

/**
 * Get customer's most common shopping time
 */
export function getCustomerShoppingTime(customer: any): string {
  const orders = customer.orders?.edges || [];
  const timePeriods: Record<string, number> = {};

  orders.forEach((orderEdge: any) => {
    const createdAt = orderEdge.node?.createdAt;
    if (!createdAt) return;

    const orderDate = new Date(createdAt);
    // Use UTC hours since Shopify stores dates in UTC
    const timePeriod = getTimePeriod(orderDate.getUTCHours());
    timePeriods[timePeriod] = (timePeriods[timePeriod] || 0) + 1;
  });

  // Find the most common time period
  let maxCount = 0;
  let mostCommon = "Unknown";
  for (const [period, count] of Object.entries(timePeriods)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = period;
    }
  }

  return mostCommon;
}

