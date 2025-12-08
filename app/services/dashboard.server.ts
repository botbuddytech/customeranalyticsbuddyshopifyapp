/**
 * Dashboard Service
 * 
 * This service provides data for the Customer Insights Dashboard.
 * In a real application, this would query your Prisma database.
 */

export interface DashboardData {
  customerOverview: {
    totalCustomers: { count: number };
    newCustomers: { count: number };
    returningCustomers: { count: number };
    inactiveCustomers: { count: number };
  };
  orderBehavior: {
    codOrders: { count: number };
    prepaidOrders: { count: number };
    cancelledOrders: { count: number };
    abandonedOrders: { count: number };
  };
  engagementPatterns: {
    discountUsers: { count: number };
    wishlistUsers: { count: number };
    reviewers: { count: number };
    emailSubscribers: { count: number };
  };
  purchaseTiming: {
    morningPurchases: { count: number };
    afternoonPurchases: { count: number };
    eveningPurchases: { count: number };
    weekendPurchases: { count: number };
  };
  customerSegmentation: {
    codOrders: number;
    prepaidOrders: number;
    cancelledOrders: number;
    abandonedOrders: number;
  };
  behavioralBreakdown: {
    discountUsers: number;
    wishlistUsers: number;
    reviewers: number;
    emailSubscribers: number;
  };
  lastUpdated: string;
}

/**
 * Get Dashboard Data
 * 
 * Fetches all dashboard metrics based on the selected date range.
 * In a real app, this would query your Prisma database with date filters.
 * 
 * @param dateRange - The date range filter (e.g., '30days', '7days', 'today')
 * @returns Dashboard data with all metrics
 */
export async function getDashboardData(dateRange: string): Promise<DashboardData> {
  // Mock data - replace with actual Prisma queries
  // Example Prisma query:
  // const totalCustomers = await prisma.customer.count();
  
  return {
    customerOverview: {
      totalCustomers: { count: 1250 },
      newCustomers: { count: 85 },
      returningCustomers: { count: 420 },
      inactiveCustomers: { count: 156 }
    },
    orderBehavior: {
      codOrders: { count: 340 },
      prepaidOrders: { count: 680 },
      cancelledOrders: { count: 45 },
      abandonedOrders: { count: 78 }
    },
    engagementPatterns: {
      discountUsers: { count: 245 },
      wishlistUsers: { count: 189 },
      reviewers: { count: 67 },
      emailSubscribers: { count: 892 }
    },
    purchaseTiming: {
      morningPurchases: { count: 234 },
      afternoonPurchases: { count: 456 },
      eveningPurchases: { count: 389 },
      weekendPurchases: { count: 298 }
    },
    customerSegmentation: {
      codOrders: 340,
      prepaidOrders: 680,
      cancelledOrders: 45,
      abandonedOrders: 78
    },
    behavioralBreakdown: {
      discountUsers: 245,
      wishlistUsers: 189,
      reviewers: 67,
      emailSubscribers: 892
    },
    lastUpdated: new Date().toISOString()
  };
}

