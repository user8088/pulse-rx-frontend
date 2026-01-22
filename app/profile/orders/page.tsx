'use client';

import { ShoppingBag, ChevronRight, Search, Filter, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const orders = [
  {
    id: 'ORD-7721',
    date: '12 October 2025',
    status: 'Delivered',
    total: 142.50,
    items: [
      { name: 'MedRelief Pain Killer', qty: 2, image: '/assets/home/product-250mg.png' },
      { name: 'Vitamin C 1000mg', qty: 1, image: '/assets/home/product-3.png' }
    ]
  },
  {
    id: 'ORD-7690',
    date: '28 September 2025',
    status: 'In Transit',
    total: 89.00,
    items: [
      { name: 'Zinc Picolinate 50mg', qty: 1, image: '/assets/home/product-4.png' }
    ]
  },
  {
    id: 'ORD-7512',
    date: '15 August 2025',
    status: 'Delivered',
    total: 210.00,
    items: [
      { name: 'Omega-3 Fish Oil', qty: 3, image: '/assets/home/product-5.png' },
      { name: 'Magnesium Citrate', qty: 1, image: '/assets/home/product-6.png' }
    ]
  },
  {
    id: 'ORD-7405',
    date: '02 July 2025',
    status: 'Cancelled',
    total: 45.00,
    items: [
      { name: 'Cold & Flu Relief', qty: 1, image: '/assets/home/product-2.png' }
    ]
  }
];

export default function OrdersPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#374151] mb-1">Order History</h1>
          <p className="text-[#6B7280] text-sm">Track and manage your past orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..."
              className="bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[#374151]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-[#374151]">{order.id}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium">{order.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-xl font-black text-[#374151]">Rs. {order.total.toFixed(2)}</p>
                </div>
                <button className="flex items-center gap-2 bg-[#EFEFEF] hover:bg-[#374151] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                  Details <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Items */}
            <div className="bg-gray-50/50 px-6 md:px-8 py-4 border-t border-gray-50 flex gap-4 overflow-x-auto scrollbar-hide">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2 pr-4 flex-shrink-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <span className="text-xs font-bold text-[#374151] whitespace-nowrap">{item.qty}x {item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
