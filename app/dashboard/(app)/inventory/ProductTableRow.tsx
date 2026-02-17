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
import { Edit2, ImagePlus, Star, Trash2, X } from "lucide-react";
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

  return (
    <>
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
            {formatPrice(product.retail_price_unit)}
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

      {isEditing ? (
        <tr>
          <td colSpan={6} className="px-5 pb-8">
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Edit Product</h4>
                  <p className="text-xs text-gray-500">Update item details and manage images.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <form
                  action={async (fd) => {
                    await updateProduct(fd);
                    setIsEditing(false);
                  }}
                  className="space-y-5 lg:col-span-7"
                >
                  <input type="hidden" name="id" value={product.id} />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Item Name
                      </label>
                      <Input name="item_name" defaultValue={product.item_name} required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Item ID
                      </label>
                      <Input name="item_id" defaultValue={product.item_id} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Brand (optional)
                      </label>
                      <Input name="brand" defaultValue={product.brand ?? ""} placeholder="e.g. HealthSafe" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Generic Name (optional)
                      </label>
                      <Input name="generic_name" defaultValue={product.generic_name ?? ""} placeholder="e.g. Paracetamol" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Category
                      </label>
                      <select
                        name="category_id"
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all"
                      >
                        <option value="">— None —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Availability
                      </label>
                      <select
                        name="availability"
                        defaultValue={product.availability ?? "yes"}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all"
                      >
                        <option value="yes">Available</option>
                        <option value="short">Short supply</option>
                        <option value="no">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                      Subcategories
                    </label>
                    <SubcategorySelect
                      categoryId={editCategoryId || null}
                      selectedIds={product.subcategories?.map((s) => s.id) ?? []}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Price (Unit)
                      </label>
                      <Input
                        name="retail_price_unit"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          product.retail_price_unit && product.retail_price_unit.trim() !== ""
                            ? Number.parseFloat(product.retail_price_unit)
                            : ""
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Price (Strip)
                      </label>
                      <Input
                        name="retail_price_strip"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          product.retail_price_strip && product.retail_price_strip.trim() !== ""
                            ? Number.parseFloat(product.retail_price_strip)
                            : ""
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Price (Box)
                      </label>
                      <Input
                        name="retail_price_box"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          product.retail_price_box && product.retail_price_box.trim() !== ""
                            ? Number.parseFloat(product.retail_price_box)
                            : ""
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Pack Qty
                      </label>
                      <Input
                        name="pack_qty"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={product.pack_qty ?? ""}
                        placeholder="—"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Strip Qty
                      </label>
                      <Input
                        name="strip_qty"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={product.strip_qty ?? ""}
                        placeholder="—"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                        Discount
                      </label>
                      <Input
                        name="item_discount"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          product.item_discount && product.item_discount.trim() !== ""
                            ? Number.parseFloat(product.item_discount)
                            : ""
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-medium text-gray-600 cursor-pointer">
                      <input name="is_narcotic" type="checkbox" value="true" defaultChecked={product.is_narcotic} className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      Narcotic
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-medium text-gray-600 cursor-pointer">
                      <input name="cold_chain_needed" type="checkbox" value="true" defaultChecked={product.cold_chain_needed} className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      Cold chain needed
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <PendingSubmitButton pendingText="Saving…" className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold">
                      Save Changes
                    </PendingSubmitButton>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="h-10 px-6 rounded-lg text-sm font-medium">
                      Cancel
                    </Button>
                  </div>
                </form>

                <div className="space-y-6 lg:col-span-5 lg:border-l lg:border-gray-100 lg:pl-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
                      Add New Image
                    </label>

                    <form action={uploadProductImage} className="relative group">
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/30 p-6 transition-all group-hover:bg-gray-50 group-hover:border-gray-200">
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
                        
                        <label className="relative z-20 mt-2 flex items-center gap-2 text-[11px] font-medium text-gray-600 cursor-pointer">
                          <input name="is_primary" type="checkbox" value="true" defaultChecked className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          Set as primary image
                        </label>

                        <PendingSubmitButton pendingText="Uploading…" className="relative z-20 mt-2 h-8 px-4 text-xs font-semibold bg-gray-900 text-white hover:bg-black rounded-lg">
                          Upload Now
                        </PendingSubmitButton>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        Manage Images ({sortedImages.length})
                      </span>
                    </div>

                    {sortedImages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-gray-50/50 border border-gray-100">
                        <p className="text-xs font-medium text-gray-400">No images uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {sortedImages.map((img) => {
                          const url = tryBucketUrl(img.object_key);
                          return (
                            <div
                              key={img.id}
                              className={cn(
                                "group/item flex items-center justify-between gap-3 rounded-xl border p-2 transition-all",
                                img.is_primary ? "bg-amber-50/30 border-amber-100/50" : "bg-white border-gray-100 hover:border-gray-200"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 shadow-sm">
                                  {url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center"><ImagePlus className="h-4 w-4 text-gray-300" /></div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-semibold text-gray-700 truncate max-w-[140px]">
                                    {img.object_key.split('/').pop()}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-gray-400">Order: {img.sort_order}</span>
                                    {img.is_primary && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase tracking-tight bg-amber-100/50 px-1.5 rounded">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                {!img.is_primary ? (
                                  <form action={updateProductImageMetadata}>
                                    <input type="hidden" name="product_id" value={product.id} />
                                    <input type="hidden" name="image_id" value={img.id} />
                                    <input type="hidden" name="is_primary" value="true" />
                                    <PendingSubmitButton
                                      variant="secondary"
                                      size="sm"
                                      pendingText=""
                                      showSpinner={true}
                                      className="h-8 px-2.5 text-[10px] bg-white border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg shadow-xs"
                                      title="Set as primary"
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      Make primary
                                    </PendingSubmitButton>
                                  </form>
                                ) : (
                                  <div className="h-8 px-2.5 flex items-center justify-center text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-lg">
                                    <Star className="h-3 w-3 mr-1 fill-amber-500" />
                                    Primary
                                  </div>
                                )}

                                <form action={deleteProductImage}>
                                  <input type="hidden" name="product_id" value={product.id} />
                                  <input type="hidden" name="image_id" value={img.id} />
                                  <ConfirmingSubmitButton
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    confirmMessage="Delete image?"
                                    pendingText=""
                                    showSpinner={true}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
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
          </td>
        </tr>
      ) : null}
    </>
  );
}
