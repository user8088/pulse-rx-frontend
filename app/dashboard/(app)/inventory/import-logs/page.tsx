import Link from "next/link";
import { getProductImportLogs } from "@/lib/productImportLogs";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function ImportLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = sp.page ? Number.parseInt(sp.page, 10) : undefined;

  const res = await getProductImportLogs(page);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Inventory
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Import logs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review saved logs for each product import run (by <span className="font-mono">import_uuid</span>).
          </p>
        </div>
      </div>

      {!res.ok ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {res.message}
          <div className="mt-2 text-xs text-red-600">
            Tried: <span className="font-mono">{res.tried.join(", ")}</span>
          </div>
        </div>
      ) : res.logs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          No import logs found yet.
          <div className="mt-2 text-xs text-gray-500">
            (Fetched via <span className="font-mono">{res.usedPath}</span>)
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {res.logs.map((log) => {
              const issues = Array.isArray(log.errors) ? log.errors.length : 0;
              const badgeVariant = issues ? "warning" : "success";
              const badgeText = issues ? `${issues} issue${issues === 1 ? "" : "s"}` : "OK";

              return (
                <Card key={log.import_uuid}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-black text-[#111827] truncate">
                            <span className="font-mono">{log.import_uuid}</span>
                          </div>
                          <Badge variant={badgeVariant}>{badgeText}</Badge>
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(log.created_at ?? log.updated_at)}
                        </div>

                        <div className="mt-2 text-xs font-bold text-gray-700">
                          {typeof log.created_count === "number" ? log.created_count : "—"} created ·{" "}
                          {typeof log.updated_count === "number" ? log.updated_count : "—"} updated ·{" "}
                          {typeof log.skipped_count === "number" ? log.skipped_count : "—"} skipped
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/inventory/import-logs/${encodeURIComponent(log.import_uuid)}`}
                          className="text-xs font-semibold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-widest"
                        >
                          View log →
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {typeof res.pagination?.current_page === "number" &&
          typeof res.pagination?.last_page === "number" ? (
            <Pagination
              basePath="/dashboard/inventory/import-logs"
              currentPage={res.pagination.current_page}
              lastPage={res.pagination.last_page}
              total={res.pagination.total}
              from={res.pagination.from}
              to={res.pagination.to}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

