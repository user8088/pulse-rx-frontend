import { dashboardFetch } from "@/lib/dashboardApi";
import type { Product, PaginatedProducts } from "@/types/product";

/**
 * Server-only: fetch products for dashboard (e.g. product picker in customer profiles).
 */
export async function getDashboardProducts(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}): Promise<PaginatedProducts | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.per_page != null) sp.set("per_page", String(params.per_page));
    if (params?.q?.trim()) sp.set("q", params.q.trim());
    const qs = sp.toString();
    const res = await dashboardFetch(
      qs ? `/dashboard/products?${qs}` : "/dashboard/products",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
