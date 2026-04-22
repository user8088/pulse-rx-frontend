import { cache } from "react";
import apiClient from "./client";
import type { Offer } from "@/types/offer";

/** Storefront API: get offers (public). Backend may return all or only active; we filter by date. */
export async function getOffers(): Promise<Offer[]> {
  try {
    const res = await apiClient.get<{ data?: Offer[] } | Offer[]>("/offers", {
      params: { active: 1 },
    });
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" && "data" in raw ? (raw as { data: Offer[] }).data : []);
    const offers = Array.isArray(list) ? list : [];
    return filterActiveOffers(offers);
  } catch {
    return [];
  }
}

const today = () => new Date().toISOString().slice(0, 10);

function filterActiveOffers(offers: Offer[]): Offer[] {
  const now = today();
  return offers.filter((o) => {
    const start = (o.start_date || "").slice(0, 10);
    const end = (o.end_date || "").slice(0, 10);
    return start && end && now >= start && now <= end;
  });
}

/** Server-side deduped within a single RSC render pass. */
export const getCachedOffers = cache(() => getOffers());
