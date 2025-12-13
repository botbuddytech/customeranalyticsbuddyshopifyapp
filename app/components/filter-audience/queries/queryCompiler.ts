/**
 * Query Compiler
 * 
 * This file compiles all individual filter queries into one final GraphQL query.
 * 
 * How it works:
 * 1. Each filter type has its own query builder (e.g., geographicLocation.ts)
 * 2. This compiler collects all query fragments from active filters
 * 3. Combines them into a single optimized GraphQL query
 * 4. Returns the final query string and post-processing filter function
 */

import type { FilterData } from "../types";
import {
  buildGeographicLocationQueryFragment,
  filterByGeographicLocation,
  getCustomerCountry,
  type GeographicLocationFilter,
} from "./geographicLocation";
import {
  buildProductsQueryFragment,
  filterByProducts,
  getProductIdsByTitles,
  getCollectionIdsByTitles,
  type ProductsFilter,
} from "./products";
import {
  buildTimingQueryFragment,
  filterByTiming,
  type TimingFilter,
} from "./timing";
import {
  buildPaymentQueryFragment,
  filterByPayment,
  type PaymentFilter,
} from "./payment";
import {
  buildDeliveryQueryFragment,
  filterByDelivery,
  type DeliveryFilter,
} from "./delivery";
import type { AdminGraphQL } from "../../../services/dashboard.server";

/**
 * Build the complete GraphQL query with all active filter fragments
 */
export function buildCustomerQuery(
  filters: FilterData,
  cursor: string | null = null
): string {
  // Collect all query fragments from active filters
  const queryFragments: string[] = [];

  // Geographic Location fragment
  if (filters.location && filters.location.length > 0) {
    queryFragments.push(buildGeographicLocationQueryFragment());
  }

  // Products, Timing, and Payment fragments - merge if multiple are active
  const hasProductsFilter = filters.products && filters.products.length > 0;
  const hasTimingFilter = filters.timing && filters.timing.length > 0;
  const hasPaymentFilter = filters.payment && filters.payment.length > 0;
  
  // Build merged orders fragment if multiple filters need orders
  if (hasProductsFilter || hasTimingFilter || hasPaymentFilter) {
    const orderFields: string[] = [];
    
    if (hasProductsFilter) {
      orderFields.push(`
          lineItems(first: 10) {
            edges {
              node {
                product {
                  id
                  title
                  productType
                }
              }
            }
          }`);
    }
    
    if (hasTimingFilter) {
      orderFields.push(`createdAt`);
    }
    
    if (hasPaymentFilter) {
      orderFields.push(`paymentGatewayNames`);
      orderFields.push(`displayFinancialStatus`);
    }
    
    queryFragments.push(`
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ${orderFields.join("\n          ")}
        }
      }
    }
  `);
  }

  // Add other filter fragments here as they are implemented:
  // if (filters.device && filters.device.length > 0) {
  //   queryFragments.push(buildDeviceQueryFragment());
  // }
  // etc...

  // Combine all fragments
  const fieldsFragment = queryFragments.join("\n                ");

  // Base customer fields (always needed)
  const baseFields = `
    id
    displayName
    email
    createdAt
    numberOfOrders
    amountSpent {
      amount
      currencyCode
    }
  `;

  // Build the complete query
  // Reduce batch size when products, timing, payment, or delivery filters are active to avoid query cost limits
  const hasExpensiveFilters = 
    (filters.products && filters.products.length > 0) ||
    (filters.timing && filters.timing.length > 0) ||
    (filters.payment && filters.payment.length > 0) ||
    (filters.delivery && filters.delivery.length > 0);
  const batchSize = hasExpensiveFilters ? 50 : 250;
  
  const query = cursor
    ? `
      query {
        customers(first: ${batchSize}, after: "${cursor}") {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ${baseFields}
            ${fieldsFragment}
          }
        }
      }
    `
    : `
      query {
        customers(first: ${batchSize}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ${baseFields}
            ${fieldsFragment}
          }
        }
      }
    `;

  return query;
}

/**
 * Apply all filters to the fetched customers
 * 
 * This function applies post-query filtering based on all active filters
 * 
 * Note: For products filtering, we need to separate products, collections, and categories
 * from the filters.products array. This is done by checking against the loaded data.
 */
export async function applyAllFilters(
  customers: any[],
  filters: FilterData,
  admin?: AdminGraphQL
): Promise<any[]> {
  let filteredCustomers = customers;

  // Apply geographic location filter
  if (filters.location && filters.location.length > 0) {
    const locationFilter: GeographicLocationFilter = {
      countries: filters.location,
    };
    filteredCustomers = filterByGeographicLocation(
      filteredCustomers,
      locationFilter
    );
  }

  // Apply products filter
  if (filters.products && filters.products.length > 0 && admin) {
    // The filters.products array contains mixed items:
    // - Product titles
    // - Collection titles  
    // - Category/product type names
    
    // Get product IDs from titles (for exact product matching)
    const productIds = await getProductIdsByTitles(admin, filters.products);
    
    // Get collection IDs (for collection matching - though we'll primarily match by product titles)
    const collectionIds = await getCollectionIdsByTitles(admin, filters.products);
    
    // Create filter object - all items are checked against products, collections, and categories
    const productsFilter: ProductsFilter = {
      products: filters.products, // Check against product titles and IDs
      collections: filters.products, // Check against collections (if needed)
      categories: filters.products, // Check against product types
    };
    
    filteredCustomers = filterByProducts(
      filteredCustomers,
      productsFilter,
      productIds,
      collectionIds
    );
  }

  // Apply timing filter
  if (filters.timing && filters.timing.length > 0) {
    const timingFilter: TimingFilter = {
      timings: filters.timing,
    };
    filteredCustomers = filterByTiming(filteredCustomers, timingFilter);
  }

  // Apply payment filter
  if (filters.payment && filters.payment.length > 0) {
    const paymentFilter: PaymentFilter = {
      paymentMethods: filters.payment,
    };
    filteredCustomers = filterByPayment(filteredCustomers, paymentFilter);
  }

  // Apply delivery filter
  if (filters.delivery && filters.delivery.length > 0) {
    const deliveryFilter: DeliveryFilter = {
      deliveryMethods: filters.delivery,
    };
    filteredCustomers = filterByDelivery(filteredCustomers, deliveryFilter);
  }

  // Apply other filters here as they are implemented:
  // if (filters.device && filters.device.length > 0) {
  //   filteredCustomers = filterByDevice(filteredCustomers, filters.device);
  // }
  // etc...

  return filteredCustomers;
}

/**
 * Format customer data for display
 */
export function formatCustomerData(customer: any) {
  return {
    id: customer.id,
    name: customer.displayName || "N/A",
    email: customer.email || "N/A",
    country: getCustomerCountry(customer),
    createdAt: customer.createdAt
      ? new Date(customer.createdAt).toLocaleDateString()
      : "N/A",
    numberOfOrders: customer.numberOfOrders || 0,
    totalSpent: customer.amountSpent
      ? `${parseFloat(customer.amountSpent.amount).toFixed(2)} ${customer.amountSpent.currencyCode}`
      : "0.00",
  };
}

