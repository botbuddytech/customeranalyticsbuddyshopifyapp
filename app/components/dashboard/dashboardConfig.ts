
export interface DashboardVisibility {
    customersOverview: {
        enabled: boolean;
        cards: {
            totalCustomers: boolean;
            newCustomers: boolean;
            returningCustomers: boolean;
            inactiveCustomers: boolean;
        };
    };
    purchaseOrderBehavior: {
        enabled: boolean;
        cards: {
            codOrders: boolean;
            prepaidOrders: boolean;
            cancelledOrders: boolean;
            abandonedCarts: boolean;
        };
    };
    engagementPatterns: {
        enabled: boolean;
        cards: {
            discountUsers: boolean;
            wishlistUsers: boolean;
            reviewers: boolean;
            emailSubscribers: boolean;
        };
    };
}

export const DEFAULT_VISIBILITY: DashboardVisibility = {
    customersOverview: {
        enabled: true,
        cards: {
            totalCustomers: true,
            newCustomers: true,
            returningCustomers: true,
            inactiveCustomers: false,
        },
    },
    purchaseOrderBehavior: {
        enabled: true,
        cards: {
            codOrders: true,
            prepaidOrders: true,
            cancelledOrders: true,
            abandonedCarts: false,
        },
    },
    engagementPatterns: {
        enabled: true,
        cards: {
            discountUsers: true,
            wishlistUsers: true,
            reviewers: true,
            emailSubscribers: false,
        },
    },
};
