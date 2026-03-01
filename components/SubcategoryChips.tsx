import Link from "next/link";
import type { Subcategory } from "@/types/category";

interface SubcategoryChipsProps {
  subcategories: Subcategory[];
  categoryAlias: string;
  activeSubcategoryId: number | null;
}

export default function SubcategoryChips({
  subcategories,
  categoryAlias,
  activeSubcategoryId,
}: SubcategoryChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/category/${categoryAlias}`}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          activeSubcategoryId === null
            ? "bg-[#01AC28] text-white shadow-sm"
            : "bg-gray-100 text-[#374151] hover:bg-gray-200"
        }`}
      >
        All
      </Link>
      {subcategories.map((sub) => (
        <Link
          key={sub.id}
          href={`/category/${categoryAlias}?sub=${sub.id}`}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeSubcategoryId === sub.id
              ? "bg-[#01AC28] text-white shadow-sm"
              : "bg-gray-100 text-[#374151] hover:bg-gray-200"
          }`}
        >
          {sub.subcategory_name}
        </Link>
      ))}
    </div>
  );
}
