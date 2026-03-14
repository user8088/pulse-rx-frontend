import Link from "next/link";
import { importCustomersAction } from "../actions";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function CustomerImportPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; error?: string; import_uuid?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const message = sp.message;
  const error = sp.error;
  const importUuid = sp.import_uuid;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Customers
        </div>
        <h2 className="mt-0.5 text-2xl font-bold text-gray-900">Import customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload the &quot;User Data&quot; sheet from Data Template.xlsx (or any xlsx with that sheet).
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

      {importUuid && message && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
          <p className="text-sm font-medium text-gray-700">
            View full import log (errors and details):
          </p>
          <Link
            href={`/dashboard/customers/import-logs/${encodeURIComponent(importUuid)}`}
            className="mt-2 inline-block text-sm font-semibold text-[#01AC28] hover:underline"
          >
            View import log →
          </Link>
        </div>
      )}

      <Card className="border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader className="p-5 border-b border-gray-100">
          <CardTitle className="text-sm font-extrabold text-[#374151]">
            Upload Excel file
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form action={importCustomersAction} className="space-y-4">
            <div>
              <label
                htmlFor="customer-import-file"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2"
              >
                File (xlsx or xls)
              </label>
              <input
                id="customer-import-file"
                type="file"
                name="file"
                accept=".xlsx,.xls"
                required
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-100"
              />
            </div>
            <div className="flex items-center gap-3">
              <PendingSubmitButton pendingText="Importing…">
                Import customers
              </PendingSubmitButton>
              <Link
                href="/dashboard/customers"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader className="p-5 border-b border-gray-100">
          <CardTitle className="text-sm font-extrabold text-[#374151]">
            Import logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-sm text-gray-600">
            After importing, you can view past import logs and any row-level errors.
          </p>
          <Link
            href="/dashboard/customers/import-logs"
            className="mt-3 inline-block text-sm font-semibold text-[#01AC28] hover:underline"
          >
            View all import logs →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
