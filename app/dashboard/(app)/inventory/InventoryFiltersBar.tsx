"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal } from "lucide-react";
import { isPharmacist } from "@/lib/dashboardRoles";

const CATALOG_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All products" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
];

const REVISION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Any revision state" },
  { value: "none", label: "No staged revision" },
  { value: "pending", label: "Revision queue (pending)" },
  { value: "rejected", label: "Revision rejected" },
];

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100] as const;

export function InventoryFiltersBar({
  categories,
  catalogStatus,
  revisionReviewStatus,
  categoryId,
  availability,
  perPage,
  viewerRole,
}: {
  categories: Category[];
  catalogStatus: string;
  revisionReviewStatus: string;
  categoryId: string;
  availability: string;
  perPage: string;
  viewerRole?: User["role"];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const apply = useCallback(
    (patch: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams?.toString());
      sp.delete("page");
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v === undefined) sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const sp = new URLSearchParams(searchParams?.toString());
    ["catalog_status", "revision_review_status", "category_id", "availability", "per_page", "page"].forEach((k) =>
      sp.delete(k)
    );
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const hasActiveFilters = useMemo(() => {
    if (catalogStatus) return true;
    if (revisionReviewStatus) return true;
    if (categoryId) return true;
    if (availability) return true;
    if (perPage && perPage !== "15") return true;
    return false;
  }, [availability, catalogStatus, categoryId, perPage, revisionReviewStatus]);

  const perPageValue = perPage || "15";

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-gradient-to-b from-white to-gray-50/40 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-gray-800">
            <SlidersHorizontal className="h-4 w-4 text-[#01AC28]" aria-hidden />
            <span className="text-sm font-semibold text-gray-900">Refine list</span>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-600 hover:text-gray-900"
              onClick={() => clearFilters()}
            >
              Clear all filters
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Catalog status</span>
            <select
              value={catalogStatus}
              onChange={(e) => apply({ catalog_status: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              {CATALOG_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Published revisions</span>
            <select
              value={revisionReviewStatus}
              onChange={(e) => apply({ revision_review_status: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              {REVISION_OPTIONS.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Category</span>
            <select
              value={categoryId}
              onChange={(e) => apply({ category_id: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Stock availability</span>
            <select
              value={availability}
              onChange={(e) => apply({ availability: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              <option value="">Any</option>
              <option value="yes">Available</option>
              <option value="short">Short supply</option>
              <option value="no">Unavailable</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Rows per page</span>
            <select
              value={perPageValue}
              onChange={(e) => {
                const v = e.target.value;
                apply({ per_page: v === "15" ? "" : v });
              }}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-[12px] leading-relaxed text-gray-500">
          Filters call <code className="rounded bg-gray-100 px-1 text-[11px]">GET /dashboard/products</code>. Use{" "}
          <strong className="font-medium text-gray-700">Revision queue (pending)</strong> for PM edits waiting on a
          pharmacist; <strong className="font-medium text-gray-700">Pending review</strong> for first-time publication
          requests; <strong className="font-medium text-gray-700">Draft</strong> for items not yet live.
        </p>
        {viewerRole && isPharmacist(viewerRole) ? (
          <p className="text-[12px] leading-relaxed text-emerald-900/90 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2">
            <strong className="font-semibold">Pharmacist:</strong> Use <strong>Draft</strong> or{" "}
            <strong>Pending review</strong> to find work. Each row has <strong>Publish</strong> (or select many →{" "}
            <strong>Publish selected</strong>). Open <strong>Review</strong> for full detail before publishing.
          </p>
        ) : null}
      </div>
    </div>
  );
}
