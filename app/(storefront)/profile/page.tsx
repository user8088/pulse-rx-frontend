'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { ShoppingBag, Tag, Clock, ChevronRight, Package, Calendar } from 'lucide-react';
import Link from 'next/link';
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

function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProfileOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [recent, all] = await Promise.all([
          getCustomerOrders({ per_page: 3 }),
          getCustomerOrders({ per_page: 100 }),
        ]);
        setOrders(recent.data ?? []);
        setAllOrders(all.data ?? []);
        setTotalOrders(all.total ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingCount = allOrders.filter(
    o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'out_for_delivery'
  ).length;
  const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;

  const stats = [
    { label: 'Total Orders', value: String(totalOrders), icon: Package, color: 'bg-blue-500' },
    { label: 'In Progress', value: String(pendingCount), icon: Clock, color: 'bg-amber-500' },
    { label: 'Delivered', value: String(deliveredCount), icon: Tag, color: 'bg-[#01AC28]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#01AC28]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#374151] mb-2">
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[#6B7280]">Welcome back to your health dashboard. Everything looks good!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-gray-100`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-[#374151]">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#374151]">Recent Orders</h2>
            <Link href="/profile/orders" className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-widest">View All</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01AC28] mx-auto" />
              <p className="text-gray-500 text-sm mt-2">Loading…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-[#6B7280] text-sm mt-2">No orders yet</p>
              <Link href="/special-offers" className="text-[#01AC28] font-semibold text-sm hover:underline mt-1 inline-block">Start shopping</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <Link key={order.id} href={`/order-confirmation/${encodeURIComponent(order.order_number)}`} className="block p-6 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#374151]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#374151]">{order.order_number}</p>
                        <p className="text-xs text-[#6B7280]">{formatShortDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#374151]">Rs. {order.total}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#044644] rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden text-white flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#01AC28] flex items-center justify-center mb-6 shadow-xl">
              <Tag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Health Booster Offer!</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-[280px]">
              Get 25% off on all Vitamin supplements this month. Exclusive for you.
            </p>
            <Link
              href="/profile/offers"
              className="inline-flex items-center gap-2 bg-white text-[#044644] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#01AC28] hover:text-white transition-all shadow-xl"
            >
              Check Offers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            <Calendar className="w-3 h-3" /> Expires in 3 days
          </div>
        </div>
      </div>
    </div>
  );
}
