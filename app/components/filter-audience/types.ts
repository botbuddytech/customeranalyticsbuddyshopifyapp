export interface AmountSpentFilter {
  amount: number | null;
  operator: "min" | "max" | null; // "min" means minimum (>=), "max" means maximum (<=)
}

export interface FilterData {
  location: string[];
  products: string[];
  timing: string[];
  device: string[];
  payment: string[];
  delivery: string[];
  amountSpent?: AmountSpentFilter;
  customerCreatedFrom?: string | null; // ISO date string (YYYY-MM-DD)
  graphqlQuery?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  imageUrl?: string;
  children?: FilterOption[];
}

export interface FilterSection {
  id: string;
  title: string;
  emoji: string;
  options: (string | FilterOption)[];
}

export interface FilteredCustomer {
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
  numberOfOrders: number;
  totalSpent: string;
}

export interface SegmentResults {
  matchCount: number;
  filters: FilterData;
  customers?: FilteredCustomer[];
  error?: string;
}


