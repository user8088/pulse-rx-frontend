import type { Category, Subcategory } from "./category";

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
  generic_name: string | null;
  is_narcotic: boolean;
  category_id: number | null;
  brand: string | null;
  retail_price_unit: string;
  retail_price_item?: string;
  retail_price_secondary: string;
  retail_price_box: string;
  pack_qty: number | null;
  strip_qty: number | null;
  description?: string | null;
  usage_instructions?: string | null;
  can_sell_item?: boolean;
  can_sell_secondary?: boolean;
  can_sell_box?: boolean;
  secondary_unit_label?: string;
  box_unit_label?: string;
  base_unit_label?: string | null;
  packaging_display?: {
    base_unit: string;
    options: Array<{
      tier: "box" | "secondary" | "item";
      label: string;
      description: string;
      price: string;
    }>;
  };
  availability: "yes" | "no" | "short";
  cold_chain_needed: boolean;
  item_discount: string;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  subcategories?: Subcategory[];
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

