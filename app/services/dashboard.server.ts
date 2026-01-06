/**
 * Dashboard Service
 *
 * This service provides REAL data for the Customer Insights Dashboard
 * by fetching from the merchant's Shopify store via Admin GraphQL API.
 *
 * NOTE: We avoid direct Customer queries due to Protected Customer Data restrictions.
 * Instead, we derive customer metrics from Orders data.
 */

// Type for Shopify Admin GraphQL client
export type AdminGraphQL = {
  graphql: (query: string) => Promise<Response>;
};

/**
 * Calculate date range for queries
 */
export function calculateDateRange(dateRange: string): string {
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case '7days':
    case 'last7Days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
    case 'last90Days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
    case 'last30Days':
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  return startDate.toISOString();
}

/**
 * Get Total Customers Count
 * 
 * Imports query logic from the component folder
 */
export async function getTotalCustomers(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const { getTotalCustomersQuery } = await import("../components/dashboard/CustomersOverview/TotalCustomers/query");
  return getTotalCustomersQuery(admin, dateRange);
}

/**
 * Get New Customers Count
 * 
 * Imports query logic from the component folder
 */
export async function getNewCustomers(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const { getNewCustomersQuery } = await import("../components/dashboard/CustomersOverview/NewCustomers/query");
  return getNewCustomersQuery(admin, dateRange);
}

/**
 * Get Returning Customers Count
 * 
 * Imports query logic from the component folder
 */
export async function getReturningCustomers(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const { getReturningCustomersQuery } = await import("../components/dashboard/CustomersOverview/ReturningCustomers/query");
  return getReturningCustomersQuery(admin, dateRange);
}

/**
 * Get Inactive Customers Count
 * 
 * Imports query logic from the component folder
 */
export async function getInactiveCustomers(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const { getInactiveCustomersQuery } = await import("../components/dashboard/CustomersOverview/InactiveCustomers/query");
  return getInactiveCustomersQuery(admin, dateRange);
}

/**
 * Get Customer Overview Data (Legacy - for backward compatibility)
 */
export async function getCustomerOverview(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const [totalCustomers, newCustomers, returningCustomers, inactiveCustomers] = await Promise.all([
    getTotalCustomers(admin, dateRange),
    getNewCustomers(admin, dateRange),
    getReturningCustomers(admin, dateRange),
    getInactiveCustomers(admin, dateRange)
  ]);

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    inactiveCustomers
  };
}

/**
 * Get Order Behavior Data
 */
export async function getOrderBehavior(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const startDateISO = calculateDateRange(dateRange);

  try {
    const response = await admin.graphql(`
      query {
        orders(first: 250, query: "created_at:>='${startDateISO}'") {
          nodes {
            id
            cancelledAt
            displayFinancialStatus
          }
        }
      }
    `);

    const json = await response.json();
    const orders = json.data?.orders?.nodes || [];

    const codOrders = orders.filter((o: any) =>
      o.displayFinancialStatus === 'PENDING' ||
      o.displayFinancialStatus === 'PARTIALLY_PAID' ||
      o.displayFinancialStatus === 'AUTHORIZED'
    ).length;

    const prepaidOrders = orders.filter((o: any) =>
      o.displayFinancialStatus === 'PAID' ||
      o.displayFinancialStatus === 'PARTIALLY_REFUNDED'
    ).length;

    const cancelledOrders = orders.filter((o: any) =>
      o.cancelledAt !== null
    ).length;

    return {
      codOrders: { count: codOrders },
      prepaidOrders: { count: prepaidOrders },
      cancelledOrders: { count: cancelledOrders },
      abandonedOrders: { count: 0 } // Can't fetch without protected data
    };
  } catch (error: any) {
    console.error(`[getOrderBehavior] Error accessing orders:`, error.message);
    // Return default values if order access is not available
    return {
      codOrders: { count: 0 },
      prepaidOrders: { count: 0 },
      cancelledOrders: { count: 0 },
      abandonedOrders: { count: 0 }
    };
  }
}

/**
 * Get Engagement Patterns Data
 */
