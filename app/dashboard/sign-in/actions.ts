"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiBaseURL } from "@/lib/api/baseUrl";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import { DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_COOKIE_PATH } from "@/lib/dashboardAuth";

function safeNext(nextPath: string) {
  return nextPath.startsWith("/dashboard") ? nextPath : "/dashboard/inventory";
}

export async function dashboardSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/dashboard/inventory"));

  if (!email || !password) {
    redirect(`/dashboard/sign-in?error=missing&next=${encodeURIComponent(next)}`);
  }

  const baseUrl = getApiBaseURL();
  if (!baseUrl) {
    redirect(`/dashboard/sign-in?error=api_url&next=${encodeURIComponent(next)}`);
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/dashboard/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    redirect(
      `/dashboard/sign-in?error=network&message=${encodeURIComponent(
        message
      )}&next=${encodeURIComponent(next)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    const code =
      res.status === 403 ? "forbidden" : res.status === 422 ? "validation" : "invalid";
    redirect(
      `/dashboard/sign-in?error=${encodeURIComponent(code)}&message=${encodeURIComponent(
        message
      )}&next=${encodeURIComponent(next)}`
    );
  }

  const data = (await res.json()) as { token?: string };
  const token = String(data?.token ?? "").trim();
  if (!token) {
    redirect(
      `/dashboard/sign-in?error=${encodeURIComponent(
        "invalid"
      )}&message=${encodeURIComponent("Login succeeded but no token was returned.")}&next=${encodeURIComponent(
        next
      )}`
    );
  }

  (await cookies()).set(DASHBOARD_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: DASHBOARD_AUTH_COOKIE_PATH,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  redirect(next);
}

export async function dashboardSignOut() {
  const jar = await cookies();
  const token = jar.get(DASHBOARD_AUTH_COOKIE)?.value;

  // Best-effort logout (token revoke) if backend is reachable.
  try {
    const baseUrl = getApiBaseURL();
    if (baseUrl && token) {
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    }
  } catch {
    // ignore backend failures on sign-out
  }

  // Expire the cookie.
  jar.set(DASHBOARD_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: DASHBOARD_AUTH_COOKIE_PATH,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  redirect("/dashboard/sign-in");
}

