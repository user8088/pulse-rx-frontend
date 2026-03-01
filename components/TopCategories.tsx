'use client';

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import CategoryCard from "@/components/shared/CategoryCard";

export default function TopCategories() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ per_page: 20 }),
    staleTime: 60 * 1000,
  });
  const categories = (data?.data ?? []).slice(0, 8);

  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-white py-10 md:py-14 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1F3B5C] mb-6 md:mb-8">
          Explore By Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="flex justify-end mt-5 md:mt-6">
          <Link
            href="/categories"
            className="text-[#1F3B5C] font-semibold text-sm md:text-base hover:underline flex items-center gap-1 transition-colors"
          >
            View All Categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
