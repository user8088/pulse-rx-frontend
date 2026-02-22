'use client';

import ProductCard from "@/components/shared/ProductCard";

export interface ProductGridItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  variation?: string;
  quantity?: string;
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
          image={product.image}
          variation={product.variation}
          quantity={product.quantity}
          href={`/products/${product.id}`}
        />
      ))}
    </div>
  );
}
