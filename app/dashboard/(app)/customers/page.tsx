import Link from "@/lib/navigation";
import { getCustomers } from "@/lib/api/dashboardCustomers";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CustomersToolbar } from "./CustomersToolbar";

export default async function DashboardCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string; message?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const message = sp.message;
  const error = sp.error;

  const data = await getCustomers({ page, per_page: 15, q: q || undefined });
  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? null;
  const to = data?.to ?? null;

  const paginationParams: Record<string, string> = {};
  if (q) paginationParams.q = q;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Customers
        </div>
        <h2 className="mt-0.5 text-2xl font-bold text-gray-900">Customer list</h2>
        <p className="mt-1 text-sm text-gray-500">
          View, edit, and import customers. Manage medical profiles and order history.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            error
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CustomersToolbar query={q} total={total} showing={customers.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">
                  City
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Discount
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {c.city || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.discount_percentage != null && c.discount_percentage > 0
                        ? `${c.discount_percentage}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-wider"
                      >
                        View
                      </Link>
                      <span className="mx-2 text-gray-300">|</span>
                      <Link
                        href={`/dashboard/customers/${c.id}?tab=info`}
                        className="text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && lastPage > 1 ? (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              basePath="/dashboard/customers"
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              from={from}
              to={to}
              params={Object.keys(paginationParams).length ? paginationParams : undefined}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
