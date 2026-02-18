"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { Modal } from "@/components/ui/Modal";
import { useFormStatus } from "react-dom";
import { SubcategorySelect } from "./SubcategorySelect";

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
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function productsToCsv(products: Product[]) {
  const headers = [
    "id",
    "item_id",
    "item_name",
    "generic_name",
    "brand",
    "category",
    "retail_price_unit",
    "retail_price_secondary",
    "retail_price_box",
    "can_sell_secondary",
    "can_sell_box",
    "secondary_unit_label",
    "availability",
    "cold_chain_needed",
    "item_discount",
  ];
  const lines = [
    headers.join(","),
    ...products.map((p) =>
      [
        p.id,
        p.item_id,
        p.item_name,
        p.generic_name ?? "",
        p.brand ?? "",
        p.category?.category_name ?? "",
        p.retail_price_unit,
        p.retail_price_secondary,
        p.retail_price_box,
        typeof p.can_sell_secondary === "boolean" ? (p.can_sell_secondary ? "true" : "false") : "",
        typeof p.can_sell_box === "boolean" ? (p.can_sell_box ? "true" : "false") : "",
        p.secondary_unit_label ?? "",
        p.availability,
        p.cold_chain_needed ? "YES" : "NO",
        p.item_discount,
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
  const [createCategoryId, setCreateCategoryId] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement | null>(null);

  const exportStats = useMemo(() => {
    const total = products.length;
    const short = products.filter((p) => p.availability === "short").length;
    const unavailable = products.filter((p) => p.availability === "no").length;
    return { total, short, unavailable };
  }, [products]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          Create product
        </Button>

        <form
          action={importProductsAction}
          className="inline-flex"
          onSubmit={() => {
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
        This page: <span className="font-bold text-gray-700">{exportStats.total}</span> · Short:{" "}
        <span className="font-bold text-gray-700">{exportStats.short}</span> · Unavailable:{" "}
        <span className="font-bold text-gray-700">{exportStats.unavailable}</span>
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
                Generic Name (optional)
              </label>
              <Input name="generic_name" placeholder="e.g. Paracetamol" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Category
              </label>
              <select
                name="category_id"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all"
                value={createCategoryId}
                onChange={(e) => setCreateCategoryId(e.target.value)}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Availability
              </label>
              <select
                name="availability"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all"
                defaultValue="yes"
              >
                <option value="yes">Available</option>
                <option value="short">Short supply</option>
                <option value="no">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Subcategories
            </label>
            <SubcategorySelect categoryId={createCategoryId || null} />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                Supplier price (unit, internal)
              </label>
              <p className="ml-1 text-[11px] text-gray-500">
                Used for margin calculations. This is <span className="font-semibold">never</span> shown to customers.
              </p>
              <Input name="retail_price_unit" type="number" min={0} step="0.01" placeholder="0.00" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                      Secondary selling tier
                    </div>
                    <p className="ml-1 mt-0.5 text-[11px] text-gray-500">
                      Customer-facing label and price (e.g. Strip, Pack, Piece).
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="can_sell_secondary"
                      value="true"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sell secondary</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                      Secondary label
                    </label>
                    <Input
                      name="secondary_unit_label"
                      placeholder="e.g. Strip, Pack, Piece"
                      defaultValue="Pack"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                      Price per secondary unit
                    </label>
                    <Input
                      name="retail_price_secondary"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                      Box selling tier
                    </div>
                    <p className="ml-1 mt-0.5 text-[11px] text-gray-500">
                      Full box price offered to customers.
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="can_sell_box"
                      value="true"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sell box</span>
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    Price per box
                  </label>
                  <Input
                    name="retail_price_box"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
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
            Export includes: item id, name, generic name, brand, category, prices (unit/secondary/box), sellable flags, secondary label, availability, cold chain, and discount.
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
