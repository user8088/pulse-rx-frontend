'use client';

import Link from "next/link";
import { Search, User, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/context/CartContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full py-3 md:py-4 px-4 md:px-6 lg:px-12 flex items-center justify-between gap-2 md:gap-4 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50' 
        : 'bg-white border-b border-gray-100'
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <span className="text-xl md:text-2xl font-black text-[#01AC28] tracking-tight uppercase">PULSERX</span>
      </Link>

      {/* Search Bar - Desktop */}
      <div className="hidden lg:flex flex-1 max-w-2xl mx-12 relative">
        <input
          type="text"
          placeholder="Search medicine, medical products"
          className="w-full bg-[#EFEFEF] rounded-lg py-3 px-5 pr-12 text-sm text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#01AC28] placeholder:text-[#9CA3AF]"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-shrink-0">
        <Link href="/login" className="flex items-center gap-1.5 md:gap-2 text-sm font-semibold text-[#000000] hover:text-[#01AC28] transition-colors">
          <User className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden sm:inline">Sign in</span>
        </Link>
        <button 
          onClick={openCart}
          className="flex items-center gap-1.5 md:gap-2 text-sm font-semibold text-[#000000] hover:text-[#01AC28] transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-[#01AC28] text-white text-[9px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </div>
          <span className="hidden sm:inline">Your Cart</span>
        </button>
      </div>
    </header>
  );
}
