import apiClient from "./client";
import type {
  Order,
  PaginatedOrders,
  CreateOrderRequest,
} from "@/types/order";

export interface MockCartHint {
  name: string;
  price: number;
  image: string;
  variation?: string;
}

function tierLabel(tier: string): string {
  if (tier === "box") return "Box";
  if (tier === "secondary") return "Pack";
  return "Unit";
}

/**
 * Enrich order items with display data (names, images, tier labels) from cart
 * hints when the backend response leaves those fields empty.
 */
function enrichOrder(
  order: Order,
  hints?: Record<number, MockCartHint>
): Order {
  if (!hints || !order.items?.length) return order;
  return {
    ...order,
    items: order.items.map((item) => {
      const h = hints[item.product_id];
      return {
        ...item,
        item_name: item.item_name || h?.name || `Product #${item.product_id}`,
        image_url: item.image_url || h?.image || null,
        tier_label: item.tier_label || tierLabel(item.tier),
      };
    }),
  };
}

/**
 * Place an order (POST /orders). Throws on failure so the caller
 * can display the real error to the user instead of silently succeeding.
 *
 * `cartHints` enriches the API response with product names / images
 * that the backend may not return (it only snapshots prices).
 */
export async function placeOrder(
  payload: CreateOrderRequest,
  cartHints?: Record<number, MockCartHint>
): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", payload);
  return enrichOrder(data, cartHints);
}

/**
 * Track an order by order_number + phone (guest flow).
 * GET /orders/{orderNumber}/track?phone=...
 */
export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<Order | null> {
  try {
    const { data } = await apiClient.get<Order>(
      `/orders/${encodeURIComponent(orderNumber)}/track`,
      { params: { phone } }
    );
    return data;
  } catch {
    return null;
  }
}

/**
 * Get customer's orders (GET /customer/orders). Requires Bearer token.
 * Returns empty result set when API is unreachable (no mock fallback).
 */
export async function getCustomerOrders(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedOrders> {
  try {
    const { data } = await apiClient.get<PaginatedOrders>("/customer/orders", {
      params,
    });
    return data;
  } catch {
    return {
      data: [],
      total: 0,
      per_page: params?.per_page ?? 15,
      current_page: params?.page ?? 1,
      last_page: 1,
      from: null,
      to: null,
    };
  }
}

/**
 * Get a single customer order (GET /customer/orders/:id). Requires Bearer token.
 * Returns null when API is unreachable (no mock fallback).
 */
export async function getCustomerOrder(
  id: number | string
): Promise<Order | null> {
  try {
    const { data } = await apiClient.get<Order>(`/customer/orders/${id}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Get a single order by id or order_number (GET /orders/:id).
 * Returns null when API is unreachable (no mock fallback -- use sessionStorage
 * from checkout for order confirmation page).
 */
export async function getOrder(id: number | string): Promise<Order | null> {
  try {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  } catch {
    return null;
  }
}
