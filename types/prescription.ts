export type PrescriptionStatus = "pending" | "approved" | "rejected";

export interface Prescription {
  id: number;
  product_id: number;
  order_id: number;
  order_item_id: number;
  customer_id?: number | null;
  guest_phone?: string | null;
  guest_name?: string | null;
  file_key: string;
  status: PrescriptionStatus;
  notes?: string | null;
  reviewed_by_user_id?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  product?: { id: number; item_name: string; requires_prescription: boolean };
  order?: { id: number; order_number: string };
  order_item?: { id: number; product_id: number };
  customer?: { id: number; name: string; email: string } | null;
  reviewer?: { id: number; name: string } | null;
}

export interface PaginatedPrescriptions {
  data: Prescription[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}
