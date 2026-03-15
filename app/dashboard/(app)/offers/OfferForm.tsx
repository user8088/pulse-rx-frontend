"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { createOfferAction, updateOfferAction, getSubcategoriesForCategoryAction } from "./actions";
import type { Offer } from "@/types/offer";
import type { Category } from "@/types/category";
import type { Subcategory } from "@/types/category";

const MAX_BANNER_MB = 2;

export function OfferForm({
  categories,
  offer,
}: {
  categories: Category[];
  offer?: Offer | null;
}) {
  const isEdit = Boolean(offer?.id);
  const [scope, setScope] = useState<"category" | "subcategory">(
    offer?.subcategory_id ? "subcategory" : "category"
  );
  const initialCategoryId =
    offer?.category_id != null
      ? String(offer.category_id)
      : offer?.subcategory?.category_id != null
        ? String(offer.subcategory.category_id)
        : "";
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  useEffect(() => {
    if (scope !== "subcategory" || !categoryId) {
      setSubcategories([]);
      return;
    }
    const id = parseInt(categoryId, 10);
    if (!Number.isFinite(id)) return;
    setLoadingSubcategories(true);
    getSubcategoriesForCategoryAction(id)
      .then(setSubcategories)
      .finally(() => setLoadingSubcategories(false));
  }, [scope, categoryId]);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit offer" : "Create offer"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={isEdit ? updateOfferAction : createOfferAction}
          method="post"
          encType="multipart/form-data"
          className="flex flex-col gap-6"
        >
          {isEdit && <input type="hidden" name="offerId" value={offer!.id} />}

          <div className="grid gap-2">
            <label htmlFor="offer-name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="offer-name"
              name="name"
              required
              defaultValue={offer?.name ?? ""}
              placeholder="e.g. Summer Sale"
              className="rounded-xl focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="offer-description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="offer-description"
              name="description"
              rows={3}
              defaultValue={offer?.description ?? ""}
              placeholder="Optional short description"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="offer-discount" className="text-sm font-medium text-gray-700">
              Discount (%) <span className="text-red-500">*</span>
            </label>
            <Input
              id="offer-discount"
              name="discount_percentage"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={offer?.discount_percentage ?? ""}
              placeholder="0–100"
              className="rounded-xl focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="offer-start" className="text-sm font-medium text-gray-700">
                Start date <span className="text-red-500">*</span>
              </label>
              <Input
                id="offer-start"
                name="start_date"
                type="date"
                required
                defaultValue={offer?.start_date ?? ""}
                className="rounded-xl focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="offer-end" className="text-sm font-medium text-gray-700">
                End date <span className="text-red-500">*</span>
              </label>
              <Input
                id="offer-end"
                name="end_date"
                type="date"
                required
                defaultValue={offer?.end_date ?? ""}
                className="rounded-xl focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <span className="text-sm font-medium text-gray-700">Applies to <span className="text-red-500">*</span></span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="category"
                  checked={scope === "category"}
                  onChange={() => setScope("category")}
                  className="rounded-full border-gray-300 text-[#01AC28] focus:ring-[#01AC28]"
                />
                <span className="text-sm font-medium text-gray-800">Category</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="subcategory"
                  checked={scope === "subcategory"}
                  onChange={() => setScope("subcategory")}
                  className="rounded-full border-gray-300 text-[#01AC28] focus:ring-[#01AC28]"
                />
                <span className="text-sm font-medium text-gray-800">Subcategory</span>
              </label>
            </div>

            {scope === "category" && (
              <div className="grid gap-2">
                <label htmlFor="offer-category" className="text-sm font-medium text-gray-600">
                  Category
                </label>
                <select
                  id="offer-category"
                  name="category_id"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === "subcategory" && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="offer-category-sub" className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <select
                    id="offer-category-sub"
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategories([]);
                    }}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
                  >
                    <option value="">Select category first</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="offer-subcategory" className="text-sm font-medium text-gray-600">
                    Subcategory
                  </label>
                  <select
                    id="offer-subcategory"
                    name="subcategory_id"
                    required={scope === "subcategory"}
                    disabled={!categoryId || loadingSubcategories}
                    defaultValue={offer?.subcategory_id ?? ""}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-[#01AC28]"
                  >
                    <option value="">
                      {loadingSubcategories ? "Loading…" : !categoryId ? "Select category first" : "Select subcategory"}
                    </option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subcategory_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="offer-banner" className="text-sm font-medium text-gray-700">
              Banner image (optional, max {MAX_BANNER_MB}MB)
            </label>
            <input
              id="offer-banner"
              name="banner"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#01AC28] file:px-4 file:py-2 file:text-white file:font-bold"
            />
            {isEdit && offer?.banner_url && (
              <p className="text-xs text-gray-500">Current banner is set. Upload a new file to replace it.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <PendingSubmitButton
              className="rounded-xl bg-[#01AC28] hover:bg-[#044644] text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5"
              pendingText="Saving…"
            >
              {isEdit ? "Update offer" : "Create offer"}
            </PendingSubmitButton>
            <Link
              href="/dashboard/offers"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
