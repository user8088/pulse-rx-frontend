import Link from "@/lib/navigation";
import { getCustomerImportLog } from "@/lib/api/dashboardCustomers";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function CustomerImportLogDetailPage({
  params,
}: {
  params: Promise<{ import_uuid: string }>;
}) {
  const { import_uuid } = await params;
  const uuid = decodeURIComponent(import_uuid);

  const log = await getCustomerImportLog(uuid);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Customer import logs
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Import run</h2>
          <div className="mt-2 text-sm font-bold text-gray-700">
            <span className="font-mono break-all">{uuid}</span>
          </div>
        </div>

        <Link
          href="/dashboard/customers/import-logs"
          className="text-xs font-semibold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-widest"
        >
          ← Back
        </Link>
      </div>

      {!log ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Import log not found.
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-600">
                  Saved:{" "}
                  <span className="font-bold text-gray-700">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      Array.isArray(log.errors) && log.errors.length ? "warning" : "success"
                    }
                  >
                    {Array.isArray(log.errors) && log.errors.length
                      ? `${log.errors.length} issue${log.errors.length === 1 ? "" : "s"}`
                      : "OK"}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 text-xs font-bold text-gray-700">
                {typeof log.created_count === "number" ? log.created_count : "—"} created ·{" "}
                {typeof log.updated_count === "number" ? log.updated_count : "—"} updated ·{" "}
                {typeof log.skipped_count === "number" ? log.skipped_count : "—"} skipped ·{" "}
                {typeof log.total_rows === "number" ? log.total_rows : "—"} total rows
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Rejected rows / issues
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {Array.isArray(log.errors) && log.errors.length
                  ? "These rows were skipped or errored during import."
                  : "No issues recorded for this import."}
              </div>
            </div>

            {Array.isArray(log.errors) && log.errors.length ? (
              <div className="divide-y divide-gray-100">
                {log.errors.map((e, idx) => (
                  <div key={`${e.row}-${idx}`} className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Row {e.row}
                        </div>
                        <div className="mt-1 text-sm font-bold text-[#374151]">{e.message}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          Reason: <span className="font-mono">{e.reason}</span>
                        </div>
                      </div>
                      <Badge variant="neutral">{e.reason}</Badge>
                    </div>
                    {e.data && typeof e.data === "object" && Object.keys(e.data).length > 0 ? (
                      <details className="mt-3 group">
                        <summary className="cursor-pointer text-[10px] font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                          Raw data
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700">
                          {JSON.stringify(e.data, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                ))}
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
