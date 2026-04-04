import { dashboardFetch } from "@/lib/dashboardApi";
import type { Tenant, User, UserResponse } from "@/types";

/**
 * Current dashboard user from `/auth/me` (server-only; uses dashboard cookie).
 */
export async function getDashboardUser(): Promise<{ user: User; tenant: Tenant | null } | null> {
  try {
    const res = await dashboardFetch("/auth/me");
    if (!res.ok) return null;
    const data = (await res.json()) as UserResponse;
    if (!data?.user) return null;
    return { user: data.user, tenant: data.tenant ?? null };
  } catch {
    return null;
  }
}
