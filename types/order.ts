export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "card";

export interface OrderAddress {
  phone: string;
  house_apt: string;
  street: string;
  block_locality: string;
  city: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  item_name: string;
  item_id: string;
  tier: "box" | "secondary" | "item";
  tier_label: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  image_url?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  address: OrderAddress;
  subtotal: string;
  tax: string;
  shipping: string;
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
