import type { Category } from "./category";

export interface ProductImage {
  id: number;
  product_id: number;
  object_key: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  item_id: string;
  item_name: string;
  product_group_id: string | null;
  variation_type: string | null;
  variation_value: string | null;
  category_id: number | null;
  brand: string | null;
  stock_qty: number;
  low_stock_threshold: number;
  in_stock: boolean;
  retail_price: string;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: ProductImage[];
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export type ProductImportError = {
  row: number;
  item_id?: string | null;
  reason: string;
  message: string;
  data?: Record<string, unknown>;
};

export interface ProductImportResult {
  import_uuid?: string;
  log_saved?: boolean;
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  errors?: ProductImportError[];
}

