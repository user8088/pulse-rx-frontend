import { dashboardFetch } from "@/lib/dashboardApi";
import type { Offer, PaginatedOffers, CreateOfferBody } from "@/types/offer";

const BASE = "/dashboard/offers";

export interface GetOffersParams {
  page?: number;
  per_page?: number;
  active?: 0 | 1;
  category_id?: number;
  subcategory_id?: number;
}

export async function getOffers(params?: GetOffersParams): Promise<PaginatedOffers | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.per_page != null) sp.set("per_page", String(params.per_page));
    if (params?.active != null) sp.set("active", String(params.active));
    if (params?.category_id != null) sp.set("category_id", String(params.category_id));
    if (params?.subcategory_id != null) sp.set("subcategory_id", String(params.subcategory_id));
    const qs = sp.toString();
    const res = await dashboardFetch(qs ? `${BASE}?${qs}` : BASE, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getOffer(id: number | string): Promise<Offer | null> {
  try {
    const res = await dashboardFetch(`${BASE}/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function buildOfferFormData(body: CreateOfferBody, banner?: File | null): FormData {
  const form = new FormData();
  form.set("name", body.name);
  if (body.description != null && body.description !== "") form.set("description", body.description);
  form.set("discount_percentage", String(body.discount_percentage));
  form.set("start_date", body.start_date);
  form.set("end_date", body.end_date);
  if (body.category_id != null) form.set("category_id", String(body.category_id));
  if (body.subcategory_id != null) form.set("subcategory_id", String(body.subcategory_id));
  if (banner) form.set("banner", banner);
  return form;
}

export async function createOffer(body: CreateOfferBody, banner?: File | null): Promise<Offer> {
  const form = buildOfferFormData(body, banner);
  const res = await dashboardFetch(BASE, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text);
      if (j.message) message = j.message;
      if (j.errors && typeof j.errors === "object") {
        const first = Object.values(j.errors as Record<string, string[]>)[0];
        if (Array.isArray(first) && first[0]) message = first[0];
      }
    } catch {
      // use text
    }
    throw new Error(message);
  }
  return res.json();
}

export async function updateOffer(
  id: number | string,
  body: Partial<CreateOfferBody> & { name?: string; start_date?: string; end_date?: string },
  banner?: File | null
): Promise<Offer> {
  const form = new FormData();
  if (body.name !== undefined) form.set("name", body.name);
  if (body.description !== undefined) form.set("description", body.description ?? "");
  if (body.discount_percentage !== undefined) form.set("discount_percentage", String(body.discount_percentage));
  if (body.start_date !== undefined) form.set("start_date", body.start_date);
  if (body.end_date !== undefined) form.set("end_date", body.end_date);
  if (body.category_id !== undefined) form.set("category_id", body.category_id == null ? "" : String(body.category_id));
  if (body.subcategory_id !== undefined) form.set("subcategory_id", body.subcategory_id == null ? "" : String(body.subcategory_id));
  if (banner) form.set("banner", banner);
  const res = await dashboardFetch(`${BASE}/${id}`, { method: "PATCH", body: form });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text);
      if (j.message) message = j.message;
      if (j.errors && typeof j.errors === "object") {
        const first = Object.values(j.errors as Record<string, string[]>)[0];
        if (Array.isArray(first) && first[0]) message = first[0];
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function deleteOffer(id: number | string): Promise<void> {
  const res = await dashboardFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}
