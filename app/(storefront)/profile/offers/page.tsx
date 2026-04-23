'use client';

import { Percent, ChevronRight, Sparkles, Tag } from 'lucide-react';
import Link from "@/lib/navigation";
import { useAuth } from '@/lib/context/AuthContext';

export default function OffersPage() {
  const { customerProfile } = useAuth();
  const discountPercent = Number(customerProfile?.discount_percentage) || 0;
  const hasMemberDiscount = discountPercent > 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#374151] mb-2 flex items-center gap-3">
          My Special Offers <Sparkles className="w-7 h-7 text-[#01AC28] fill-[#01AC28]/20" />
        </h1>
        <p className="text-[#6B7280] text-sm md:text-base">Your personalized discounts and rewards</p>
      </div>

      {/* Your member discount — hero card */}
      <div className="rounded-2xl border-2 border-[#01AC28]/30 bg-gradient-to-br from-[#F0FDF4] to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#01AC28] flex items-center justify-center text-white shadow-lg shrink-0">
              <Percent className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-1">Your member discount</p>
              {hasMemberDiscount ? (
                <>
                  <p className="text-3xl md:text-4xl font-black text-[#374151] tabular-nums">
                    {Math.round(discountPercent)}% off
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Applied automatically when you buy by pack, box, or single item (as applicable).
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-[#374151]">No percentage discount set</p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Contact us to see if you qualify for a member discount.
                  </p>
                </>
              )}
            </div>
          </div>
          <Link
            href="/special-offers"
            className="inline-flex items-center justify-center gap-2 bg-[#01AC28] hover:bg-[#044644] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-xl shrink-0"
          >
            Shop Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Promo codes placeholder */}
      <div>
        <h2 className="text-lg font-bold text-[#374151] mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#01AC28]" />
          Promo codes
        </h2>
        <div className="bg-[#EFEFEF] rounded-2xl border-2 border-dashed border-gray-200 p-8 md:p-12 text-center">
          <p className="text-[#6B7280] font-medium">No promo codes available for you right now.</p>
          <p className="text-sm text-[#9CA3AF] mt-2">Check back later for exclusive offers and codes.</p>
        </div>
      </div>
    </div>
  );
}
