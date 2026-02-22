"use client";

import React, { useMemo, useState } from "react";
import type { Category, Product, ProductImage } from "@/types";
import { tryBucketUrl } from "@/lib/bucketUrl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import {
  deleteProduct,
  deleteProductImage,
  updateProduct,
  updateProductImageMetadata,
  uploadProductImage,
} from "./actions";
import { ChevronDown, Edit2, ImagePlus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { SubcategorySelect } from "./SubcategorySelect";

function pickPrimaryImage(images: ProductImage[] | undefined) {
  const list = Array.isArray(images) ? images : [];
  if (list.length === 0) return null;
  const primary = list.find((i) => i.is_primary);
  if (primary) return primary;
  return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] ?? null;
}

function availabilityBadge(availability: string): { label: string; variant: "success" | "warning" | "danger" } {
  switch (availability) {
    case "no":
      return { label: "Unavailable", variant: "danger" };
    case "short":
      return { label: "Short supply", variant: "warning" };
    default:
      return { label: "Available", variant: "success" };
  }
}

function formatPrice(value: string | undefined | null): string {
  if (!value || value.trim() === "" || value.trim() === "0" || value.trim() === "0.00") return "—";
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n === 0) return "—";
  return `Rs. ${n.toFixed(2)}`;
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
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string | number | "";
  disabled?: boolean;
}) {
  return (
    <div className={cn("space-y-1", disabled && "opacity-60 pointer-events-none")}>
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
          disabled={disabled}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
          Rs.
        </span>
      </div>
    </div>
  );
}

