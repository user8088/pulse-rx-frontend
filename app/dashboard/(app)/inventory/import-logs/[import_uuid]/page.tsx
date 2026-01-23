import Link from "next/link";
import { getProductImportLogByUuid } from "@/lib/productImportLogs";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function ImportLogDetailPage({
  params,
}: {
  params: Promise<{ import_uuid: string }>;
}) {
  const { import_uuid } = await params;
  const uuid = decodeURIComponent(import_uuid);

  const res = await getProductImportLogByUuid(uuid);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Import logs
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Import run</h2>
          <div className="mt-2 text-sm font-bold text-gray-700">
            <span className="font-mono break-all">{uuid}</span>
          </div>
        </div>

        <Link
          href="/dashboard/inventory/import-logs"
          className="text-xs font-semibold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-widest"
        >
          ← Back
        </Link>
      </div>

      {!res.ok ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {res.message}
          <div className="mt-2 text-xs text-red-600">
            Tried: <span className="font-mono">{res.tried.join(", ")}</span>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-600">
                  Saved:{" "}
                  <span className="font-bold text-gray-700">
                    {formatDate(res.log.created_at ?? res.log.updated_at)}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  Source: <span className="font-mono">{res.usedPath}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={Array.isArray(res.log.errors) && res.log.errors.length ? "warning" : "success"}>
                    {Array.isArray(res.log.errors) && res.log.errors.length
                      ? `${res.log.errors.length} issue${res.log.errors.length === 1 ? "" : "s"}`
                      : "OK"}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 text-xs font-bold text-gray-700">
                {typeof res.log.created_count === "number" ? res.log.created_count : "—"} created ·{" "}
                {typeof res.log.updated_count === "number" ? res.log.updated_count : "—"} updated ·{" "}
                {typeof res.log.skipped_count === "number" ? res.log.skipped_count : "—"} skipped ·{" "}
                {typeof res.log.total_rows === "number" ? res.log.total_rows : "—"} total rows
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Rejected rows / issues
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {Array.isArray(res.log.errors) && res.log.errors.length
                  ? "These rows were skipped or errored during import."
                  : "No issues recorded for this import."}
              </div>
            </div>

            {Array.isArray(res.log.errors) && res.log.errors.length ? (
              <div className="divide-y divide-gray-100">
                {res.log.errors.map((e, idx) => {
                  const key = `${e.row}-${e.reason}-${idx}`;
                  return (
                    <div key={key} className="px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Row {e.row}
                          </div>
                          <div className="mt-1 text-sm font-bold text-[#374151]">{e.message}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Reason: <span className="font-mono">{e.reason}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            Item ID:{" "}
                            <span className="font-mono">{e.item_id === null || e.item_id === undefined ? "—" : e.item_id}</span>
                          </div>
                        </div>

                        <Badge variant="neutral">{e.reason}</Badge>
                      </div>

                      {e.data && typeof e.data === "object" ? (
                        <pre className="mt-3 overflow-auto rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700">
{JSON.stringify(e.data, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-gray-600">Nothing to show.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

