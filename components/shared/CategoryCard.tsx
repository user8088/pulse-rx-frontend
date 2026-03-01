'use client';

import Link from "next/link";
import {
  Pill,
  ShoppingBag,
  Heart,
  Leaf,
  Syringe,
  Sparkles,
  Baby,
  Stethoscope,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types/category";

const aliasIconMap: Record<string, LucideIcon> = {
  MED: Pill,
  FEA: Pill,
  OTC: Stethoscope,
  FAM: Baby,
  HER: Leaf,
  HOU: ShoppingBag,
  CON: ShoppingBag,
  DEV: Syringe,
  WEL: Sparkles,
  HOR: Heart,
};

const nameIconMap: Record<string, LucideIcon> = {
  medicine: Pill,
  medicines: Pill,
  featured: Pill,
  medical: Stethoscope,
  counter: Stethoscope,
  family: Baby,
  herbal: Leaf,
  alternative: Leaf,
  household: ShoppingBag,
  cosmetic: ShoppingBag,
  consumer: ShoppingBag,
  device: Syringe,
  injectable: Syringe,
  wellness: Sparkles,
  beauty: Sparkles,
  hormonal: Heart,
  sexual: Heart,
};

function resolveIcon(category: Category): LucideIcon {
  const byAlias = aliasIconMap[category.alias.toUpperCase()];
  if (byAlias) return byAlias;

  const lowerName = category.category_name.toLowerCase();
  for (const [keyword, icon] of Object.entries(nameIconMap)) {
    if (lowerName.includes(keyword)) return icon;
  }

  return Package;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = resolveIcon(category);

  return (
    <Link
      href={`/category/${category.alias.toLowerCase()}`}
      className="group flex items-center gap-3 md:gap-4 bg-white border border-gray-200 rounded-xl px-3 py-3 md:px-4 md:py-4 hover:shadow-md hover:border-[#1F3B5C]/20 transition-all duration-200"
    >
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-[#F0F4F8] flex items-center justify-center">
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#1F3B5C]" />
      </div>
      <span className="text-xs md:text-sm font-semibold text-[#374151] leading-tight line-clamp-2 group-hover:text-[#1F3B5C] transition-colors">
        {category.category_name}
      </span>
    </Link>
  );
}
