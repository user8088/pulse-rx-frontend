"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";
import type { ViewerRole } from "@/lib/dashboardRoles";
import { isPharmacist } from "@/lib/dashboardRoles";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal } from "lucide-react";

/** Single-value API filters only (comma lists removed — backend expects known status names). */
const CATALOG_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All products" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
];

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100] as const;

function catalogOptionsForRole(role: ViewerRole) {
  if (isPharmacist(role)) {
    return CATALOG_OPTIONS.filter((o) => ["", "published", "pending_review", "rejected"].includes(o.value));
  }
  return CATALOG_OPTIONS;
}

export function InventoryFiltersBar({
  categories,
  role,
  catalogStatus,
  categoryId,
  availability,
  perPage,
}: {
  categories: Category[];
  role: ViewerRole;
  catalogStatus: string;
  categoryId: string;
  availability: string;
  perPage: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const catalogOptions = useMemo(() => catalogOptionsForRole(role), [role]);

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
    ["catalog_status", "category_id", "availability", "per_page", "page"].forEach((k) => sp.delete(k));
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const hasActiveFilters = useMemo(() => {
    if (catalogStatus) return true;
    if (categoryId) return true;
    if (availability) return true;
    if (perPage && perPage !== "15") return true;
    return false;
  }, [availability, categoryId, catalogStatus, perPage]);

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Workflow status</span>
            <select
              value={catalogStatus}
              onChange={(e) => apply({ catalog_status: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28]/25 focus:border-[#01AC28]"
            >
              {catalogOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
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
          Filters apply on the server and work with the search box in the table. Tip: choose{" "}
          <strong className="font-medium text-gray-700">Draft</strong> to see work-in-progress items, or{" "}
          <strong className="font-medium text-gray-700">Pending review</strong> for the pharmacist queue.
        </p>
      </div>
    </div>
  );
}
