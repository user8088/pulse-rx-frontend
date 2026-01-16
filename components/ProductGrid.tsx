'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          data-cursor="View Product"
          className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          {/* Product Image */}
          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle add to cart
              }}
              className="absolute bottom-3 right-3 w-10 h-10 md:w-12 md:h-12 bg-[#01AC28] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#044644] transition-colors z-10"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-3 md:p-4 flex-1 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Product Name */}
            <h3 className="text-xs md:text-sm font-semibold text-[#374151] mb-2 line-clamp-2 flex-1">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mt-auto">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-xs md:text-sm text-[#9CA3AF] line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm md:text-base font-bold text-[#01AC28]">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-sm md:text-base font-bold text-[#01AC28]">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
