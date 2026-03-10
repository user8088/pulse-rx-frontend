'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowLeft, ShieldCheck, CreditCard, Truck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import { useCart, cartItemKey } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { placeOrder } from '@/lib/api/orders';
import {
  uploadPrescription as apiUploadRx,
  uploadGuestPrescription as apiGuestUploadRx,
} from '@/lib/api/prescriptions';
import type { CreateOrderRequest } from '@/types/order';

const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Other'];

const recommendedProducts = [
  { id: 101, name: "Vitamin C 1000mg Immune Support", price: 24.99, originalPrice: 29.99, image: "/assets/home/product-3.png" },
  { id: 102, name: "Zinc Picolinate 50mg Tablets", price: 18.50, image: "/assets/home/product-4.png" },
  { id: 103, name: "Omega-3 Fish Oil 1200mg", price: 32.00, image: "/assets/home/product-5.png" },
  { id: 104, name: "Magnesium Citrate 200mg", price: 15.00, image: "/assets/home/product-6.png" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, uploadPrescription, prescriptionsPending, canPlaceOrder, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(isAuthenticated && user?.name ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(isAuthenticated && user?.email ? user.email : '');
  const [phone, setPhone] = useState('');
  const [houseApt, setHouseApt] = useState('');
  const [street, setStreet] = useState('');
  const [blockLocality, setBlockLocality] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [placing, setPlacing] = useState(false);

  const subtotal = cartTotal;
  const shipping = deliveryMethod === 'express' ? 15 : 0;
  const total = subtotal + shipping;

  const prescriptionRequiredItems = cartItems.filter(item => item.requiresPrescription);

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) {
      alert('Please upload prescriptions for all prescription-required products before placing your order.');
      return;
    }
    if (!phone.trim() || !houseApt.trim() || !street.trim() || !blockLocality.trim() || !city.trim()) {
      alert('Please fill in all required address fields.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setPlacing(true);
    try {
      const deliveryAddress = [houseApt.trim(), street.trim(), blockLocality.trim()]
        .filter(Boolean)
        .join(', ');

      const payload: CreateOrderRequest = {
        delivery_name: customerName.trim(),
        delivery_phone: phone.trim(),
        delivery_address: deliveryAddress,
        delivery_city: city.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cartItems.map((item) => ({
          product_id: item.id,
          unit_type: item.unit_type || 'item',
          quantity: item.qty,
        })),
      };

      const order = await placeOrder(payload);

      // Auto-upload any prescriptions attached during checkout
      const rxItems = cartItems.filter(ci => ci.requiresPrescription && ci.prescription?.file);
      for (const ci of rxItems) {
        const match = order.items.find(
          oi => oi.product_id === ci.id && (oi.unit_type ?? oi.tier) === ci.unit_type
        );
        if (!match || !ci.prescription?.file) continue;
        try {
          if (isAuthenticated) {
            await apiUploadRx(order.id, match.id, ci.prescription.file);
          } else {
            await apiGuestUploadRx(order.order_number, match.id, phone.trim(), ci.prescription.file);
          }
        } catch {
          // Prescription upload failed — user can retry on confirmation page
        }
      }

      try { sessionStorage.setItem('last_order', JSON.stringify(order)); } catch { /* quota */ }
      // Store phone for guest prescription uploads on subsequent pages
      if (!isAuthenticated) {
        try { sessionStorage.setItem('order_phone', phone.trim()); } catch { /* quota */ }
      }
      clearCart();
      router.push(`/order-confirmation/${encodeURIComponent(order.order_number)}`);
    } catch (e: unknown) {
      console.error('Place order failed:', e);
      const axiosErr = e as { response?: { data?: { message?: string }; status?: number } };
      const apiMsg = axiosErr?.response?.data?.message;
      const status = axiosErr?.response?.status;
      const detail = apiMsg
        ? `Server said: ${apiMsg} (${status})`
        : 'Could not reach the server. Please check your connection and try again.';
      alert(`Unable to place order.\n${detail}`);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <div className="bg-[#EFEFEF] py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <Link href="/cart" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">Cart</Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[#374151] font-semibold">Checkout</span>
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
            <div className="lg:col-span-8 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#374151] mb-8">Complete Your Order</h1>

              {!isAuthenticated && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email (optional)</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Signed in as {user?.name ?? user?.email}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="Email"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-[#01AC28]" />
                  <h2 className="text-xl font-bold text-[#374151]">Delivery Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">House / Apt *</label>
                    <input
                      type="text"
                      value={houseApt}
                      onChange={(e) => setHouseApt(e.target.value)}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                      placeholder="House 12, Apt 4B"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Street *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                      placeholder="Street 7"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Block or Locality *</label>
                    <input
                      type="text"
                      value={blockLocality}
                      onChange={(e) => setBlockLocality(e.target.value)}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                      placeholder="F-7 Markaz"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                    >
                      <option value="">Select city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {prescriptionRequiredItems.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Prescriptions</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    The following products require a valid prescription. You can attach them now or upload after placing your order.
                  </p>
                  <div className="space-y-6">
                    {prescriptionRequiredItems.map((item) => (
                      <div key={cartItemKey(item)} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden">
                            <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-[#374151] mb-1">{item.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{item.variation} • {item.quantity}</p>
                          </div>
                        </div>
                        <PrescriptionUpload
                          mode="pre-order"
                          itemName={item.name}
                          currentFile={item.prescription?.file ?? null}
                          onFileSelect={(file) => uploadPrescription(cartItemKey(item), file)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Order Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all resize-none"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-[#01AC28]" />
                  <h2 className="text-xl font-bold text-[#374151]">Delivery Method</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${deliveryMethod === 'standard' ? 'border-[#01AC28] bg-[#F0FDF4]' : 'border-gray-100 bg-gray-50/50 hover:border-[#01AC28]'}`}>
                    <input type="radio" name="delivery" className="sr-only" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#374151]">Standard Delivery</p>
                      <p className="text-xs text-[#6B7280]">3-5 Business Days</p>
                    </div>
                    <span className="text-sm font-bold text-[#01AC28]">FREE</span>
                    {deliveryMethod === 'standard' && <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-3" />}
                  </label>
                  <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${deliveryMethod === 'express' ? 'border-[#01AC28] bg-[#F0FDF4]' : 'border-gray-100 bg-gray-50/50 hover:border-[#01AC28]'}`}>
                    <input type="radio" name="delivery" className="sr-only" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#374151]">Express Delivery</p>
                      <p className="text-xs text-[#6B7280]">Next Business Day</p>
                    </div>
                    <span className="text-sm font-bold text-[#374151]">Rs. 15.00</span>
                    {deliveryMethod === 'express' && <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-3" />}
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-[#01AC28]" />
                  <h2 className="text-xl font-bold text-[#374151]">Payment Method</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${paymentMethod === 'cod' ? 'border-[#01AC28] bg-[#F0FDF4]' : 'border-gray-100 bg-gray-50/50 hover:border-[#01AC28]'}`}>
                      <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <Truck className="w-6 h-6 text-[#01AC28]" />
                      </div>
                      <span className="text-sm font-bold text-[#374151]">Cash on Delivery</span>
                      {paymentMethod === 'cod' && <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-auto" />}
                    </label>
                    <label className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${paymentMethod === 'card' ? 'border-[#01AC28] bg-[#F0FDF4]' : 'border-gray-100 bg-gray-50/50 hover:border-[#01AC28]'}`}>
                      <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <CreditCard className="w-6 h-6 text-[#01AC28]" />
                      </div>
                      <span className="text-sm font-bold text-[#374151]">Credit / Debit Card</span>
                      {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-auto" />}
                    </label>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
                        <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="XXXX XXXX XXXX XXXX" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="MM / YY" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CVC / CVV</label>
                        <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="XXX" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:w-[400px]">
              <div className="bg-[#374151] rounded-3xl p-6 md:p-8 text-white sticky top-[150px] shadow-2xl">
                <h2 className="text-xl md:text-2xl font-bold mb-8">Order Summary</h2>
                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden border border-white/10">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                            {item.variation} • {item.quantity} • Qty: {item.qty}
                          </span>
                          <span className="text-sm font-bold">Rs. {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                        {item.requiresPrescription && (
                          <div className="mt-1">
                            {item.prescription?.file
                              ? <span className="text-[10px] text-green-400 font-bold">✓ Prescription Attached</span>
                              : <span className="text-[10px] text-orange-400 font-bold">⚠ Prescription Required</span>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-6 border-t border-white/10 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-medium">Subtotal</span>
                    <span className="font-bold">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-medium">Shipping Fee</span>
                    <span className={shipping === 0 ? 'text-[#01AC28] font-bold' : 'font-bold'}>{shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black text-[#01AC28]">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  data-cursor="Place Order"
                  onClick={handlePlaceOrder}
                  disabled={placing || !canPlaceOrder}
                  className={`w-full py-4 rounded-xl font-bold text-xs tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 shadow-lg ${
                    !placing && canPlaceOrder
                      ? 'bg-[#01AC28] hover:bg-[#044644] text-white hover:shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {placing
                    ? 'Placing Order…'
                    : canPlaceOrder
                      ? <>Confirm & Place Order <CheckCircle2 className="w-4 h-4" /></>
                      : <>Upload Prescriptions First <AlertCircle className="w-4 h-4" /></>}
                </button>
                {prescriptionsPending && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    You must upload a valid prescription for all prescription-only medicines before placing your order.
                  </p>
                )}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-[#01AC28]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Secure Checkout</p>
                      <p className="text-[10px] text-white/40">256-bit SSL Encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Up-sell</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#374151]">Recommended for you</h2>
            </div>
            <Link href="/special-offers" className="text-[#01AC28] font-bold text-sm hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={recommendedProducts} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