export async function getEngagementPatterns(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const startDateISO = calculateDateRange(dateRange);

  try {
    const response = await admin.graphql(`
      query {
        orders(first: 250, query: "created_at:>='${startDateISO}'") {
          nodes {
            id
            totalDiscountsSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    `);

    const json = await response.json();
    const orders = json.data?.orders?.nodes || [];

    const discountUsers = orders.filter((o: any) => {
      const discountAmount = parseFloat(o.totalDiscountsSet?.shopMoney?.amount || '0');
      return discountAmount > 0;
    }).length;

    return {
      discountUsers: { count: discountUsers },
      wishlistUsers: { count: 0 }, // Requires protected data
      reviewers: { count: 0 }, // Requires reviews integration
      emailSubscribers: { count: 0 } // Requires protected data
    };
  } catch (error: any) {
    console.error(`[getEngagementPatterns] Error accessing orders:`, error.message);
    // Return default values if order access is not available
    return {
      discountUsers: { count: 0 },
      wishlistUsers: { count: 0 },
      reviewers: { count: 0 },
      emailSubscribers: { count: 0 }
    };
  }
}

/**
 * Get Purchase Timing Data
 */
export async function getPurchaseTiming(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const startDateISO = calculateDateRange(dateRange);

  try {
    const response = await admin.graphql(`
      query {
        orders(first: 250, query: "created_at:>='${startDateISO}'") {
          nodes {
            id
            createdAt
          }
        }
      }
    `);

    const json = await response.json();
    const orders = json.data?.orders?.nodes || [];

    let morningPurchases = 0;
    let afternoonPurchases = 0;
    let eveningPurchases = 0;
    let weekendPurchases = 0;

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getUTCHours();
      const day = orderDate.getUTCDay();

      if (hour >= 6 && hour < 12) morningPurchases++;
      else if (hour >= 12 && hour < 18) afternoonPurchases++;
      else eveningPurchases++;

      if (day === 0 || day === 6) weekendPurchases++;
    });

    return {
      morningPurchases: { count: morningPurchases },
      afternoonPurchases: { count: afternoonPurchases },
      eveningPurchases: { count: eveningPurchases },
      weekendPurchases: { count: weekendPurchases }
    };
  } catch (error: any) {
    console.error(`[getPurchaseTiming] Error accessing orders:`, error.message);
    // Return default values if order access is not available
    return {
      morningPurchases: { count: 0 },
      afternoonPurchases: { count: 0 },
      eveningPurchases: { count: 0 },
      weekendPurchases: { count: 0 }
    };
  }
}

/**
 * Get Customer Segmentation Data (for charts)
 */
export async function getCustomerSegmentation(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const orderBehavior = await getOrderBehavior(admin, dateRange);
  
  return {
    codOrders: orderBehavior.codOrders.count,
    prepaidOrders: orderBehavior.prepaidOrders.count,
    cancelledOrders: orderBehavior.cancelledOrders.count,
    abandonedOrders: orderBehavior.abandonedOrders.count
  };
}

/**
 * Get Behavioral Breakdown Data (for charts)
 */
export async function getBehavioralBreakdown(
  admin: AdminGraphQL,
  dateRange: string = "30days"
) {
  const engagement = await getEngagementPatterns(admin, dateRange);
  
  return {
    discountUsers: engagement.discountUsers.count,
    wishlistUsers: engagement.wishlistUsers.count,
    reviewers: engagement.reviewers.count,
    emailSubscribers: engagement.emailSubscribers.count
  };
}

// Legacy function for backward compatibility
export async function getDashboardData(
  admin: AdminGraphQL,
  dateRange: string
) {
  const [customerOverview, orderBehavior, engagementPatterns, purchaseTiming, customerSegmentation, behavioralBreakdown] = await Promise.all([
    getCustomerOverview(admin, dateRange),
    getOrderBehavior(admin, dateRange),
    getEngagementPatterns(admin, dateRange),
    getPurchaseTiming(admin, dateRange),
    getCustomerSegmentation(admin, dateRange),
    getBehavioralBreakdown(admin, dateRange)
  ]);

  return {
    customerOverview,
    orderBehavior,
    engagementPatterns,
    purchaseTiming,
    customerSegmentation,
    behavioralBreakdown,
    lastUpdated: new Date().toISOString()
  };
}
