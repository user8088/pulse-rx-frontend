"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Product, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductTableRow } from "./ProductTableRow";
import { X, CheckSquare } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  canApproveOrReject,
  canDeleteProducts,
  isProductAwaitingPublication,
} from "@/lib/dashboardRoles";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { bulkApproveProducts, bulkDeleteProducts } from "./actions";

export function ProductsTable({
  products,
  categories,
  query,
  total,
  viewerRole,
}: {
  products: Product[];
  categories: Category[];
  query?: string;
  total?: number;
  viewerRole: User["role"];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = query ?? "";
  const [draft, setDraft] = useState(() => urlQuery);
  const [focused, setFocused] = useState(false);

  const bulkEnabled = canApproveOrReject(viewerRole) || canDeleteProducts(viewerRole);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  const productIdsOnPage = useMemo(() => products.map((p) => p.id), [products]);

  useEffect(() => {
    setSelected((prev) => {
      const allowed = new Set(productIdsOnPage);
      const next = new Set<number>();
      prev.forEach((id) => {
        if (allowed.has(id)) next.add(id);
      });
      return next;
    });
  }, [productIdsOnPage]);

  const selectableIds = useMemo(() => new Set(productIdsOnPage), [productIdsOnPage]);

  const allSelected =
    selectableIds.size > 0 && [...selectableIds].every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const idsEligibleForPublish = useMemo(
    () => products.filter((p) => isProductAwaitingPublication(p)).map((p) => p.id),
    [products]
  );

  const selectedForPublish = useMemo(() => {
    const eligible = new Set(idsEligibleForPublish);
    return [...selected].filter((id) => eligible.has(id));
  }, [selected, idsEligibleForPublish]);

  const toggleOne = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (selectableIds.size === 0) return new Set();
      const allOn = [...selectableIds].every((id) => prev.has(id));
      if (allOn) return new Set();
      return new Set(selectableIds);
    });
  }, [selectableIds]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // Sync from URL only when NOT typing (prevents "cutting letters" while router updates).
  useEffect(() => {
    if (focused) return;
    setDraft(urlQuery);
  }, [urlQuery, focused]);

  const showingText = useMemo(() => {
    if (typeof total === "number") {
      return (
        <>
          Showing <span className="font-semibold text-gray-900">{products.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{total}</span>
        </>
      );
    }
    return (
      <>
        Showing <span className="font-semibold text-gray-900">{products.length}</span>
      </>
    );
  }, [products.length, total]);

  const commitSearch = (value: string) => {
    const sp = new URLSearchParams(searchParams?.toString());
    const v = value.trim();
    if (v) sp.set("q", v);
    else sp.delete("q");
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const dirty = draft.trim() !== urlQuery.trim();
  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => commitSearch(draft), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty]);

  const colCount = bulkEnabled ? 7 : 6;

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Products</CardTitle>
            <div className="mt-1 text-xs text-gray-500">{showingText}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitSearch(draft);
                }
              }}
              placeholder="Search all products…"
              className="w-full sm:w-72 pr-9"
            />
            {draft ? (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  commitSearch("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => commitSearch(draft)}
            disabled={!dirty}
          >
            Apply
          </Button>
        </div>
      </CardHeader>

      {bulkEnabled && someSelected ? (
        <div className="mx-4 mb-0 flex flex-col gap-3 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
            <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span>
              {selected.size} selected
              {canApproveOrReject(viewerRole) && selectedForPublish.length !== selected.size ? (
                <span className="ml-1 font-normal text-emerald-800/80">
                  ({selectedForPublish.length} ready to publish)
                </span>
              ) : null}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-9 text-xs" onClick={clearSelection}>
              Clear selection
            </Button>
            {canApproveOrReject(viewerRole) && selectedForPublish.length > 0 ? (
              <form action={bulkApproveProducts}>
                <input type="hidden" name="ids" value={JSON.stringify(selectedForPublish)} />
                <PendingSubmitButton
                  pendingText="Publishing…"
                  className="h-9 px-4 text-xs font-bold uppercase tracking-wide bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                >
                  Publish selected ({selectedForPublish.length})
                </PendingSubmitButton>
              </form>
            ) : null}
            {canDeleteProducts(viewerRole) && selected.size > 0 ? (
              <form
                action={bulkDeleteProducts}
                onSubmit={(e) => {
                  if (
                    !confirm(
                      `Delete ${selected.size} product(s)? This cannot be undone.`
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="ids" value={JSON.stringify([...selected])} />
                <PendingSubmitButton
                  pendingText="Deleting…"
                  variant="danger"
                  className="h-9 px-4 text-xs font-bold uppercase tracking-wide rounded-lg"
                >
                  Delete selected ({selected.size})
                </PendingSubmitButton>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      <CardContent className="p-0 flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm">
              <tr className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                {bulkEnabled ? (
                  <th className="w-10 px-2 py-3 align-middle">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all on this page"
                    />
                  </th>
                ) : null}
                <th className="px-3 py-3 sm:px-5">Item</th>
                <th className="hidden lg:table-cell px-3 py-3 sm:px-5">Item ID</th>
                <th className="hidden xl:table-cell px-3 py-3 sm:px-5">Category</th>
                <th className="hidden md:table-cell px-3 py-3 sm:px-5">Price</th>
                <th className="px-3 py-3 sm:px-5">Availability</th>
                <th className="px-3 py-3 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-5 py-10 text-center text-sm text-gray-500">
                    {(query ?? "").trim() ? "No products match your search." : "No products found."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    categories={categories}
                    viewerRole={viewerRole}
                    bulkSelect={
                      bulkEnabled
                        ? {
                            enabled: true,
                            selected: selected.has(product.id),
                            onToggle: () => toggleOne(product.id),
                          }
                        : undefined
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
