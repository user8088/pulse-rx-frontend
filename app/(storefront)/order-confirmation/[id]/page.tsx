'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, MapPin, ShoppingBag, Search, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import { getOrder } from '@/lib/api/orders';
import { useAuth } from '@/lib/context/AuthContext';
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

function deliveryDisplay(order: Order) {
  if (order.delivery_address) {
    const parts = [order.delivery_address, order.delivery_city].filter(Boolean);
    return parts.join(', ');
  }
  if (order.address) {
    return [order.address.house_apt, order.address.street, order.address.block_locality, order.address.city]
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { id } = await params;
      const decoded = decodeURIComponent(id);
      if (!mounted) return;
      setResolvedId(decoded);
      if (!decoded) {
        setLoading(false);
        return;
      }

      let found: Order | null = null;

      try {
        const cached = sessionStorage.getItem('last_order');
        if (cached) {
          const parsed: Order = JSON.parse(cached);
          if (parsed.order_number === decoded) {
            found = parsed;
            sessionStorage.removeItem('last_order');
          }
        }
      } catch { /* ignore */ }

      if (!found) {
        try {
          found = await getOrder(decoded);
        } catch { /* ignore */ }
      }

      if (mounted) {
        setOrder(found ?? null);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params]);

  if (loading || !resolvedId) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01AC28] mx-auto" />
          <p className="mt-4 text-gray-500">Loading order...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <Navbar />
        <div className="bg-[#EFEFEF] py-4 md:py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-12">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[#374151] font-semibold">Order</span>
            </nav>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#374151]">Order not found</h1>
          <p className="text-gray-500 mt-2">We couldn&apos;t find an order with that ID.</p>
          <Link href="/" className="mt-6 inline-block text-[#01AC28] font-semibold hover:underline">Continue Shopping</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const statusClass = STATUS_VARIANTS[order.status];
  const statusLabel = STATUS_LABELS[order.status];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <div className="bg-[#EFEFEF] py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[#374151] font-semibold">Order {order.order_number}</span>
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-[#01AC28]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#374151]">Thank you for your order</h1>
            <p className="text-gray-500 mt-2">Order number: <span className="font-mono font-bold text-[#374151]">{order.order_number}</span></p>
            <span className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>{statusLabel}</span>
          </div>

          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">Track your order</h3>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Save your order number <span className="font-mono font-bold">{order.order_number}</span> and your phone number to track your order anytime.
              </p>
              <Link
                href={`/track?order=${encodeURIComponent(order.order_number)}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                Track Order <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#01AC28]" />
                <h2 className="text-lg font-bold text-[#374151]">Delivery address</h2>
              </div>
              <p className="font-medium text-[#374151]">{order.delivery_name || order.customer_name}</p>
              {(order.delivery_phone || order.customer_phone) && (
                <p className="text-gray-600">{order.delivery_phone || order.customer_phone}</p>
              )}
              <p className="text-gray-600 mt-2">{deliveryDisplay(order)}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-[#01AC28]" />
                <h2 className="text-lg font-bold text-[#374151]">Order items</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {order.items.map((item) => {
                  const name = item.item_name || item.product_name || `Product #${item.product_id}`;
                  const unitLabel = item.unit_label || item.tier_label || 'Unit';
                  const itemDiscount = item.discount_amount != null ? Number(item.discount_amount) : 0;
                  return (
                    <li key={item.id} className="py-4 flex gap-4 items-center">
                      {item.image_url ? (
                        <div className="relative w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                          <Image src={item.image_url} alt={name} fill className="object-contain p-2" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#374151]">{name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x {unitLabel}
                        </p>
                        {itemDiscount > 0 && (
                          <p className="text-[10px] font-bold text-green-600 mt-0.5">You saved Rs. {itemDiscount.toFixed(2)}</p>
                        )}
                      </div>
                      <span className="font-bold text-[#01AC28]">Rs. {item.line_total}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rs. {order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">Rs. {order.delivery_fee ?? order.shipping ?? '0'}</span>
                </div>
                {(order.discount_amount != null ? Number(order.discount_amount) : order.discount != null ? Number(order.discount) : 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">
                      -Rs. {(order.discount_amount != null ? order.discount_amount : order.discount) ?? '0'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-[#01AC28]">Rs. {order.total}</span>
                </div>
              </div>
            </div>

            {/* Prescription uploads for items that need them */}
            {order.items.some(i => i.requires_prescription) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#01AC28]" />
                  <h2 className="text-lg font-bold text-[#374151]">Prescriptions</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Upload prescriptions for items that require them. Your order will be reviewed once prescriptions are submitted.</p>
                <div className="space-y-4">
                  {order.items.filter(i => i.requires_prescription).map(item => {
                    const name = item.item_name || item.product_name || `Product #${item.product_id}`;
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-bold text-[#374151] mb-3">{name}</p>
                        {isAuthenticated ? (
                          <PrescriptionUpload
                            mode="post-order"
                            itemName={name}
                            orderId={order.id}
                            orderItemId={item.id}
                          />
                        ) : (
                          <PrescriptionUpload
                            mode="post-order-guest"
                            itemName={name}
                            orderNumber={order.order_number}
                            orderItemId={item.id}
                            phone={order.delivery_phone || order.customer_phone || (() => { try { return sessionStorage.getItem('order_phone') ?? ''; } catch { return ''; } })()}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.notes && (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Order notes</p>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/special-offers"
              className="inline-flex items-center gap-2 bg-[#01AC28] hover:bg-[#044644] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Continue Shopping <ChevronRight className="w-4 h-4" />
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile/orders"
                className="inline-flex items-center gap-2 border-2 border-[#374151] text-[#374151] hover:bg-[#374151] hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                View Order History
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href={`/track?order=${encodeURIComponent(order.order_number)}`}
                className="inline-flex items-center gap-2 border-2 border-[#374151] text-[#374151] hover:bg-[#374151] hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Track Order
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
