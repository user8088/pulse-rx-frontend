"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Category, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductTableRow } from "./ProductTableRow";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProductsTable({
  products,
  categories,
  query,
  total,
}: {
  products: Product[];
  categories: Category[];
  query?: string;
  total?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = query ?? "";
  const [draft, setDraft] = useState(() => urlQuery);
  const [focused, setFocused] = useState(false);

  // Sync from URL only when NOT typing (prevents "cutting letters" while router updates).
  useEffect(() => {
    if (focused) return;
    setDraft(urlQuery);
  }, [urlQuery, focused]);

  const showingText = useMemo(() => {
    if (typeof total === "number") {
      return (
        <>
          Showing <span className="font-bold text-gray-700">{products.length}</span> of{" "}
          <span className="font-bold text-gray-700">{total}</span>
        </>
      );
    }
    return (
      <>
        Showing <span className="font-bold text-gray-700">{products.length}</span>
      </>
    );
  }, [products.length, total]);

  const commitSearch = (value: string) => {
    const sp = new URLSearchParams(searchParams?.toString());
    const v = value.trim();
    if (v) sp.set("q", v);
    else sp.delete("q");
    // Reset page when search changes.
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

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Products</CardTitle>
            <div className="mt-1 text-xs text-gray-500">
              {showingText}
            </div>
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

      <CardContent className="p-0 flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-3 py-3 sm:px-5">Item</th>
                <th className="hidden lg:table-cell px-3 py-3 sm:px-5">Item ID</th>
                <th className="hidden xl:table-cell px-3 py-3 sm:px-5">Category</th>
                <th className="px-3 py-3 sm:px-5">Stock</th>
                <th className="hidden md:table-cell px-3 py-3 sm:px-5">Reorder</th>
                <th className="hidden sm:table-cell px-3 py-3 sm:px-5">Status</th>
                <th className="px-3 py-3 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                    {(query ?? "").trim() ? "No products match your search." : "No products found."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductTableRow key={product.id} product={product} categories={categories} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

