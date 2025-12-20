import type { AdminGraphQL } from "../../../../services/dashboard.server";

/**
 * Total Customers Query Logic - OPTIMIZED VERSION
 * 
 * Optimizations:
 * 1. Batch all queries using Promise.all for parallel execution
 * 2. Consolidated error handling to reduce code duplication
 * 3. Single data structure for all results
 * 
 * Note: Total customers count is always the current total, but we query historical
 * counts by filtering customers created up to specific dates to approximate
 * what the total was at that point in time.
 */
export async function getTotalCustomersQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Handle different date range values
  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case '7days':
    case 'last7Days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30days':
    case 'last30Days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '90days':
    case 'last90Days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  const dates = dateRange === "today" ? [endDate] : [startDate, endDate];

  /**
   * Helper function to query customer count with error handling
   */
  async function getCustomerCount(query: string): Promise<number> {
    try {
      const response = await admin.graphql(query);
      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        const accessError = json.errors.find((error: any) =>
          error.message?.includes("not approved") ||
          error.message?.includes("protected customer data") ||
          error.message?.includes("Customer")
        );
        if (accessError) {
          throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
        }
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      return json.data?.customersCount?.count || 0;
    } catch (error: any) {
      if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
        error.message?.includes("not approved") ||
        error.message?.includes("protected customer data")) {
        throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
      }
      throw error;
    }
  }

  try {
    /**
     * OPTIMIZATION: Execute all queries in parallel using Promise.all
     * This reduces total execution time from sequential to concurrent
     */

    // Build all queries
    const historicalQueries = dates.map(date => {
      const dateEndISO = date.toISOString();
      return getCustomerCount(`
        query {
          customersCount(query: "created_at:<='${dateEndISO}'") {
            count
          }
        }
      `);
    });

    // Add the final count query (current total)
    const finalCountQuery = getCustomerCount(`
      query {
        customersCount {
          count
        }
      }
    `);

    // Execute all queries in parallel
    const [finalTotalCustomers, ...historicalCounts] = await Promise.all([
      finalCountQuery,
      ...historicalQueries
    ]);

    // Build data points from results
    const dataPoints = dates.map((date, index) => ({
      date: date.toISOString().split('T')[0],
      count: historicalCounts[index],
    }));

    return {
      count: finalTotalCustomers,
      dataPoints: dataPoints,
    };
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected customer data")) {
      throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
    }
    throw error;
  }
}