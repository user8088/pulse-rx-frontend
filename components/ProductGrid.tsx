'use client';

import ProductCard from "@/components/shared/ProductCard";

export interface ProductGridItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  /** Product discount percentage (item_discount 0–100). Applied only on product's top tier. */
  itemDiscount?: number;
  /** Best offer % for this product's category/subcategory (0–100). Applied only on top tier. */
  offerPercent?: number;
  /** Product's top tier: box if can_sell_box, else secondary, else item. */
  topTier?: "item" | "secondary" | "box";
  image: string;
  variation?: string;
  quantity?: string;
  unitType?: "item" | "secondary" | "box";
  requiresPrescription?: boolean;
  inStock?: boolean;
}

interface ProductGridProps {
  products: ProductGridItem[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          discountPercent={product.discountPercent}
          itemDiscount={product.itemDiscount}
          offerPercent={product.offerPercent}
          topTier={product.topTier}
          image={product.image}
          variation={product.variation}
          quantity={product.quantity}
          unitType={product.unitType}
          requiresPrescription={product.requiresPrescription}
          inStock={product.inStock}
          href={`/products/${product.id}`}
        />
      ))}
    </div>
  );
}
