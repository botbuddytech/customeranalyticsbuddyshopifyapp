export interface FilterData {
  location: string[];
  products: string[];
  timing: string[];
  device: string[];
  payment: string[];
  delivery: string[];
}

export interface FilterSection {
  id: string;
  title: string;
  emoji: string;
  options: string[];
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


