'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { getCategories, getSubcategories } from "@/lib/api/categories";
import type { Subcategory } from "@/types/category";

function DesktopCategoryItem({ categoryId, categoryName, alias }: {
  categoryId: number;
  categoryName: string;
  alias: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () => getSubcategories(categoryId, { per_page: 50 }),
    staleTime: 60 * 1000,
    enabled: isHovered,
  });
  const subcategories = data?.data ?? [];

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
  };

  return (
    <li
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={`/category/${alias.toLowerCase()}`}
        className="group text-sm font-semibold text-[#374151] hover:text-[#01AC28] transition-colors flex items-center gap-1"
      >
        {categoryName}
        {subcategories.length > 0 && (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </Link>

      {isHovered && subcategories.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          {subcategories.map((sub: Subcategory) => (
            <Link
              key={sub.id}
              href={`/category/${alias.toLowerCase()}?sub=${sub.id}`}
              className="block px-4 py-2 text-sm text-[#374151] hover:text-[#01AC28] hover:bg-gray-50 transition-colors"
            >
              {sub.subcategory_name}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}

function MobileCategoryItem({
  categoryId,
  categoryName,
  alias,
  onNavigate,
}: {
  categoryId: number;
  categoryName: string;
  alias: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () => getSubcategories(categoryId, { per_page: 50 }),
    staleTime: 60 * 1000,
    enabled: expanded,
  });
  const subcategories = data?.data ?? [];

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        <Link
          href={`/category/${alias.toLowerCase()}`}
          onClick={onNavigate}
          className="flex-1 px-4 py-3 text-sm font-semibold text-[#374151] hover:text-[#01AC28] hover:bg-[#EFEFEF] transition-colors"
        >
          {categoryName}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-3 text-gray-400 hover:text-[#01AC28] transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && subcategories.length > 0 && (
        <ul className="bg-gray-50/50 pb-1">
          {subcategories.map((sub: Subcategory) => (
            <li key={sub.id}>
              <Link
                href={`/category/${alias.toLowerCase()}?sub=${sub.id}`}
                onClick={onNavigate}
                className="block pl-8 pr-4 py-2 text-sm text-[#374151] hover:text-[#01AC28] hover:bg-[#EFEFEF] transition-colors"
              >
                {sub.subcategory_name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ per_page: 20 }),
    staleTime: 60 * 1000,
  });
  const categories = data?.data ?? [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-[48px] md:top-[72px] z-40 w-full relative transition-all duration-300 -mt-[1px] ${
      isScrolled 
        ? 'bg-[#EFEFEF]/80 backdrop-blur-md border-b border-gray-200/50' 
        : 'bg-[#EFEFEF]'
    }`}>
      {/* Desktop Navigation */}
      <div className="hidden md:block px-6 lg:px-12 py-3 md:py-4">
        <ul className="flex items-center gap-8 lg:gap-10">
          <li>
            <Link
              href="/special-offers"
              className="text-sm font-semibold text-[#01AC28] hover:text-[#044644] transition-colors"
            >
              Special Offers
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="text-sm font-semibold text-[#374151] hover:text-[#01AC28] transition-colors"
            >
              All Products
            </Link>
          </li>
          {categories.map((category) => (
            <DesktopCategoryItem
              key={category.id}
              categoryId={category.id}
              categoryName={category.category_name}
              alias={category.alias}
            />
          ))}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full px-4 py-3 flex items-center justify-start gap-2 text-sm font-semibold text-[#374151] hover:text-[#01AC28] transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
          <span>Menu</span>
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 max-h-[70vh] overflow-y-auto">
            <ul className="flex flex-col">
              <li className="border-b border-gray-100">
                <Link
                  href="/special-offers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-[#01AC28] hover:text-[#044644] hover:bg-[#EFEFEF] transition-colors"
                >
                  Special Offers
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-[#374151] hover:text-[#01AC28] hover:bg-[#EFEFEF] transition-colors"
                >
                  All Products
                </Link>
              </li>
              {categories.map((category) => (
                <MobileCategoryItem
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.category_name}
                  alias={category.alias}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
