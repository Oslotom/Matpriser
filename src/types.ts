export enum Category {
  Fruit = "Fruit",
  Vegetables = "Vegetables",
  Meat = "Meat",
  Fish = "Fish",
  Dairy = "Dairy",
  Bread = "Bread",
  Frozen = "Frozen",
  Snacks = "Snacks",
  Drinks = "Drinks",
  Household = "Household",
  Other = "Other"
}

export interface ReceiptItem {
  original_name: string;
  standardized_name: string;
  product_id: string;
  category: Category;
  quantity: number;
  unit: string;
  price_total: number;
  discount: number | null;
  comparisons: Record<string, number | null>;
  confidence: number;
}

export interface StoreInfo {
  store_name: string;
  store_chain: string;
  store_location: string;
  purchase_date: string;
  purchase_time: string;
}

export interface ExtractionResult {
  store: StoreInfo;
  currency: string;
  comparison_date: string;
  items: ReceiptItem[];
}

export interface StoreTotal {
  chain: string;
  total: number;
  missingCount: number;
  isReceipt: boolean;
}
