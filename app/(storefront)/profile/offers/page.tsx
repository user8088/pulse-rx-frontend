'use client';

import { Tag, Clock, ChevronRight, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';

const personalOffers = [
  {
    id: 1,
    title: '25% Off Vitamins & Supplements',
    description: 'Boost your immunity with our premium vitamin range. Exclusive discount for you.',
    code: 'HEALTH25',
    expires: 'In 3 days',
    type: 'Exclusive',
    color: 'bg-green-500'
  },
  {
    id: 2,
    title: 'Free Delivery on Next Order',
    description: 'Enjoy free doorstep delivery on any order above Rs. 50. Valid for one-time use.',
    code: 'FREESHIP',
    expires: 'In 12 days',
    type: 'Reward',
    color: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'Buy 2 Get 1 Free: Skin Care',
    description: 'Get a free cleanser or moisturizer when you buy any two skin care products.',
    code: 'SKINLOVE',
    expires: 'In 5 days',
    type: 'Flash Sale',
    color: 'bg-amber-500'
  }
];

export default function OffersPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#374151] mb-1 flex items-center gap-3">
          My Special Offers <Sparkles className="w-6 h-6 text-[#01AC28] fill-[#01AC28]/20" />
        </h1>
        <p className="text-[#6B7280] text-sm">Personalized rewards and discounts just for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personalOffers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col">
            <div className={`h-2 ${offer.color}`} />
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${offer.color} flex items-center justify-center text-white shadow-lg`}>
                  <Tag className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                  {offer.type}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#374151] mb-3 group-hover:text-[#01AC28] transition-colors">
                {offer.title}
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-8 flex-1">
                {offer.description}
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-dashed border-gray-200">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Promo Code</p>
                    <p className="text-lg font-black text-[#374151] tracking-wider">{offer.code}</p>
                  </div>
                  <button className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-widest">Copy</button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> {offer.expires}
                  </div>
                  <Link 
                    href="/special-offers"
                    className="inline-flex items-center gap-2 bg-[#374151] hover:bg-[#111827] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Shop Now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-[#044644] to-[#01AC28] rounded-3xl p-8 md:p-10 shadow-lg text-white relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-black/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 mx-auto border border-white/20 shadow-xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Loyalty Milestone!</h2>
            <p className="text-white/80 text-sm mb-8 max-w-[240px]">
              You&apos;re only 2 orders away from unlocking a Rs. 20 Gift Card.
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden border border-white/10">
              <div className="bg-white h-full w-2/3 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">66% Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
