'use client';

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import { getSubcategories } from "@/lib/api/categories";
import { bucketUrl } from "@/lib/bucketUrl";
import ProductCard from "@/components/shared/ProductCard";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

function mapProductToCard(product: Product) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imageUrl = primaryImage ? bucketUrl(primaryImage.object_key) : "/assets/home/product-1.png";

  const canSellBox = !!product.can_sell_box;
  const boxPrice = Number.parseFloat(product.retail_price_box ?? "0");
  const secondaryPrice = Number.parseFloat(product.retail_price_secondary ?? "0");
  const showBoxPrice = canSellBox && Number.isFinite(boxPrice) && boxPrice > 0;
  const displayPrice = showBoxPrice ? boxPrice : secondaryPrice;

  const discount = Number.parseFloat(product.item_discount ?? "0");
  const originalPrice = discount > 0 ? displayPrice + discount : undefined;
  const discountPercent =
    originalPrice && originalPrice > 0
      ? (discount / originalPrice) * 100
      : undefined;

  return {
    id: product.id,
    name: product.item_name,
    price: Number.isFinite(displayPrice) ? displayPrice : 0,
    originalPrice,
    discountPercent,
    image: imageUrl,
    variation: product.variation_value ?? product.secondary_unit_label ?? "",
    quantity: product.secondary_unit_label
      ? `1 ${product.secondary_unit_label}`
      : "1 Unit",
    href: `/products/${product.id}`,
  };
}

interface CategoryProductSectionProps {
  category: Category;
}

export default function CategoryProductSection({ category }: CategoryProductSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", { category: category.category_name, per_page: 30 }],
    queryFn: () => getProducts({ q: category.category_name, per_page: 30 }),
    staleTime: 60 * 1000,
  });
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
    <section className="w-full bg-white py-10 md:py-14 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1F3B5C]">
              {category.category_name}
            </h2>
            <Link
              href={`/category/${category.alias.toLowerCase()}`}
              className="text-[#1F3B5C] font-semibold text-sm md:text-base hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.alias.toLowerCase()}?sub=${sub.id}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#6B7280] hover:bg-[#1F3B5C] hover:text-white transition-all"
                >
                  {sub.subcategory_name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-xl aspect-[3/4]" />
              ))
            : products.map((product) => {
                const props = mapProductToCard(product);
                return <ProductCard key={props.id} {...props} />;
              })}
        </div>
      </div>
    </section>
  );
}
