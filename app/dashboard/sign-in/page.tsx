import Link from "next/link";
import { dashboardSignIn } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DashboardSignInPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  const next = searchParams?.next ?? "/dashboard/inventory";
  const error = searchParams?.error;

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
              This is a mock sign-in flow (dashboard-only).
            </p>
          </div>

          <div className="p-7">
            {error === "missing" && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                Please enter an email and password.
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

              <div className="text-center text-xs text-gray-500">
                Tip: use any email/password for now.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

