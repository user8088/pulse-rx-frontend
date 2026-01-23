"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { Modal } from "@/components/ui/Modal";
import { useFormStatus } from "react-dom";

function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsvCell(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  // Escape double quotes by doubling them, wrap in quotes if needed.
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function productsToCsv(products: Product[]) {
  const headers = [
    "id",
    "item_id",
    "item_name",
    "brand",
    "category",
    "stock_qty",
    "low_stock_threshold",
  ];
  const lines = [
    headers.join(","),
    ...products.map((p) =>
      [
        p.id,
        p.item_id,
        p.item_name,
        p.brand ?? "",
        p.category?.category_name ?? "",
        p.stock_qty,
        p.low_stock_threshold,
      ]
        .map(toCsvCell)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

function ImportInner({ onPick }: { onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onPick} disabled={pending}>
      {pending ? "Importing…" : "Import products"}
    </Button>
  );
}

export function InventoryToolbar({
  categories,
  products,
  createProductAction,
  importProductsAction,
}: {
  categories: Category[];
  products: Product[];
  createProductAction: (formData: FormData) => Promise<void>;
  importProductsAction: (formData: FormData) => Promise<void>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement | null>(null);

  const exportStats = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold).length;
    const out = products.filter((p) => p.stock_qty <= 0).length;
    return { total, low, out };
  }, [products]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          Create product
        </Button>

        {/* Import: ONLY a button (file input is hidden) */}
        <form
          action={importProductsAction}
          className="inline-flex"
          onSubmit={() => {
            // Keep the UI responsive even if the OS file picker is slow.
            fileInputRef.current?.blur();
          }}
        >
          <input
            ref={fileInputRef}
            name="file"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={() => {
              if (fileInputRef.current?.files?.length) hiddenSubmitRef.current?.click();
            }}
          />
          <button ref={hiddenSubmitRef} type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          <ImportInner onPick={() => fileInputRef.current?.click()} />
        </form>

        <Button type="button" variant="secondary" size="sm" onClick={() => setExportOpen(true)}>
          Export
        </Button>
      </div>

      <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
        This page: <span className="font-bold text-gray-700">{exportStats.total}</span> · Low:{" "}
        <span className="font-bold text-gray-700">{exportStats.low}</span> · Out:{" "}
        <span className="font-bold text-gray-700">{exportStats.out}</span>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create product"
        description="Quickly add a new product to your inventory."
      >
        <form action={createProductAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Item ID
              </label>
              <Input name="item_id" placeholder="e.g. 23223232" required />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Item Name
              </label>
              <Input name="item_name" placeholder="e.g. Face Mask" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Brand (optional)
              </label>
              <Input name="brand" placeholder="e.g. HealthSafe" />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Category
              </label>
              <select
                name="category_id"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all"
                defaultValue=""
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Stock Qty
              </label>
              <Input name="stock_qty" type="number" min={0} step={1} defaultValue={0} />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Re-order level
              </label>
              <Input name="low_stock_threshold" type="number" min={0} step={1} defaultValue={0} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <PendingSubmitButton pendingText="Creating…">Create</PendingSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export products"
        description="Download a CSV export of the products currently shown on this page."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Export includes: item id, name, brand, category, stock qty, and reorder level.
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setExportOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                const csv = productsToCsv(products);
                const stamp = new Date().toISOString().slice(0, 10);
                downloadTextFile(`products-${stamp}.csv`, csv, "text/csv;charset=utf-8");
                setExportOpen(false);
              }}
            >
              Download CSV
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

