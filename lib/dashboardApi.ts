import { cookies } from "next/headers";
import { getApiBaseURL } from "./api/baseUrl";
import { DASHBOARD_AUTH_COOKIE } from "./dashboardAuth";

/**
 * Retrieves the dashboard auth token from cookies (server-side only).
 */
export async function getDashboardToken() {
  const jar = await cookies();
  return jar.get(DASHBOARD_AUTH_COOKIE)?.value?.trim();
}

/**
 * A server-side fetch wrapper that automatically attaches the dashboard auth token
 * and uses the backend base URL.
 */
export async function dashboardFetch(path: string, init?: RequestInit) {
  const token = await getDashboardToken();
  const baseUrl = getApiBaseURL();

  if (!baseUrl) {
    throw new Error("API base URL is not configured.");
  }

  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
  });
}
