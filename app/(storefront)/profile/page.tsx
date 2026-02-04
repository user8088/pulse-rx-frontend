'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { 
  ShoppingBag, 
  Tag, 
  Clock, 
  ChevronRight,
  Package,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function ProfileOverview() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Orders', value: '12', icon: Package, color: 'bg-blue-500' },
    { label: 'Pending Prescriptions', value: '2', icon: Clock, color: 'bg-amber-500' },
    { label: 'Available Offers', value: '5', icon: Tag, color: 'bg-[#01AC28]' },
  ];

  const recentOrders = [
    { id: 'ORD-7721', date: 'Oct 12, 2025', status: 'Delivered', total: '$142.50' },
    { id: 'ORD-7690', date: 'Sep 28, 2025', status: 'In Transit', total: '$89.00' },
    { id: 'ORD-7512', date: 'Aug 15, 2025', status: 'Delivered', total: '$210.00' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#01AC28]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#374151] mb-2">
            Hello, {user?.name?.split(' ')[0]}! 👋
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
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#374151]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#374151]">{order.id}</p>
                      <p className="text-xs text-[#6B7280]">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#374151]">{order.total}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
