"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_VALUE } from "@/lib/dashboardAuth";

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

  // Mock sign-in: any non-empty credentials create a dashboard session.
  (await cookies()).set(DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  redirect(next);
}

export async function dashboardSignOut() {
  // Expire the cookie.
  (await cookies()).set(DASHBOARD_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  redirect("/dashboard/sign-in");
}

