'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

// Placeholder product data - will be replaced with API data later
const topSellingProducts = [
  {
    id: 1,
    name: "Solgar ESTER 100 PLUS Kapsul 500MG A50",
    price: 43.00,
    rating: 5,
    image: "/assets/home/product-1.png",
  },
  {
    id: 2,
    name: "Cetirizine 50ml Coated Creme",
    price: 43.00,
    rating: 5,
    image: "/assets/home/product-2.png",
  },
  {
    id: 3,
    name: "Sunscreen® Stick 250ml 50+",
    price: 43.00,
    rating: 5,
    image: "/assets/home/product-3.png",
  },
  {
    id: 4,
    name: "Sunscreen Care 200ml Lotion",
    price: 43.00,
    rating: 5,
    image: "/assets/home/product-4.png",
  },
];

export default function TopSellingProducts() {
  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#374151]">
            Top Selling Product
          </h2>
          <Link
            href="/products?filter=top-selling"
            className="text-[#01AC28] font-semibold text-sm md:text-base hover:underline flex items-center gap-1"
          >
            View All <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {topSellingProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              data-cursor="View Product"
              className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
            >
              {/* Product Image */}
              <div className="relative w-full md:w-48 lg:w-56 aspect-square md:aspect-auto md:h-48 lg:h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 224px"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-base md:text-lg font-semibold text-[#374151] mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg md:text-xl font-bold text-[#01AC28]">
                    Rs. {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle add to cart
                    }}
                    className="bg-[#01AC28] hover:bg-[#044644] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Add To Cart</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
