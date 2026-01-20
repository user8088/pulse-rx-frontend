import SidebarNav from "@/components/dashboard/SidebarNav";
import { dashboardSignOut } from "@/app/dashboard/sign-in/actions";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
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
          <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                  Pulse RX
                </div>
                <div className="text-lg font-black text-[#374151] leading-tight">
                  Inventory Management
                </div>
              </div>

              <form action={dashboardSignOut}>
                <Button type="submit" variant="secondary" size="sm" className="tracking-[0.2em]">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 min-h-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

