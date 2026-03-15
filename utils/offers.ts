import type { Offer } from "@/types/offer";

/** Product shape needed to compute best offer % (category_id + subcategory ids). */
export interface ProductOfferInput {
  category_id: number | null;
  subcategories?: Array<{ id: number }> | null;
}

/**
 * Best offer % for a product: max of offer.discount_percentage where the offer
 * applies to the product's category or any of its subcategories.
 * Offer applies if offer.category_id === product.category_id OR
 * offer.subcategory_id is in product.subcategories.
 */
export function getBestOfferPercentForProduct(
  offers: Offer[],
  product: ProductOfferInput
): number {
  if (!product.category_id && !product.subcategories?.length) return 0;
  const subIds = new Set((product.subcategories ?? []).map((s) => s.id));
  let best = 0;
  for (const o of offers) {
    const pct = Number(o.discount_percentage);
    if (!Number.isFinite(pct) || pct <= 0) continue;
    const applies =
      (o.category_id != null && o.category_id === product.category_id) ||
      (o.subcategory_id != null && subIds.has(o.subcategory_id));
    if (applies && pct > best) best = pct;
  }
  return Math.min(100, Math.max(0, best));
}

/**
 * Offer to show on a category page: when viewing a subcategory, return offer for that subcategory;
 * when viewing a category only, return offer for that category. Returns first matching offer.
 */
export function getOfferForCategoryPage(
  offers: Offer[],
  categoryId: number,
  subcategoryId?: number | null
): Offer | null {
  for (const o of offers) {
    if (subcategoryId != null) {
      if (o.subcategory_id === subcategoryId) return o;
    } else {
      if (o.category_id === categoryId) return o;
    }
  }
  return null;
}
