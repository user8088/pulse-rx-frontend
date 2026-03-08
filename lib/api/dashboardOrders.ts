import { dashboardFetch } from "@/lib/dashboardApi";
import type { Order, OrderStatus, PaginatedOrders } from "@/types/order";
import {
  getMockOrder,
  getMockOrders,
  updateMockOrderStatus,
} from "@/lib/api/mockOrders";

export type DashboardOrdersParams = {
  page?: number;
  per_page?: number;
  status?: string;
  q?: string;
  from_date?: string;
  to_date?: string;
  customer_id?: number;
};

/**
 * Fetch orders for dashboard (GET /dashboard/orders).
 */
export async function getDashboardOrders(
  params?: DashboardOrdersParams
): Promise<PaginatedOrders> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page != null) searchParams.set("page", String(params.page));
    if (params?.per_page != null)
      searchParams.set("per_page", String(params.per_page));
    if (params?.status && params.status !== "all")
      searchParams.set("status", params.status);
    if (params?.q?.trim()) searchParams.set("q", params.q.trim());
    if (params?.from_date) searchParams.set("from_date", params.from_date);
    if (params?.to_date) searchParams.set("to_date", params.to_date);
    if (params?.customer_id != null)
      searchParams.set("customer_id", String(params.customer_id));

    const query = searchParams.toString();
    const path = query ? `/dashboard/orders?${query}` : "/dashboard/orders";
    const res = await dashboardFetch(path);
    if (!res.ok) throw new Error("Orders fetch failed");
    const data = (await res.json()) as PaginatedOrders;
    return data;
  } catch {
    return getMockOrders({
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 15,
      status: params?.status,
      q: params?.q,
    });
  }
}

/**
 * Fetch a single order for dashboard (GET /dashboard/orders/:id).
 */
export async function getDashboardOrder(
  id: number | string
): Promise<Order | null> {
  try {
    const res = await dashboardFetch(`/dashboard/orders/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Order;
    return data;
  } catch {
    return getMockOrder(id);
  }
}

/**
 * Update order status (PATCH /dashboard/orders/:id/status).
 */
export async function updateOrderStatus(
  id: number | string,
  status: OrderStatus
): Promise<Order | null> {
  try {
    const res = await dashboardFetch(`/dashboard/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Update failed");
    const data = (await res.json()) as Order;
    return data;
  } catch {
    return updateMockOrderStatus(id, status);
  }
}
