export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  external_id: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface CustomerImportResult {
  import_uuid: string;
  log_saved: boolean;
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  errors: Array<{
    row: number;
    reason: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

export interface CustomerImportLog {
  import_uuid: string;
  total_rows?: number;
  created_count?: number;
  updated_count?: number;
  skipped_count?: number;
  errors?: Array<{
    row: number;
    reason: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
  created_at?: string;
}

export interface PaginatedCustomerImportLogs {
  data: CustomerImportLog[];
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
}

export interface MedicalProfile {
  id: number;
  customer_id: number;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  products?: ProfileProduct[];
  prescriptions?: ProfilePrescription[];
}

export interface ProfileProduct {
  id?: number;
  product_id: number;
  quantity: number;
  product?: { id: number; item_id: string; item_name: string };
}

export interface ProfilePrescription {
  id: number;
  profile_id: number;
  name?: string | null;
  file_name?: string;
  object_key?: string;
  created_at?: string;
}

export interface CreateCustomerBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  external_id?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  discount_percentage?: number;
}
