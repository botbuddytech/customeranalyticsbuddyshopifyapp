# Filter Components Structure

This directory contains modular, self-contained filter components for the Audience Filter feature. Each filter type has its own folder with dedicated components and logic.

## Structure

```
filters/
├── shared/
│   └── BaseFilterSection.tsx    # Shared base component with common UI logic
├── geographic-location/
│   └── index.tsx                 # Geographic Location filter component
├── product-categories/
│   └── index.tsx                 # Product Categories filter component
├── shopping-timing/
│   └── index.tsx                 # Shopping Timing filter component
├── payment-methods/
│   └── index.tsx                 # Payment Methods filter component
├── delivery-preferences/
│   └── index.tsx                 # Delivery Preferences filter component
└── index.ts                      # Central export point
```

## Component Architecture

### BaseFilterSection
Located in `shared/BaseFilterSection.tsx`, this component provides:
- Collapsible card UI
- Checkbox tree structure with visual hierarchy
- Loading states with skeletons
- Empty state messages
- Selected count badges

### Individual Filter Components

Each filter component:
- Uses `BaseFilterSection` for consistent UI
- Manages its own specific options/configuration
- Accepts props for selected filters, expansion state, and callbacks
- Can be easily modified without affecting other filters

## Query Logic

The query logic for each filter type is located in:
```
app/components/filter-audience/queries/
├── geographicLocation.ts
├── products.ts
├── timing.ts
├── payment.ts
└── delivery.ts
```

Each query file contains:
- GraphQL query fragment builders
- Filter functions that apply the filter logic
- Helper functions for data extraction

## Usage Example

```tsx
import {
  GeographicLocation,
  ProductCategories,
  ShoppingTiming,
  PaymentMethods,
  DeliveryPreferences,
} from "./filters";

// In your component:
<GeographicLocation
  countries={countries}
  selectedFilters={selectedFilters.location || []}
  isExpanded={expandedSections.location || false}
  onToggle={() => toggleSection("location")}
  onFilterChange={(value, checked) =>
    handleFilterChange("location", value, checked)
  }
  isLoading={isLoading}
/>
```

## Benefits of This Structure

1. **Modularity**: Each filter is self-contained and can be modified independently
2. **Maintainability**: Easy to find and update specific filter logic
3. **Scalability**: Simple to add new filter types by creating a new folder
4. **Reusability**: BaseFilterSection provides consistent UI across all filters
5. **Separation of Concerns**: UI components are separate from query logic

## Adding a New Filter

1. Create a new folder in `filters/` (e.g., `filters/new-filter-type/`)
2. Create `index.tsx` with your filter component using `BaseFilterSection`
3. Add query logic in `queries/new-filter-type.ts`
4. Export from `filters/index.ts`
5. Import and use in the main `index.tsx`

## Migration Notes

The old `FilterSection.tsx` component is still present but no longer used. It can be removed once you've verified the new structure works correctly. The `filterSections.ts` file is also kept for reference but is no longer needed for the main component rendering.

