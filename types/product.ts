import type { Category, Subcategory } from "./category";

/** One storefront detail tab: `label` = header, `content` = body (HTML/plain/markdown per app). */
export type ProductDetailSection = {
  key: string;
  label: string;
  content: string;
  sort_order?: number | null;
};

export interface ProductImage {
  id: number;
  product_id: number;
  object_key: string;
  sort_order: number;
  is_primary: boolean;
  /** When true, image is staging until approval (dashboard uploads for non-published products). */
  is_staging?: boolean;
  /** When true, a PM has staged this image for deletion; pharmacist must approve. */
  is_staging_deletion?: boolean;
  created_at: string;
  updated_at: string;
}

/** Catalog approval workflow (dashboard). */
export type CatalogStatus = "published" | "draft" | "pending_review" | "rejected";

/** Staged PM edits on published products awaiting pharmacist review (dashboard). */
export type RevisionReviewStatus = "none" | "pending" | "rejected";

export interface Product {
  id: number;
  item_id: string;
  item_name: string;
  product_group_id: string | null;
  variation_type: string | null;
  variation_value: string | null;
  generic_name: string | null;
  is_narcotic: boolean;
  requires_prescription?: boolean;
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
  detail_sections?: ProductDetailSection[] | null;
  /** PM/admin draft copy; promoted to `detail_sections` on approve when present. */
  detail_sections_draft?: ProductDetailSection[] | null;
  /** When true, object-storage detail file sync will not overwrite `detail_sections`. */
  detail_sections_locked?: boolean;
  details_synced_at?: string | null;
  catalog_status?: CatalogStatus;
  /** When `catalog_status` is published: staged draft/staging revision queue (not storefront visibility). */
  revision_review_status?: RevisionReviewStatus;
  /** Shown after reject; PM sees reason when editing a rejected product. */
  catalog_rejection_note?: string | null;
  /** Staged revision data submitted by PM; contains only changed fields. */
  revision_data?: Record<string, unknown> | null;
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

