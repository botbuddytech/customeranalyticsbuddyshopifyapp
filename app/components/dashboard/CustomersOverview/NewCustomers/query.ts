import type { AdminGraphQL } from "../../../../services/dashboard.server";
import { calculateDateRange } from "../../../../services/dashboard.server";

/**
 * New Customers Query Logic (count-only version)
 *
 * Uses the customersCount GraphQL query to get:
 * - total new customers in a date range
 * - data points for charting (today = 1 point, others = 2 points: start & end)
 *
 * NOTE:
 * - Still requires `read_customers` scope.
 * - If your app isn't approved for protected customer data on "Customers",
 *   Shopify will return an error and you'll see PROTECTED_CUSTOMER_DATA_ACCESS_DENIED.
 */
export async function getNewCustomersQuery(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const dataPoints: Array<{ date: string; count: number }> = [];

  const now = new Date();
  let startDate: Date;
  let endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  switch (dateRange) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case "yesterday":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case "7days":
    case "last7Days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30days":
    case "last30Days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "90days":
    case "last90Days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
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

  // 1) Build dataPoints (for chart)
  // We query cumulative new customers created up to each date point
  // This shows the growth in new customers over the period
  for (const date of dates) {
    const dateEndISO = date.toISOString();
    
    try {
      // Query cumulative new customers created up to this date
      // This gives us the total new customers up to that point in time
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
        throw new Error(json.errors[0].message || "Unknown GraphQL error");
      }

      const cumulativeNewCustomers = json.data?.customersCount?.count || 0;

      // Format date for the data point
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      dataPoints.push({
        date: dateString,
        count: cumulativeNewCustomers,
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

  // 2) Final total count for whole dateRange
  const finalStartDateISO = startDate.toISOString();
  const finalEndDateISO = endDate.toISOString();

  let finalNewCustomers = 0;
  try {
    const finalQuery = `
      query NewCustomersCountRange {
        customersCount(
          query: "created_at:>=${finalStartDateISO} created_at:<=${finalEndDateISO}"
        ) {
          count
        }
      }
    `;

    const finalResponse = await admin.graphql(finalQuery);
    const finalJson = await finalResponse.json();

    if (finalJson.errors && finalJson.errors.length > 0) {
      const accessError = finalJson.errors.find((error: any) =>
        error.message?.includes("not approved") ||
        error.message?.includes("protected customer data") ||
        error.message?.includes("Customer")
      );
      if (accessError) {
        throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
      }
      throw new Error(finalJson.errors[0].message || "Unknown GraphQL error");
    }

    finalNewCustomers = finalJson.data?.customersCount?.count ?? 0;
  } catch (error: any) {
    if (
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message?.includes("not approved") ||
      error.message?.includes("protected customer data")
    ) {
      throw new Error("PROTECTED_CUSTOMER_DATA_ACCESS_DENIED");
    }
    throw error;
  }

  return {
    count: finalNewCustomers,
    dataPoints,
  };
}
