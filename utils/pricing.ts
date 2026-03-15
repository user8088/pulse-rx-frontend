/**
 * Apply a percentage discount to a price.
 * Used for customer-level discount (e.g. discount_percentage from customer profile).
 */
export function applyCustomerDiscount(
  price: number,
  discountPercent: number
): { discountedPrice: number; originalPrice: number } {
  if (!Number.isFinite(price) || price < 0) {
    return { discountedPrice: 0, originalPrice: 0 };
  }
  if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
    return { discountedPrice: price, originalPrice: price };
  }
  const pct = Math.min(100, Math.max(0, discountPercent));
  const discountedPrice = Math.round(price * (1 - pct / 100) * 100) / 100;
  return { discountedPrice, originalPrice: price };
}

export type UnitTier = "item" | "secondary" | "box";

/**
 * Compute line discount: the greatest of product, customer, and offer discount.
 * All apply only when unit_type is the product's top tier.
 * For items inside a box/pack (non–top tier), line discount = 0.
 * Used for cart preview and checkout estimation.
 */
export function computeLineDiscount(
  unitPrice: number,
  quantity: number,
  itemDiscountPercent: number,
  customerDiscountPercent: number,
  unitType: UnitTier,
  topTier: UnitTier,
  offerDiscountPercent?: number
): number {
  if (!Number.isFinite(unitPrice) || !Number.isFinite(quantity) || quantity < 1) return 0;
  const isTopTier = unitType === topTier;
  if (!isTopTier) return 0;
  const lineTotalBeforeDiscount = unitPrice * quantity;
  const productPct = Number.isFinite(itemDiscountPercent) ? Math.min(100, Math.max(0, itemDiscountPercent)) : 0;
  const productDiscount = productPct > 0 ? Math.round(lineTotalBeforeDiscount * (productPct / 100) * 100) / 100 : 0;
  const customerPct = Number.isFinite(customerDiscountPercent) ? Math.min(100, Math.max(0, customerDiscountPercent)) : 0;
  const customerDiscount = customerPct > 0 ? Math.round(lineTotalBeforeDiscount * (customerPct / 100) * 100) / 100 : 0;
  const offerPct = Number.isFinite(offerDiscountPercent) ? Math.min(100, Math.max(0, offerDiscountPercent)) : 0;
  const offerDiscount = offerPct > 0 ? Math.round(lineTotalBeforeDiscount * (offerPct / 100) * 100) / 100 : 0;
  const discount = Math.max(productDiscount, customerDiscount, offerDiscount);
  return Math.round(discount * 100) / 100;
}

export type DiscountSource = "product" | "customer" | "offer";

/**
 * Effective discount per unit to show on product listing/detail.
 * Product, customer, and offer discounts apply only for the product's top tier.
 * For top tier: show the greatest of (product %, customer %, offer %). For other tiers: no discount.
 */
export function effectiveDiscountPerUnit(
  unitPrice: number,
  itemDiscountPercent: number,
  customerDiscountPercent: number,
  isTopTier: boolean,
  offerDiscountPercent?: number
): { amount: number; isCustomerDiscount: boolean; source: DiscountSource; effectivePercent: number } {
  if (!isTopTier) return { amount: 0, isCustomerDiscount: false, source: "product", effectivePercent: 0 };
  const productPct = Number.isFinite(itemDiscountPercent) ? Math.min(100, Math.max(0, itemDiscountPercent)) : 0;
  const productAmount = productPct > 0 ? Math.round(unitPrice * (productPct / 100) * 100) / 100 : 0;
  const customerPct = Number.isFinite(customerDiscountPercent) ? Math.min(100, Math.max(0, customerDiscountPercent)) : 0;
  const customerAmount = customerPct > 0 ? Math.round(unitPrice * (customerPct / 100) * 100) / 100 : 0;
  const offerPct = Number.isFinite(offerDiscountPercent) ? Math.min(100, Math.max(0, offerDiscountPercent)) : 0;
  const offerAmount = offerPct > 0 ? Math.round(unitPrice * (offerPct / 100) * 100) / 100 : 0;
  const best = Math.max(productAmount, customerAmount, offerAmount);
  const effectivePercent = unitPrice > 0 ? Math.round((best / unitPrice) * 100) : 0;
  if (best <= 0) return { amount: 0, isCustomerDiscount: false, source: "product", effectivePercent: 0 };
  if (customerAmount >= best) return { amount: best, isCustomerDiscount: true, source: "customer", effectivePercent };
  if (offerAmount >= best) return { amount: best, isCustomerDiscount: false, source: "offer", effectivePercent };
  return { amount: best, isCustomerDiscount: false, source: "product", effectivePercent };
}
