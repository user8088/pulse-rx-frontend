'use client';

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";

export default function TopCategories() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ per_page: 20 }),
    staleTime: 60 * 1000,
  });
  const categories = (data?.data ?? []).slice(0, 3);

  return (
    <section className="w-full bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.alias.toLowerCase()}`}
              data-cursor="View Products"
              className="group relative block rounded-xl md:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto lg:h-[400px]"
            >
              {/* Image */}
              <div className="relative w-full h-full bg-gray-100">
                {/* Fallback color if no image exists for category in this schema yet */}
                <div className="absolute inset-0 bg-gray-200" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 lg:p-8 z-20">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1">
                    {category.category_name}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base">
                    Shop Products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
