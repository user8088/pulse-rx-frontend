"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Upload } from "lucide-react";

export function CustomersToolbar({
  query,
  total,
  showing,
}: {
  query: string;
  total: number;
  showing: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState(() => query);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    const t = setTimeout(() => setDraft(query), 0);
    return () => clearTimeout(t);
  }, [query, focused]);

  const commit = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname ?? "/dashboard/customers");
  };

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === query.trim()) return;
    const t = window.setTimeout(() => commit({ q: trimmed || undefined }), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, query]);

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit({ q: draft.trim() || undefined });
              }
            }}
            placeholder="Search by name, phone, email..."
            className="h-10 rounded-xl border border-gray-200 px-3 pr-9 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                commit({ q: undefined });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Link
          href="/dashboard/customers/import"
          className="inline-flex items-center gap-2 h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#01AC28]"
        >
          <Upload className="h-4 w-4" />
          Import customers
        </Link>
      </div>
      <div className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-900">{showing}</span> of{" "}
        <span className="font-semibold text-gray-900">{total}</span>
      </div>
    </div>
  );
}
