'use client';

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import { getSubcategories } from "@/lib/api/categories";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Category } from "@/types/category";

interface CategoryProductSectionProps {
  category: Category;
}

export default function CategoryProductSection({ category }: CategoryProductSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", { category: category.category_name, per_page: 30 }],
    queryFn: () => getProducts({ q: category.category_name, per_page: 30 }),
    staleTime: 60 * 1000,
  });
  // Filter to only products that actually belong to this category, then take first 8
  const products = (data?.data ?? [])
    .filter((p) => p.category_id === category.id)
    .slice(0, 8);

  const { data: subcategoriesData } = useQuery({
    queryKey: ["subcategories", category.id],
    queryFn: () => getSubcategories(category.id, { per_page: 50 }),
    staleTime: 60 * 1000,
  });
  const subcategories = subcategoriesData?.data ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#374151]">
              {category.category_name}
            </h2>
            <Link
              href={`/category/${category.alias.toLowerCase()}`}
              className="text-[#01AC28] font-semibold text-sm md:text-base hover:underline flex items-center gap-1"
            >
              View All <span className="text-lg">→</span>
            </Link>
          </div>
          {subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.alias.toLowerCase()}?sub=${sub.id}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#6B7280] hover:bg-[#01AC28] hover:text-white transition-all"
                >
                  {sub.subcategory_name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Skeleton loader
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 rounded-2xl aspect-[3/4]" />
            ))
          ) : (
            products.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
              const imageUrl = primaryImage ? bucketUrl(primaryImage.object_key) : "/assets/home/product-1.png"; // Fallback image
              const canSellBox = !!product.can_sell_box;
              const boxPrice = Number.parseFloat((product.retail_price_box as unknown as string) ?? "0");
              const secondaryPrice = Number.parseFloat((product.retail_price_secondary as unknown as string) ?? "0");
              const showBoxPrice = canSellBox && Number.isFinite(boxPrice) && boxPrice > 0;
              const displayPrice = showBoxPrice ? boxPrice : secondaryPrice;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  data-cursor="View Product"
                  className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.item_name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110 p-4"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                    {/* Rating placeholder */}
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
                      {product.item_name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-sm md:text-base font-bold text-[#01AC28]">
                        Rs. {Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
