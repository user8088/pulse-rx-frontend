import apiClient from "./client";
import type { Order, PaginatedOrders } from "@/types/order";
import {
  getMockOrder,
  getMockOrders,
  createMockOrder,
} from "./mockOrders";
import type { CreateOrderItemPayload } from "./mockOrders";

export type CreateOrderPayload = {
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  address: {
    phone: string;
    house_apt: string;
    street: string;
    block_locality: string;
    city: string;
  };
  payment_method: "cod" | "card";
  items: CreateOrderItemPayload[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  notes?: string | null;
};

/**
 * Create an order (POST /orders). Falls back to mock on failure.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const { data } = await apiClient.post<Order>("/orders", payload);
    return data;
  } catch {
    return createMockOrder(payload);
  }
}

/**
 * Get orders for current user (GET /orders). For profile order history.
 * Falls back to mock on failure.
 */
export async function getOrders(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedOrders> {
  try {
    const { data } = await apiClient.get<PaginatedOrders>("/orders", {
      params,
    });
    return data;
  } catch {
    return getMockOrders({
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 15,
    });
  }
}

/**
 * Get a single order by id (GET /orders/:id). Falls back to mock on failure.
 */
export async function getOrder(id: number | string): Promise<Order | null> {
  try {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  } catch {
    return getMockOrder(id);
  }
}
