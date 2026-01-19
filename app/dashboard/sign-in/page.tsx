import Link from "next/link";
import { dashboardSignIn } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function DashboardSignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; error?: string; message?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next ?? "/dashboard/inventory";
  const error = sp.error;
  const message = sp.message;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-[0.2em]"
          >
            ← Back to Store
          </Link>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm shadow-gray-100 overflow-hidden">
          <div className="p-7 border-b border-gray-100">
            <div className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.2em]">
              Dashboard Access
            </div>
            <h1 className="mt-2 text-2xl font-black text-[#374151]">Sign in</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with an admin/staff account to access the dashboard.
            </p>
          </div>

          <div className="p-7">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error === "missing"
                  ? "Please enter an email and password."
                  : error === "forbidden"
                    ? "Forbidden: this account does not have dashboard access."
                    : error === "api_url"
                      ? "API URL is not configured. Set NEXT_PUBLIC_API_URL."
                  : error === "network"
                    ? message || "Network error. Please check the API server and try again."
                  : error === "expired"
                    ? message || "Session expired. Please sign in again."
                      : message
                        ? message
                        : "Sign-in failed. Please try again."}
              </div>
            )}

            <form action={dashboardSignIn} className="space-y-5">
              <input type="hidden" name="next" value={next} />

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                  Email
                </label>
                <Input name="email" type="email" placeholder="admin@pulserxpharmacy.com" required />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                  Password
                </label>
                <Input name="password" type="password" placeholder="••••••••" required />
              </div>

              <Button type="submit" className="w-full">
                Sign in to Dashboard
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

