import Link from "next/link";
import { getCustomerImportLogs } from "@/lib/api/dashboardCustomers";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function CustomerImportLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = sp.page ? Number.parseInt(sp.page, 10) : undefined;

  const data = await getCustomerImportLogs({ page, per_page: 15 });
  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? null;
  const to = data?.to ?? null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Customers
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Customer import logs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review logs for each customer import run (by <span className="font-mono">import_uuid</span>).
          </p>
        </div>
        <Link
          href="/dashboard/customers"
          className="text-xs font-semibold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-widest"
        >
          ← Customers
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          No customer import logs found yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {logs.map((log) => {
              const issues = Array.isArray(log.errors) ? log.errors.length : 0;
              const badgeVariant = issues ? "warning" : "success";
              const badgeText = issues ? `${issues} issue${issues === 1 ? "" : "s"}` : "OK";

              return (
                <Card key={log.import_uuid}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/customers/import-logs/${encodeURIComponent(log.import_uuid)}`}
                            className="text-sm font-black text-[#111827] truncate hover:text-[#01AC28]"
                          >
                            <span className="font-mono">{log.import_uuid}</span>
                          </Link>
                          <Badge variant={badgeVariant}>{badgeText}</Badge>
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </div>

                        <div className="mt-2 text-xs font-bold text-gray-700">
                          {typeof log.created_count === "number" ? log.created_count : "—"} created ·{" "}
                          {typeof log.updated_count === "number" ? log.updated_count : "—"} updated ·{" "}
                          {typeof log.skipped_count === "number" ? log.skipped_count : "—"} skipped
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/customers/import-logs/${encodeURIComponent(log.import_uuid)}`}
                        className="text-xs font-semibold text-[#01AC28] hover:underline uppercase tracking-wider"
                      >
                        View log →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {lastPage > 1 && (
            <Pagination
              basePath="/dashboard/customers/import-logs"
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              from={from}
              to={to}
            />
          )}
        </>
      )}
    </div>
  );
}
