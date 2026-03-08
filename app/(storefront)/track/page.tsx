'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronRight, MapPin, ShoppingBag, Package, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trackOrder } from '@/lib/api/orders';
import type { Order } from '@/types/order';

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_VARIANTS: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_STEPS: Order['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'out_for_delivery',
  'delivered',
];

function deliveryDisplay(order: Order) {
  if (order.delivery_address) {
    return [order.delivery_address, order.delivery_city].filter(Boolean).join(', ');
  }
  if (order.address) {
    return [order.address.house_apt, order.address.street, order.address.block_locality, order.address.city]
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get('order');
    if (prefill) setOrderNumber(prefill);
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please enter both order number and phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const result = await trackOrder(orderNumber.trim(), phone.trim());
      setOrder(result);
      if (!result) {
        setError('Order not found. Please check your order number and phone number.');
      }
    } catch {
      setError('Unable to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex = order && order.status !== 'cancelled'
    ? STATUS_STEPS.indexOf(order.status)
    : -1;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <div className="bg-[#EFEFEF] py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[#374151] font-semibold">Track Order</span>
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[#01AC28]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#374151]">Track Your Order</h1>
            <p className="text-gray-500 mt-2">Enter your order number and phone to see your order status.</p>
          </div>

          <form onSubmit={handleTrack} className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Order Number *</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all font-mono"
                  placeholder="ORD-00001"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#01AC28] hover:bg-[#044644] text-white py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {order && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                <p className="text-sm text-gray-500 mb-1">Order</p>
                <p className="text-2xl font-black font-mono text-[#374151]">{order.order_number}</p>
                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-semibold ${STATUS_VARIANTS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {order.status !== 'cancelled' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const isActive = idx <= activeStepIndex;
                      const isCurrent = idx === activeStepIndex;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                          {idx > 0 && (
                            <div
                              className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                                idx <= activeStepIndex ? 'bg-[#01AC28]' : 'bg-gray-200'
                              }`}
                            />
                          )}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                              isCurrent
                                ? 'bg-[#01AC28] text-white ring-4 ring-green-100'
                                : isActive
                                  ? 'bg-[#01AC28] text-white'
                                  : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 text-center ${isActive ? 'text-[#01AC28]' : 'text-gray-400'}`}>
                            {STATUS_LABELS[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#01AC28]" />
                  <h2 className="text-lg font-bold text-[#374151]">Delivery Details</h2>
                </div>
                <p className="font-medium text-[#374151]">{order.delivery_name || order.customer_name}</p>
                <p className="text-gray-600">{order.delivery_phone || order.customer_phone}</p>
                <p className="text-gray-600 mt-1">{deliveryDisplay(order)}</p>
              </div>

              {order.items.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-lg font-bold text-[#374151]">Items</h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="py-3 flex gap-3 items-center">
                        {item.image_url && (
                          <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                            <Image src={item.image_url} alt={item.item_name} fill className="object-contain p-1" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#374151] text-sm">{item.item_name}</p>
                          <p className="text-xs text-gray-500">{item.tier_label} x {item.quantity}</p>
                        </div>
                        <span className="font-bold text-sm text-[#01AC28]">Rs. {item.line_total}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span className="text-[#01AC28]">Rs. {order.total}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {searched && !loading && !order && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No order found with the provided details.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
