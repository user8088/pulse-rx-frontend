import apiClient from "./client";
import type {
  Order,
  PaginatedOrders,
  CreateOrderRequest,
} from "@/types/order";

/**
 * Place an order (POST /orders). Throws on failure so the caller
 * can display the real error to the user instead of silently succeeding.
 */
export async function placeOrder(
  payload: CreateOrderRequest
): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", payload);
  return data;
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
 * Returns null when API is unreachable.
 */
export async function getOrder(id: number | string): Promise<Order | null> {
  try {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  } catch {
    return null;
  }
}
