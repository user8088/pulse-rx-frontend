'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const categories = [
  "Pain Relief",
  "Cold & Flu",
  "Diabetes",
  "Child Care",
  "Skin Care",
  "Optics"
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-semibold text-[#374151] hover:text-[#01AC28] transition-colors"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
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

        {/* Mobile Dropdown Menu */}
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
              {categories.map((category) => (
                <li key={category} className="border-b border-gray-100 last:border-b-0">
                  <Link
                    href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-[#374151] hover:text-[#01AC28] hover:bg-[#EFEFEF] transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
