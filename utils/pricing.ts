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
