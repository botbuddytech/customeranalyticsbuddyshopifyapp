import type { AdminGraphQL } from "../../../../services/dashboard.server";
import { calculateDateRange } from "../../../../services/dashboard.server";

/**
 * Total Customers Query Logic
 * 
 * Contains the GraphQL query and data processing logic for Total Customers card.
 * Returns both the final count and data points for graphing.
 * 
 * Note: Total customers count is always the current total, but we query historical
 * counts by filtering customers created up to specific dates to approximate
 * what the total was at that point in time.
 */
export async function getTotalCustomersQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const dataPoints: Array<{ date: string; count: number }> = [];

  // Calculate start date and end date based on dateRange
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

  // For "today", only use 1 date point (today)
  // For other ranges, use 2 points (start date and end date)
  const dates = dateRange === "today" 
    ? [endDate] 
    : [startDate, endDate];

  // Fetch data for each date point
  // We approximate historical total by counting customers created up to that date
  for (const date of dates) {
    const dateEndISO = date.toISOString();
    
    try {
      // Query customers created up to this date to approximate total at that time
      const response = await admin.graphql(`
        query {
          customersCount(query: "created_at:<='${dateEndISO}'") {
            count
          }
        }
      `);

      const json = await response.json();
      
      // Check for access denied errors
      if (json.errors && json.errors.length > 0) {
        const accessError = json.errors.find((error: any) => 
          error.message?.includes("not approved") || 
          error.message?.includes("protected customer data") ||
          error.message?.includes("Customer")
        );
        if (accessError) {
          throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
        }
      }

      const totalCustomers = json.data?.customersCount?.count || 0;

      // Format date for the data point
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      dataPoints.push({
        date: dateString,
        count: totalCustomers,
      });
    } catch (error: any) {
      // Check if it's an access denied error
      if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" || 
          error.message?.includes("not approved") ||
          error.message?.includes("protected customer data")) {
        throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Get the final count (current total customers)
  let finalTotalCustomers = 0;
  try {
    const finalResponse = await admin.graphql(`
      query {
        customersCount {
          count
        }
      }
    `);

    const finalJson = await finalResponse.json();
    
    // Check for access denied errors in final query
    if (finalJson.errors && finalJson.errors.length > 0) {
      const accessError = finalJson.errors.find((error: any) => 
        error.message?.includes("not approved") || 
        error.message?.includes("protected customer data") ||
        error.message?.includes("Customer")
      );
      if (accessError) {
        throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
      }
    }
    
    finalTotalCustomers = finalJson.data?.customersCount?.count || 0;
  } catch (error: any) {
    // Check if it's an access denied error
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" || 
        error.message?.includes("not approved") ||
        error.message?.includes("protected customer data")) {
      throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
    }
    // Re-throw other errors
    throw error;
  }

  return {
    count: finalTotalCustomers,
    dataPoints: dataPoints,
  };
}

