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
import { Check, Edit2, ImagePlus, Star, Trash2, X } from "lucide-react";

function pickPrimaryImage(images: ProductImage[] | undefined) {
  const list = Array.isArray(images) ? images : [];
  if (list.length === 0) return null;
  const primary = list.find((i) => i.is_primary);
  if (primary) return primary;
  return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] ?? null;
}

function stockVariant(product: Product): { label: string; variant: "success" | "warning" | "danger" } {
  if (product.stock_qty <= 0) return { label: "Out of stock", variant: "danger" };
  if (product.stock_qty <= product.low_stock_threshold) return { label: "Low stock", variant: "warning" };
  return { label: "In stock", variant: "success" };
}

export function ProductTableRow({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  const categoryName = product.category?.category_name ?? "";
  const status = stockVariant(product);

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
              <div className="font-bold text-[#111827]">{product.item_name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                <span className="lg:hidden text-[10px] font-mono text-gray-400">{product.item_id}</span>
                {product.brand ? <span className="font-semibold">{product.brand}</span> : "No brand"}
                {categoryName ? <span className="text-gray-600">· {categoryName}</span> : null}
                <span className="sm:hidden">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </span>
              </div>
            </div>
          </div>
        </td>

        <td className="hidden lg:table-cell px-3 py-4 sm:px-5">
          <div className="text-sm font-bold text-gray-700">{product.item_id}</div>
          <div className="text-[10px] text-gray-400 font-mono">#{product.id}</div>
        </td>

        <td className="hidden xl:table-cell px-3 py-4 sm:px-5">
          <span className="text-sm text-gray-700">{categoryName || "—"}</span>
        </td>

        <td className="hidden md:table-cell px-3 py-4 sm:px-5">
          {/* API does not return retail price yet */}
        </td>

        <td className="px-3 py-4 sm:px-5">
          <span
            className={
              product.stock_qty <= 0
                ? "text-sm font-bold text-red-700"
                : product.stock_qty <= product.low_stock_threshold
                  ? "text-sm font-bold text-yellow-700"
                  : "text-sm font-bold text-green-700"
            }
          >
            {product.stock_qty}
          </span>
        </td>

        <td className="hidden md:table-cell px-3 py-4 sm:px-5">
          <span className="text-sm font-bold text-gray-700">{product.low_stock_threshold}</span>
        </td>

        <td className="hidden sm:table-cell px-3 py-4 sm:px-5">
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
          <td colSpan={8} className="px-5 pb-5">
            <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <form
                  action={async (fd) => {
                    await updateProduct(fd);
                    setIsEditing(false);
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="id" value={product.id} />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Item Name
                      </label>
                      <Input name="item_name" defaultValue={product.item_name} required />
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Item ID
                      </label>
                      <Input name="item_id" defaultValue={product.item_id} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Brand (optional)
                      </label>
                      <Input name="brand" defaultValue={product.brand ?? ""} placeholder="e.g. HealthSafe" />
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Category
                      </label>
                      <select
                        name="category_id"
                        defaultValue={product.category_id ?? ""}
                        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2"
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
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Stock Qty
                      </label>
                      <Input
                        name="stock_qty"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={product.stock_qty}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                        Re-order level
                      </label>
                      <Input
                        name="low_stock_threshold"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={product.low_stock_threshold}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PendingSubmitButton pendingText="Saving…" className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4" />
                      Save
                    </PendingSubmitButton>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                      Images
                    </div>

                    <form action={uploadProductImage} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <input type="hidden" name="product_id" value={product.id} />
                      <input
                        name="file"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="text-xs"
                        required
                      />
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <input name="is_primary" type="checkbox" value="true" defaultChecked />
                        Set as primary
                      </label>
                      <PendingSubmitButton pendingText="Uploading…" className="w-fit">
                        <ImagePlus className="h-4 w-4" />
                        Upload
                      </PendingSubmitButton>
                    </form>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#374151]">
                      Current images{" "}
                      <span className="text-gray-400">({sortedImages.length})</span>
                    </div>

                    {sortedImages.length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                        No images yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sortedImages.map((img) => {
                          const url = tryBucketUrl(img.object_key);
                          return (
                            <div
                              key={img.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                  {url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-700 truncate">
                                    {img.object_key}
                                  </div>
                                  <div className="text-[10px] font-mono text-gray-400">
                                    sort: {img.sort_order} {img.is_primary ? "· primary" : ""}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
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
                                      className="h-9 px-3"
                                      title="Set as primary"
                                    >
                                      <Star className="h-4 w-4" />
                                      Primary
                                    </PendingSubmitButton>
                                  </form>
                                ) : (
                                  <span className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-700">
                                    <Star className="h-4 w-4" />
                                    Primary
                                  </span>
                                )}

                                <form action={deleteProductImage}>
                                  <input type="hidden" name="product_id" value={product.id} />
                                  <input type="hidden" name="image_id" value={img.id} />
                                  <ConfirmingSubmitButton
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    confirmMessage="Delete this image? (This also deletes the object in storage best-effort.)"
                                    pendingText=""
                                    showSpinner={true}
                                  >
                                    <Trash2 className="h-4 w-4" />
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