export function ProductTableRow({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string>(
    product.category_id != null ? String(product.category_id) : ""
  );
  const [canSellItem, setCanSellItem] = useState(!!product.can_sell_item);
  const [canSellSecondary, setCanSellSecondary] = useState(!!product.can_sell_secondary);
  const [canSellBox, setCanSellBox] = useState(!!product.can_sell_box);
  const [secondaryLabel, setSecondaryLabel] = useState(product.secondary_unit_label ?? "Pack");
  const [boxUnitLabel, setBoxUnitLabel] = useState(product.box_unit_label ?? "Box");
  const [baseUnitLabel, setBaseUnitLabel] = useState(product.base_unit_label ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categoryName = product.category?.category_name ?? "";
  const status = availabilityBadge(product.availability);

  const primaryImage = useMemo(() => pickPrimaryImage(product.images), [product.images]);
  const primaryUrl = useMemo(
    () => tryBucketUrl(primaryImage?.object_key ?? null),
    [primaryImage?.object_key]
  );

  const sortedImages = useMemo(() => {
    const list = Array.isArray(product.images) ? [...product.images] : [];
    return list.sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  }, [product.images]);

  const itemPriceDefault =
    product.retail_price_item && String(product.retail_price_item).trim() !== ""
      ? Number.parseFloat(String(product.retail_price_item))
      : "";
  const secondaryPriceDefault =
    product.retail_price_secondary && product.retail_price_secondary.trim() !== ""
      ? Number.parseFloat(product.retail_price_secondary)
      : "";
  const boxPriceDefault =
    product.retail_price_box && product.retail_price_box.trim() !== ""
      ? Number.parseFloat(product.retail_price_box)
      : "";
  const unitPriceDefault =
    product.retail_price_unit && product.retail_price_unit.trim() !== ""
      ? Number.parseFloat(product.retail_price_unit)
      : "";
  const discountDefault =
    product.item_discount && product.item_discount.trim() !== ""
      ? Number.parseFloat(product.item_discount)
      : "";

  return (
    <>
      {/* ── Table row (read-only) ── */}
      <tr className="group hover:bg-gray-50/60 transition-colors">
        <td className="px-3 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {primaryUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={primaryUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{product.item_name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                <span className="lg:hidden text-[10px] font-mono text-gray-400">{product.item_id}</span>
                {product.brand ? <span className="font-medium">{product.brand}</span> : "No brand"}
                {categoryName ? <span className="text-gray-400">· {categoryName}</span> : null}
                {product.generic_name ? <span className="text-gray-400">· {product.generic_name}</span> : null}
                <span className="sm:hidden">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </span>
              </div>
            </div>
          </div>
        </td>

        <td className="hidden lg:table-cell px-3 py-4 sm:px-5">
          <div className="text-sm font-semibold text-gray-700">{product.item_id}</div>
          <div className="text-[10px] text-gray-400 font-mono">#{product.id}</div>
        </td>

        <td className="hidden xl:table-cell px-3 py-4 sm:px-5">
          <span className="text-sm text-gray-600">{categoryName || "—"}</span>
        </td>

        <td className="hidden md:table-cell px-3 py-4 sm:px-5">
          <span className="text-sm font-semibold text-gray-700">
            {formatPrice(product.retail_price_secondary)}
          </span>
        </td>

        <td className="px-3 py-4 sm:px-5">
          <Badge variant={status.variant}>{status.label}</Badge>
        </td>

        <td className="px-3 py-4 sm:px-5 text-right">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-[#01AC28] sm:h-9 sm:w-9"
              onClick={() => setIsEditing((v) => !v)}
              title="Edit"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>

            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmingSubmitButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 sm:h-9 sm:w-9"
                confirmMessage={`Delete "${product.item_name}"? This cannot be undone.`}
                pendingText=""
                showSpinner={true}
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmingSubmitButton>
            </form>
          </div>
        </td>
      </tr>

      {/* ── Edit panel ── */}
      {isEditing ? (
        <tr>
          <td colSpan={6} className="px-3 sm:px-5 pb-8">
            <div className="mt-2 rounded-xl border border-gray-200 bg-[#f8f9fa] p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Edit Product</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Update item details and manage images.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* ─── LEFT COLUMN ─── */}
                <form
                  action={async (fd) => {
                    await updateProduct(fd);
                    setIsEditing(false);
                  }}
                  className="space-y-5 lg:col-span-7"
                >
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="can_sell_item" value={canSellItem ? "true" : "false"} />
                  <input type="hidden" name="can_sell_secondary" value={canSellSecondary ? "true" : "false"} />
                  <input type="hidden" name="can_sell_box" value={canSellBox ? "true" : "false"} />
                  <input type="hidden" name="secondary_unit_label" value={secondaryLabel} />
                  <input type="hidden" name="box_unit_label" value={boxUnitLabel} />
                  <input type="hidden" name="base_unit_label" value={baseUnitLabel} />

                  {/* ── SECTION 1 : Basic Information ── */}
                  <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <SectionBadge n={1} />
                      <span className="text-sm font-bold text-gray-900">Basic Information</span>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Product Name</label>
                          <Input name="item_name" defaultValue={product.item_name} required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Item ID</label>
                          <Input name="item_id" defaultValue={product.item_id} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Brand</label>
                          <Input name="brand" defaultValue={product.brand ?? ""} placeholder="e.g. HealthSafe" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Category</label>
                          <select
                            name="category_id"
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className={selectClass}
                          >
                            <option value="">— None —</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.category_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Generic Name</label>
                          <Input name="generic_name" defaultValue={product.generic_name ?? ""} placeholder="e.g. Paracetamol" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Availability</label>
                          <select name="availability" defaultValue={product.availability ?? "yes"} className={selectClass}>
                            <option value="yes">Available</option>
                            <option value="short">Short supply</option>
                            <option value="no">Unavailable</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Subcategories</label>
                        <SubcategorySelect
                          categoryId={editCategoryId || null}
                          selectedIds={product.subcategories?.map((s) => s.id) ?? []}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 2 : Pricing Options ── */}
                  <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <SectionBadge n={2} />
                      <span className="text-sm font-bold text-gray-900">Pricing Options</span>
                    </div>

                    {/* Yellow highlight box */}
                    <div className="rounded-lg bg-amber-50/80 border border-amber-200/60 px-4 py-3 space-y-2.5">
                      <p className="text-sm font-semibold text-gray-800">How will you sell this?</p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={canSellItem}
                            onChange={(e) => setCanSellItem(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Sell per item (e.g. per tablet)
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={canSellSecondary}
                            onChange={(e) => setCanSellSecondary(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Sell per secondary unit (strip, pack)
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={canSellBox}
                            onChange={(e) => setCanSellBox(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Sell per box
                        </label>
                      </div>
                    </div>

                    {/* Dynamic pricing fields */}
                    {(canSellItem || canSellSecondary || canSellBox) ? (
                      <div className="space-y-4">
                        {/* Item tier */}
                        {canSellItem && (
                          <div className="space-y-3">
                            <PriceField
                              label="Price per item (e.g. per tablet)"
                              name="retail_price_item"
                              defaultValue={itemPriceDefault}
                            />
                          </div>
                        )}

                        {/* Secondary tier */}
                        {canSellSecondary && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">Secondary tier label</label>
                              <Input
                                value={secondaryLabel}
                                onChange={(e) => setSecondaryLabel(e.target.value)}
                                placeholder="e.g. Strip, Pack, Piece, Sachet"
                              />
                            </div>
                            <PriceField
                              label="Price per secondary unit"
                              name="retail_price_secondary"
                              defaultValue={secondaryPriceDefault}
                            />
                          </div>
                        )}

                        {/* Box tier */}
                        {canSellBox && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">Box tier label</label>
                              <Input
                                value={boxUnitLabel}
                                onChange={(e) => setBoxUnitLabel(e.target.value)}
                                placeholder="e.g. Box, Pack, Carton"
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <PriceField
                                label="Price per box"
                                name="retail_price_box"
                                defaultValue={boxPriceDefault}
                              />
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Units per box (pack_qty)</label>
                                <Input
                                  name="pack_qty"
                                  type="number"
                                  min={0}
                                  step={1}
                                  defaultValue={product.pack_qty ?? ""}
                                  placeholder="e.g. 24"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Base unit (optional) */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Base unit label (optional)</label>
                          <Input
                            value={baseUnitLabel}
                            onChange={(e) => setBaseUnitLabel(e.target.value)}
                            placeholder="e.g. Tablet, Capsule, Bottle"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-3">
                        Select at least one selling option to configure pricing.
                      </p>
                    )}
                  </div>

                  {/* ── Advanced Settings (collapsible) ── */}
                  <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((v) => !v)}
                      className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-[13px]">
                          ⚙
                        </span>
                        <span className="text-sm font-bold text-gray-900">Advanced Settings</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", showAdvanced && "rotate-180")} />
                    </button>

                    {showAdvanced && (
                      <div className="border-t border-gray-100 p-5 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Supplier Price (Internal)</label>
                          <Input
                            name="retail_price_unit"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={unitPriceDefault}
                            placeholder="0.00"
                          />
                          <p className="text-[11px] text-gray-400 mt-1">For margin calculations only. Not shown to customers.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Strip Qty</label>
                            <Input
                              name="strip_qty"
                              type="number"
                              min={0}
                              step={1}
                              defaultValue={product.strip_qty ?? ""}
                              placeholder="—"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Discount</label>
                            <Input
                              name="item_discount"
                              type="number"
                              min={0}
                              step="0.01"
                              defaultValue={discountDefault}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
                            <input name="is_narcotic" type="checkbox" value="true" defaultChecked={product.is_narcotic} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            Narcotic
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
                            <input name="cold_chain_needed" type="checkbox" value="true" defaultChecked={product.cold_chain_needed} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            Cold chain needed
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Bottom actions ── */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="h-10 px-6 rounded-lg text-sm font-medium">
                      Cancel
                    </Button>
                    <PendingSubmitButton pendingText="Saving…" className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold">
                      Save Product
                    </PendingSubmitButton>
                  </div>
                </form>

                {/* ─── RIGHT COLUMN : Product Images ─── */}
                <div className="space-y-5 lg:col-span-5">
                  <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <SectionBadge n={3} />
                      <span className="text-sm font-bold text-gray-900">Product Images</span>
                    </div>

                    {/* Upload area */}
                    <form action={uploadProductImage} className="relative group">
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-6 transition-all group-hover:bg-gray-50 group-hover:border-gray-300">
                        <input type="hidden" name="product_id" value={product.id} />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-gray-400 group-hover:text-emerald-500 transition-colors">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <input
                            name="file"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            required
                          />
                          <p className="text-xs font-semibold text-gray-700">Click to upload image</p>
                          <p className="mt-1 text-[10px] text-gray-400">PNG, JPG or WebP up to 5MB</p>
                        </div>

                        <label className="relative z-20 mt-2 flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
                          <input name="is_primary" type="checkbox" value="true" defaultChecked className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          Set as primary image
                        </label>

                        <PendingSubmitButton pendingText="Uploading…" className="relative z-20 mt-1 h-8 px-4 text-xs font-semibold bg-gray-900 text-white hover:bg-black rounded-lg">
                          Upload Now
                        </PendingSubmitButton>
                      </div>
                    </form>

                    {/* Image gallery */}
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-gray-500">
                        Manage Images ({sortedImages.length})
                      </span>

                      {sortedImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-gray-50/50 border border-gray-100">
                          <p className="text-xs font-medium text-gray-400">No images uploaded yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {sortedImages.map((img) => {
                            const url = tryBucketUrl(img.object_key);
                            return (
                              <div
                                key={img.id}
                                className={cn(
                                  "group/item relative rounded-lg border overflow-hidden aspect-square",
                                  img.is_primary
                                    ? "border-emerald-300 ring-2 ring-emerald-100"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                              >
                                {url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <ImagePlus className="h-5 w-5 text-gray-300" />
                                  </div>
                                )}

                                {img.is_primary && (
                                  <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}

                                {/* Hover overlay with actions */}
                                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/40 transition-colors flex items-end justify-center gap-1 pb-2 opacity-0 group-hover/item:opacity-100">
                                  {!img.is_primary && (
                                    <form action={updateProductImageMetadata}>
                                      <input type="hidden" name="product_id" value={product.id} />
                                      <input type="hidden" name="image_id" value={img.id} />
                                      <input type="hidden" name="is_primary" value="true" />
                                      <PendingSubmitButton
                                        variant="secondary"
                                        size="sm"
                                        pendingText=""
                                        showSpinner={true}
                                        className="h-7 px-2 text-[9px] bg-white/90 border-0 text-gray-700 hover:bg-white rounded shadow-sm"
                                      >
                                        <Star className="h-3 w-3 mr-0.5" />
                                        Primary
                                      </PendingSubmitButton>
                                    </form>
                                  )}
                                  <form action={deleteProductImage}>
                                    <input type="hidden" name="product_id" value={product.id} />
                                    <input type="hidden" name="image_id" value={img.id} />
                                    <ConfirmingSubmitButton
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 bg-red-500/90 hover:bg-red-600 text-white border-0 rounded shadow-sm"
                                      confirmMessage="Delete image?"
                                      pendingText=""
                                      showSpinner={true}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </ConfirmingSubmitButton>
                                  </form>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
