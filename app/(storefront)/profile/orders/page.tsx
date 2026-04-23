'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Search, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from "@/lib/navigation";
import { getCustomerOrders } from '@/lib/api/orders';
import type { Order } from '@/types/order';

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomerOrders({ per_page: 50 });
        setOrders(res.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search.trim().toLowerCase()) ||
          o.customer_name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#374151] mb-1">Order History</h1>
          <p className="text-[#6B7280] text-sm">Track and manage your past orders</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#01AC28] transition-all w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01AC28] mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#374151] font-semibold">No orders yet</p>
          <p className="text-[#6B7280] text-sm mt-1">Your order history will appear here.</p>
          <Link href="/special-offers" className="mt-4 inline-block text-[#01AC28] font-bold text-sm hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[#374151]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-[#374151]">{order.order_number}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] font-medium">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl font-black text-[#374151]">Rs. {order.total}</p>
                  </div>
                  <Link
                    href={`/order-confirmation/${encodeURIComponent(order.order_number)}`}
                    className="flex items-center gap-2 bg-[#EFEFEF] hover:bg-[#374151] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="bg-gray-50/50 px-6 md:px-8 py-4 border-t border-gray-50 flex gap-4 overflow-x-auto scrollbar-hide">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2 pr-4 flex-shrink-0">
                    {item.image_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50">
                        <Image src={item.image_url} alt={item.item_name} fill className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                    <span className="text-xs font-bold text-[#374151] whitespace-nowrap">{item.quantity}x {item.item_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
