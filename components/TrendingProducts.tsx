'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

// Placeholder product data - will be replaced with API data later
const trendingProducts = [
  {
    id: 1,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-1.png",
  },
  {
    id: 2,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-2.png",
  },
  {
    id: 3,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-3.png",
  },
  {
    id: 4,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-4.png",
  },
  {
    id: 5,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-5.png",
  },
  {
    id: 6,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-6.png",
  },
  {
    id: 7,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-4.png",
  },
  {
    id: 8,
    name: "EllaOne Film-Coated tablet 30mg",
    price: 43.00,
    originalPrice: 43.00,
    rating: 5,
    image: "/assets/home/product-7.png",
  },
];

export default function TrendingProducts() {
  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#374151]">
            Trending Products
          </h2>
          <Link
            href="/products"
            className="text-[#01AC28] font-semibold text-sm md:text-base hover:underline flex items-center gap-1"
          >
            View All <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {trendingProducts.map((product) => (
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
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={product.id <= 4}
                  quality={90}
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
                  {product.originalPrice > product.price ? (
                    <>
                      <span className="text-xs md:text-sm text-[#9CA3AF] line-through">
                        Rs. {product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm md:text-base font-bold text-[#01AC28]">
                        Rs. {product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm md:text-base font-bold text-[#01AC28]">
                      Rs. {product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
