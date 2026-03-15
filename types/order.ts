export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "card";

export interface OrderAddress {
  phone: string;
  house_apt: string;
  street: string;
  block_locality: string;
  city: string;
}

export interface OrderItemPrescription {
  id: number;
  file_name?: string | null;
  object_key?: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  item_name: string;
  item_id: string;
  unit_type?: "item" | "secondary" | "box";
  unit_label?: string;
  tier: "box" | "secondary" | "item";
  tier_label: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  /** Discount applied to this line only (e.g. "5.00"). */
  discount_amount?: string | null;
  image_url?: string | null;
  requires_prescription?: boolean;
  prescriptions?: OrderItemPrescription[];
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  customer_id?: number | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city?: string | null;
  delivery_gender?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  /** @deprecated kept for mock/legacy compat; prefer delivery_* fields */
  address?: OrderAddress;
  subtotal: string;
  tax: string;
  shipping: string;
  /** Total discount applied (sum of line discounts). Prefer over discount when present. */
  discount_amount?: string | null;
  /** Customer's discount % at time of order (display only). */
  discount_percentage?: number | null;
  /** @deprecated use discount_amount when available */
  discount?: string | null;
  /** Delivery fee (may be sent instead of shipping). */
  delivery_fee?: string | null;
  total: string;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

/** Payload sent to POST /orders to place an order. */
export interface CreateOrderRequest {
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_gender?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  product_id: number;
  unit_type: "item" | "secondary" | "box";
  quantity: number;
}
