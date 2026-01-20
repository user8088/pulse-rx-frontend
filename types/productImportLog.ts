export type ProductImportLogError = {
  row: number;
  item_id?: string | null;
  reason: string;
  message: string;
  data?: Record<string, unknown>;
};

export interface ProductImportLog {
  id?: number;
  import_uuid: string;
  total_rows?: number;
  created_count?: number;
  updated_count?: number;
  skipped_count?: number;
  errors?: ProductImportLogError[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProductImportLogs {
  data: ProductImportLog[];
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
}

