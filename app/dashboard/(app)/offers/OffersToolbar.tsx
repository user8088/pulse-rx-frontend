"use client";

import Link from "@/lib/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { Plus } from "lucide-react";
import type { Category } from "@/types/category";
import type { Subcategory } from "@/types/category";

export function OffersToolbar({
  total,
  showing,
  categories,
  subcategories,
  activeFilter,
  categoryIdFilter,
  subcategoryIdFilter,
}: {
  total: number;
  showing: number;
  categories: Category[];
  subcategories: Subcategory[];
  activeFilter: string;
  categoryIdFilter: string;
  subcategoryIdFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const apply = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname ?? "/dashboard/offers");
  };

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeFilter}
            onChange={(e) => apply({ active: e.target.value || undefined })}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
          >
            <option value="">All offers</option>
            <option value="1">Active only</option>
            <option value="0">Inactive only</option>
          </select>
          <select
            value={categoryIdFilter}
            onChange={(e) => {
              apply({ category_id: e.target.value || undefined, subcategory_id: undefined });
            }}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.category_name}
              </option>
            ))}
          </select>
          <select
            value={subcategoryIdFilter}
            onChange={(e) => apply({ subcategory_id: e.target.value || undefined })}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
          >
            <option value="">All subcategories</option>
            {subcategories.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.subcategory_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 font-medium">
            Showing {showing} of {total}
          </span>
          <Link
            href="/dashboard/offers/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#01AC28] hover:bg-[#044644] text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <Plus className="w-4 h-4" /> Create offer
          </Link>
        </div>
      </div>
    </div>
  );
}
