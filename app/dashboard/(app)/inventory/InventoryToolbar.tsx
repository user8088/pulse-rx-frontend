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

const selectClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all";

function SectionBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
      {n}
    </span>
  );
}

function PriceField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string | number | "";
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="relative">
        <Input
          name={name}
          type="number"
          min={0}
          step="0.01"
          className="pr-10"
          defaultValue={defaultValue}
          placeholder="0.00"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
          Rs.
        </span>
      </div>
    </div>
  );
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
  const [canSellSecondary, setCanSellSecondary] = useState(false);
  const [canSellBox, setCanSellBox] = useState(false);
  const [secondaryLabel, setSecondaryLabel] = useState("Pack");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement | null>(null);

  const exportStats = useMemo(() => {
    const total = products.length;
    const short = products.filter((p) => p.availability === "short").length;
    const unavailable = products.filter((p) => p.availability === "no").length;
    return { total, short, unavailable };
  }, [products]);

  const resetCreateState = () => {
    setCreateOpen(false);
    setCreateCategoryId("");
    setCanSellSecondary(false);
    setCanSellBox(false);
    setSecondaryLabel("Pack");
  };

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
        onClose={resetCreateState}
        title="Create product"
        description="Quickly add a new product to your inventory."
      >
        <form action={createProductAction} className="space-y-5">
          <input type="hidden" name="can_sell_secondary" value={canSellSecondary ? "true" : "false"} />
          <input type="hidden" name="can_sell_box" value={canSellBox ? "true" : "false"} />

          {/* SECTION 1: Basic Information */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <SectionBadge n={1} />
              <span className="text-sm font-bold text-gray-900">Basic Information</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Item ID</label>
                  <Input name="item_id" placeholder="e.g. 23223232" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Item Name</label>
                  <Input name="item_name" placeholder="e.g. Face Mask" required />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Brand (optional)</label>
                  <Input name="brand" placeholder="e.g. HealthSafe" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Generic Name (optional)</label>
                  <Input name="generic_name" placeholder="e.g. Paracetamol" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Category</label>
                  <select
                    name="category_id"
                    className={selectClass}
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Availability</label>
                  <select name="availability" defaultValue="yes" className={selectClass}>
                    <option value="yes">Available</option>
                    <option value="short">Short supply</option>
                    <option value="no">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Subcategories</label>
                <SubcategorySelect categoryId={createCategoryId || null} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Pricing Options */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <SectionBadge n={2} />
              <span className="text-sm font-bold text-gray-900">Pricing Options</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Supplier Price (Unit, Internal)</label>
                <Input
                  name="retail_price_unit"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Used for margin calculations only. This is <span className="font-semibold">never</span> shown to
                  customers.
                </p>
              </div>

              <div className="rounded-lg bg-amber-50/80 border border-amber-200/60 px-4 py-3 space-y-2.5">
                <p className="text-sm font-semibold text-gray-800">How will you sell this?</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={canSellSecondary}
                      onChange={(e) => setCanSellSecondary(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Sell individually (single items)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={canSellBox}
                      onChange={(e) => setCanSellBox(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Sell in boxes
                  </label>
                </div>
              </div>

              {(canSellSecondary || canSellBox) ? (
                <div className="space-y-3">
                  {canSellBox ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Unit Name</label>
                          <Input
                            name="secondary_unit_label"
                            value={secondaryLabel}
                            onChange={(e) => setSecondaryLabel(e.target.value)}
                            placeholder="e.g. Strip, Pack, Piece"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Units Per Box</label>
                          <Input
                            name="pack_qty"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="e.g. 24"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <PriceField label="Price per Unit" name="retail_price_secondary" defaultValue="" />
                        <PriceField label="Price Per Box" name="retail_price_box" defaultValue="" />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <PriceField label="Price (single item)" name="retail_price_secondary" defaultValue="" />
                      <p className="text-[11px] text-gray-400">
                        Customers will see a single price for this product. Use this when you only sell individual items.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">
                  Select at least one selling option to configure pricing.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={resetCreateState}>
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
