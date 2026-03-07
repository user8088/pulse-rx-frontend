import SidebarNav from "@/components/dashboard/SidebarNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASHBOARD_AUTH_COOKIE } from "@/lib/dashboardAuth";
import { getApiBaseURL } from "@/lib/api/baseUrl";

async function validateDashboardSession() {
  const jar = await cookies();
  const token = jar.get(DASHBOARD_AUTH_COOKIE)?.value?.trim();
  if (!token) {
    redirect("/dashboard/sign-in");
  }

  const baseUrl = getApiBaseURL();
  if (!baseUrl) {
    redirect("/dashboard/sign-in?error=api_url");
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    redirect(`/dashboard/sign-in?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const code = res.status === 403 ? "forbidden" : "expired";
    redirect(
      `/dashboard/sign-in?error=${encodeURIComponent(
        code
      )}&message=${encodeURIComponent("Session invalid or expired. Please sign in again.")}`
    );
  }
}

export default async function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  // Make dashboard access fully API-dependent: validate the token against `/auth/me`.
  await validateDashboardSession();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px]">
        <SidebarNav />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />

          <main className="flex-1 min-h-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

