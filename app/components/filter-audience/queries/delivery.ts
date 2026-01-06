/**
 * Delivery Preferences Query Builder
 * 
 * This file contains the query logic for filtering customers by delivery/shipping preferences.
 * 
 * Query Structure:
 * - Fetches customers with their orders and shipping lines
 * - Filters customers based on shipping methods they've used
 * 
 * Usage:
 * This query will be combined with other filter queries to create a final compiled query.
 */

export interface DeliveryFilter {
  deliveryMethods: string[]; // e.g., ["Standard Shipping", "Express Shipping", "Free Shipping", etc.]
}

/**
 * Map user-friendly delivery method names to Shopify shipping line patterns
 * Shopify returns shipping line titles that may vary, so we use pattern matching
 */
const DELIVERY_METHOD_PATTERNS: Record<string, string[]> = {
  "Standard Shipping": [
    "standard",
    "regular",
    "ground",
    "economy",
  ],
  "Express Shipping": [
    "express",
    "expedited",
    "priority",
    "fast",
  ],
  "Free Shipping": [
    "free",
    "complimentary",
  ],
  "Local Pickup": [
    "pickup",
    "local",
    "store pickup",
    "in-store",
  ],
  "Same-day Delivery": [
    "same day",
    "same-day",
    "today",
    "instant",
  ],
  "International Shipping": [
    "international",
    "global",
    "worldwide",
  ],
  "Scheduled Delivery": [
    "scheduled",
    "appointment",
    "delivery window",
  ],
};

/**
 * Check if a shipping line title matches a delivery method pattern
 */
function matchesDeliveryMethod(shippingTitle: string, method: string): boolean {
  if (!shippingTitle) return false;

  const titleLower = shippingTitle.toLowerCase();
  const patterns = DELIVERY_METHOD_PATTERNS[method] || [];

  // Check if any pattern matches
  for (const pattern of patterns) {
    if (titleLower.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Also check for exact match (case-insensitive)
  if (titleLower === method.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Build GraphQL query fragment for delivery preferences filtering
 * 
 * This returns the fields needed in the customer query to filter by delivery methods
 * 
 * Note: We limit to 10 orders to keep query cost low.
 */
export function buildDeliveryQueryFragment(): string {
  return `
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          shippingLines {
            title
            originalPriceSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Filter customers by delivery preferences
 * 
 * This function filters customers based on shipping methods they've used
 */
export function filterByDelivery(
  customers: any[],
  filter: DeliveryFilter
): any[] {
  if (!filter.deliveryMethods || filter.deliveryMethods.length === 0) {
    return customers; // No filter applied, return all
  }

  return customers.filter((customer: any) => {
    const orders = customer.orders?.edges || [];

    // Check if any order matches the selected delivery methods
    for (const orderEdge of orders) {
      const shippingLines = orderEdge.node?.shippingLines || [];

      // Check each shipping line against selected delivery methods
      for (const shippingLine of shippingLines) {
        const shippingTitle = shippingLine?.title || "";

        // Check if this shipping line matches any selected delivery method
        for (const method of filter.deliveryMethods) {
          // Special handling for "Free Shipping" - check if price is 0
          if (method === "Free Shipping") {
            const price = parseFloat(
              shippingLine?.originalPriceSet?.shopMoney?.amount || "0"
            );
            if (price === 0 || matchesDeliveryMethod(shippingTitle, method)) {
              return true;
            }
          }
          // Special handling for "Eco-friendly Packaging" - this would need custom attributes
          // For now, we'll skip it or you can implement based on order tags/attributes
          else if (method === "Eco-friendly Packaging") {
            // This would require checking order tags or custom attributes
            // For now, we'll skip this check
            continue;
          }
          // Regular pattern matching for other methods
          else if (matchesDeliveryMethod(shippingTitle, method)) {
            return true; // Customer has at least one order with matching delivery method
          }
        }
      }
    }

    return false; // No orders match the delivery method criteria
  });
}

/**
 * Get customer's delivery methods from their orders
 */
export function getCustomerDeliveryMethods(customer: any): string[] {
  const deliveryMethods = new Set<string>();
  const orders = customer.orders?.edges || [];

  orders.forEach((orderEdge: any) => {
    const shippingLines = orderEdge.node?.shippingLines || [];
    shippingLines.forEach((shippingLine: any) => {
      const title = shippingLine?.title;
      if (title) {
        deliveryMethods.add(title);
      }
    });
  });

  return Array.from(deliveryMethods);
}

