"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dashboardFetch } from "@/lib/dashboardApi";
import { createOffer, updateOffer, deleteOffer } from "@/lib/api/dashboardOffers";
import type { CreateOfferBody } from "@/types/offer";
import type { Subcategory } from "@/types/category";

export async function getSubcategoriesForCategoryAction(categoryId: number): Promise<Subcategory[]> {
  try {
    const res = await dashboardFetch(`/categories/${categoryId}/subcategories?per_page=100`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

const MAX_BANNER_BYTES = 2 * 1024 * 1024; // 2MB

function toInt(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function createOfferAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Name is required."));

  const discount_percentage = toInt(formData.get("discount_percentage"));
  if (discount_percentage == null || discount_percentage < 0 || discount_percentage > 100) {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Discount must be between 0 and 100."));
  }

  const start_date = String(formData.get("start_date") ?? "").trim();
  const end_date = String(formData.get("end_date") ?? "").trim();
  if (!start_date || !end_date) {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Start and end dates are required."));
  }

  const scope = String(formData.get("scope") ?? "").trim(); // "category" | "subcategory"
  const category_id = scope === "category" ? toInt(formData.get("category_id")) : undefined;
  const subcategory_id = scope === "subcategory" ? toInt(formData.get("subcategory_id")) : undefined;

  if (scope !== "category" && scope !== "subcategory") {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Please select Category or Subcategory."));
  }
  if (scope === "category" && (category_id == null || category_id === 0)) {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Please select a category."));
  }
  if (scope === "subcategory" && (subcategory_id == null || subcategory_id === 0)) {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Please select a subcategory."));
  }

  const description = String(formData.get("description") ?? "").trim() || undefined;
  const banner = formData.get("banner");
  const bannerFile = banner instanceof File && banner.size > 0 ? banner : null;
  if (bannerFile && bannerFile.size > MAX_BANNER_BYTES) {
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent("Banner image must be 2MB or less."));
  }

  const body: CreateOfferBody = {
    name,
    description: description ?? null,
    discount_percentage: discount_percentage!,
    start_date,
    end_date,
    category_id: scope === "category" ? category_id! : null,
    subcategory_id: scope === "subcategory" ? subcategory_id! : null,
  };

  try {
    await createOffer(body, bannerFile);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create offer.";
    return redirect("/dashboard/offers/new?error=" + encodeURIComponent(msg));
  }

  revalidatePath("/dashboard/offers");
  return redirect("/dashboard/offers?message=Offer+created.");
}

export async function updateOfferAction(formData: FormData) {
  const offerId = toInt(formData.get("offerId"));
  if (offerId == null || offerId < 1) {
    return redirect("/dashboard/offers?error=" + encodeURIComponent("Invalid offer."));
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return redirect(`/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Name is required."));
  }

  const discount_percentage = toInt(formData.get("discount_percentage"));
  if (discount_percentage == null || discount_percentage < 0 || discount_percentage > 100) {
    return redirect(
      `/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Discount must be between 0 and 100.")
    );
  }

  const start_date = String(formData.get("start_date") ?? "").trim();
  const end_date = String(formData.get("end_date") ?? "").trim();
  if (!start_date || !end_date) {
    return redirect(
      `/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Start and end dates are required.")
    );
  }

  const scope = String(formData.get("scope") ?? "").trim();
  const category_id = scope === "category" ? toInt(formData.get("category_id")) : undefined;
  const subcategory_id = scope === "subcategory" ? toInt(formData.get("subcategory_id")) : undefined;

  if (scope !== "category" && scope !== "subcategory") {
    return redirect(
      `/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Please select Category or Subcategory.")
    );
  }
  if (scope === "category" && (category_id == null || category_id === 0)) {
    return redirect(`/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Please select a category."));
  }
  if (scope === "subcategory" && (subcategory_id == null || subcategory_id === 0)) {
    return redirect(
      `/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Please select a subcategory.")
    );
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const banner = formData.get("banner");
  const bannerFile = banner instanceof File && banner.size > 0 ? banner : null;
  if (bannerFile && bannerFile.size > MAX_BANNER_BYTES) {
    return redirect(
      `/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent("Banner image must be 2MB or less.")
    );
  }

  const body: CreateOfferBody = {
    name,
    description,
    discount_percentage: discount_percentage!,
    start_date,
    end_date,
    category_id: scope === "category" ? category_id! : null,
    subcategory_id: scope === "subcategory" ? subcategory_id! : null,
  };

  try {
    await updateOffer(offerId, body, bannerFile);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to update offer.";
    return redirect(`/dashboard/offers/${offerId}/edit?error=` + encodeURIComponent(msg));
  }

  revalidatePath("/dashboard/offers");
  revalidatePath(`/dashboard/offers/${offerId}/edit`);
  return redirect("/dashboard/offers?message=Offer+updated.");
}

export async function deleteOfferAction(offerId: number) {
  try {
    await deleteOffer(offerId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete offer.";
    throw new Error(msg);
  }
  revalidatePath("/dashboard/offers");
}
