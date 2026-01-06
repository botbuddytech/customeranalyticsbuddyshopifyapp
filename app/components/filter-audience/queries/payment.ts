/**
 * Payment Methods Query Builder
 * 
 * This file contains the query logic for filtering customers by payment methods used.
 * 
 * Query Structure:
 * - Fetches customers with their orders and payment gateway names
 * - Filters customers who have used the selected payment methods
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

export interface PaymentFilter {
  paymentMethods: string[]; // e.g., ["Credit Card", "PayPal", "Apple Pay", etc.]
}

/**
 * Map user-friendly payment method names to Shopify payment gateway names
 * Shopify returns payment gateway names like "shopify_payments", "paypal", "stripe", etc.
 */
const PAYMENT_METHOD_MAP: Record<string, string[]> = {
  "Credit Card": [
    "shopify_payments",
    "stripe",
    "authorize_net",
    "braintree",
    "first_data",
    "cybersource",
    "worldpay",
    "adyen",
  ],
  "PayPal": ["paypal", "paypal_express"],
  "Apple Pay": ["apple_pay", "shopify_payments"], // Apple Pay can be through Shopify Payments
  "Google Pay": ["google_pay", "shopify_payments"], // Google Pay can be through Shopify Payments
  "Shop Pay": ["shopify_payments"],
  "Amazon Pay": ["amazon_payments"],
  "Cash on Delivery": ["manual", "bogus"], // Manual payment methods
  "Bank Transfer": ["manual", "bank_transfer"],
  "Gift Card": ["gift_card"],
  "Store Credit": ["store_credit"],
  "Klarna": ["klarna"],
  "Afterpay": ["afterpay"],
  "Affirm": ["affirm"],
  "Sezzle": ["sezzle"],
};

/**
 * Normalize payment method names to Shopify gateway names
 */
function normalizePaymentMethods(paymentMethods: string[]): string[] {
  if (!paymentMethods || paymentMethods.length === 0) {
    return [];
  }

  const gatewayNames = new Set<string>();

  paymentMethods.forEach((method) => {
    const mappedGateways = PAYMENT_METHOD_MAP[method];
    if (mappedGateways) {
      mappedGateways.forEach((gateway) => gatewayNames.add(gateway));
    } else {
      // If not found in map, use the method name as-is (case-insensitive)
      gatewayNames.add(method.toLowerCase());
    }
  });

  return Array.from(gatewayNames);
}

/**
 * Build GraphQL query fragment for payment methods filtering
 * 
 * This returns the fields needed in the customer query to filter by payment methods
 * 
 * Note: We limit to 10 orders to keep query cost low.
 * We also fetch displayFinancialStatus to identify prepaid orders.
 */
export function buildPaymentQueryFragment(): string {
  return `
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          paymentGatewayNames
          displayFinancialStatus
        }
      }
    }
  `;
}

/**
 * Filter customers by payment methods
 * 
 * This function filters customers based on payment methods they've used
 * Also handles special cases like "Prepaid" which is based on order financial status
 */
export function filterByPayment(
  customers: any[],
  filter: PaymentFilter
): any[] {
  if (!filter.paymentMethods || filter.paymentMethods.length === 0) {
    return customers; // No filter applied, return all
  }

  // Separate special payment methods from gateway-based ones
  const specialMethods = filter.paymentMethods.filter(
    (method) => method === "Prepaid" || method === "Cash on Delivery"
  );
  const gatewayMethods = filter.paymentMethods.filter(
    (method) => method !== "Prepaid" && method !== "Cash on Delivery"
  );

  const targetGateways = normalizePaymentMethods(gatewayMethods);

  return customers.filter((customer: any) => {
    const orders = customer.orders?.edges || [];

    // Check if any order matches the selected payment methods
    for (const orderEdge of orders) {
      const order = orderEdge.node;
      const paymentGatewayNames = order?.paymentGatewayNames || [];
      const financialStatus = order?.displayFinancialStatus || "";

      // Check for special payment methods
      if (specialMethods.includes("Prepaid")) {
        // Prepaid orders are those that are fully paid (PAID status)
        if (financialStatus === "PAID") {
          return true;
        }
      }

      if (specialMethods.includes("Cash on Delivery")) {
        // COD orders are typically PENDING, AUTHORIZED, or PARTIALLY_PAID
        if (
          financialStatus === "PENDING" ||
          financialStatus === "AUTHORIZED" ||
          financialStatus === "PARTIALLY_PAID"
        ) {
          return true;
        }
      }

      // Check if any payment gateway matches the selected methods
      if (gatewayMethods.length > 0) {
        const hasMatchingPayment = paymentGatewayNames.some((gateway: string) => {
          // Case-insensitive matching
          const gatewayLower = gateway.toLowerCase();
          return targetGateways.some((target) => target.toLowerCase() === gatewayLower);
        });

        if (hasMatchingPayment) {
          return true; // Customer has at least one order with matching payment method
        }
      }
    }

    return false; // No orders match the payment method criteria
  });
}

/**
 * Get customer's payment methods from their orders
 */
export function getCustomerPaymentMethods(customer: any): string[] {
  const paymentMethods = new Set<string>();
  const orders = customer.orders?.edges || [];

  orders.forEach((orderEdge: any) => {
    const paymentGatewayNames = orderEdge.node?.paymentGatewayNames || [];
    paymentGatewayNames.forEach((gateway: string) => {
      paymentMethods.add(gateway);
    });
  });

  return Array.from(paymentMethods);
}

