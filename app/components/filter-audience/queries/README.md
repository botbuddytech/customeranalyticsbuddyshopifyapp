# Filter Audience Query System

This directory contains the modular query builder system for filtering customers based on various criteria.

## Architecture

The query system is designed to be **modular and extensible**:

1. **Individual Query Builders** (`geographicLocation.ts`, etc.) - Each filter type has its own query builder
2. **Query Compiler** (`queryCompiler.ts`) - Combines all active filters into one optimized GraphQL query
3. **Main Query Function** (`../query.ts`) - Orchestrates the entire filtering process

## How It Works

### Step 1: Individual Query Builders

Each filter type (e.g., Geographic Location) has its own file that contains:

- **Query Fragment Builder**: Returns the GraphQL fields needed for that filter
- **Filter Function**: Filters the fetched customers based on that criteria
- **Helper Functions**: Utility functions for that filter type

**Example: `geographicLocation.ts`**

```typescript
// Builds the GraphQL fragment needed for location filtering
buildGeographicLocationQueryFragment(): string {
  return `
    defaultAddress {
      country
      countryCodeV2
    }
  `;
}

// Filters customers by location (post-query filtering)
filterByGeographicLocation(customers, filter): any[] {
  // Filter logic here
}
```

### Step 2: Query Compiler

The `queryCompiler.ts` file:

1. **Collects all active filter fragments** from individual query builders
2. **Combines them into one GraphQL query** (only includes fields for active filters)
3. **Applies all filters** to the fetched customers in sequence

**Example Query Generation:**

```typescript
// If only location filter is active:
buildCustomerQuery(filters) 
// Returns query with: defaultAddress { country, countryCodeV2 }

// If location + products filters are active:
buildCustomerQuery(filters)
// Returns query with: defaultAddress { ... } + orders { ... }
```

### Step 3: Main Query Function

The `query.ts` file:

1. Calls `buildCustomerQuery()` to get the optimized GraphQL query
2. Fetches customers from Shopify with pagination
3. Calls `applyAllFilters()` to filter the results
4. Formats and returns the final customer list

## Current Implementation

### ✅ Geographic Location Filter

**File**: `geographicLocation.ts`

**Query Fragment**:
```graphql
defaultAddress {
  country
  countryCodeV2
}
```

**How it works**:
- Fetches customers with their `defaultAddress.country`
- Filters customers whose country matches selected countries
- Expands region names (e.g., "North America" → ["United States", "Canada", "Mexico"])

## Adding New Filters

To add a new filter type (e.g., Products, Timing, etc.):

### 1. Create a new query builder file

Create `app/components/filter-audience/queries/products.ts`:

```typescript
/**
 * Products Query Builder
 */

export interface ProductsFilter {
  productIds: string[];
  categories: string[];
}

/**
 * Build GraphQL query fragment for products filtering
 */
export function buildProductsQueryFragment(): string {
  return `
    orders(first: 10) {
      edges {
        node {
          lineItems(first: 5) {
            edges {
              node {
                product {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Filter customers by products
 */
export function filterByProducts(
  customers: any[],
  filter: ProductsFilter
): any[] {
  // Your filtering logic here
  return customers.filter((customer) => {
    // Check if customer has ordered any of the selected products
    // ...
  });
}
```

### 2. Export from index.ts

Add to `app/components/filter-audience/queries/index.ts`:

```typescript
export * from "./products";
```

### 3. Add to queryCompiler.ts

Update `buildCustomerQuery()`:

```typescript
// Add products fragment if active
if (filters.products && filters.products.length > 0) {
  queryFragments.push(buildProductsQueryFragment());
}
```

Update `applyAllFilters()`:

```typescript
// Apply products filter
if (filters.products && filters.products.length > 0) {
  const productsFilter: ProductsFilter = {
    productIds: filters.products,
    categories: [],
  };
  filteredCustomers = filterByProducts(filteredCustomers, productsFilter);
}
```

### 4. That's it!

The system will automatically:
- Include the products query fragment in the GraphQL query
- Apply the products filter to the results
- Combine with other active filters

## Query Flow Diagram

```
User selects filters
    ↓
API receives FilterData
    ↓
queryCompiler.buildCustomerQuery()
    ↓
Collects fragments from active filters:
  - geographicLocation.ts → defaultAddress { ... }
  - products.ts → orders { ... }
  - timing.ts → createdAt, ...
    ↓
Combines into ONE GraphQL query
    ↓
Fetches customers from Shopify
    ↓
queryCompiler.applyAllFilters()
    ↓
Applies filters in sequence:
  1. filterByGeographicLocation()
  2. filterByProducts()
  3. filterByTiming()
    ↓
Returns filtered results
```

## Best Practices

1. **Keep query fragments minimal**: Only request fields you actually need
2. **Post-query filtering**: Use GraphQL for data fetching, JavaScript for complex filtering
3. **Performance**: Limit pagination (currently 1000 customers max)
4. **Error handling**: Always handle protected data access errors
5. **Documentation**: Document what each query builder does

## Example: Complete Filter Flow

```typescript
// User selects:
filters = {
  location: ["United States", "Canada"],
  products: ["Product A", "Product B"],
  timing: ["Morning (6am-12pm)"]
}

// Step 1: Build query
query = buildCustomerQuery(filters)
// Returns query with: defaultAddress, orders, createdAt fields

// Step 2: Fetch from Shopify
customers = await admin.graphql(query)

// Step 3: Apply filters
filtered = applyAllFilters(customers, filters)
// Applies: location → products → timing filters

// Step 4: Return results
return { customers: filtered, total: filtered.length }
```

## Notes

- The system is designed to be **additive**: Each new filter adds to the existing query
- Filters are applied **sequentially**: Location → Products → Timing → etc.
- The final query only includes fields for **active filters** (optimized)
- All filters work together: A customer must match **all** active filters

