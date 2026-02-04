'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowLeft, ShieldCheck, CreditCard, Truck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import { useCart } from '@/lib/context/CartContext';

const recommendedProducts = [
  {
    id: 101,
    name: "Vitamin C 1000mg Immune Support",
    price: 24.99,
    originalPrice: 29.99,
    rating: 5,
    image: "/assets/home/product-3.png",
  },
  {
    id: 102,
    name: "Zinc Picolinate 50mg Tablets",
    price: 18.50,
    rating: 5,
    image: "/assets/home/product-4.png",
  },
  {
    id: 103,
    name: "Omega-3 Fish Oil 1200mg",
    price: 32.00,
    rating: 5,
    image: "/assets/home/product-5.png",
  },
  {
    id: 104,
    name: "Magnesium Citrate 200mg",
    price: 15.00,
    rating: 5,
    image: "/assets/home/product-6.png",
  }
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const { cartItems, cartTotal, uploadPrescription, canPlaceOrder } = useCart();
  
  const subtotal = cartTotal;
  const tax = subtotal * 0.15;
  const shipping = 0; // Free for demo
  const total = subtotal + tax + shipping;

  const prescriptionRequiredItems = cartItems.filter(item => item.requiresPrescription);

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) {
      alert('Please ensure all prescription-required products have verified prescriptions before placing your order.');
      return;
    }
    alert('Order placed successfully! (Demo mode)');
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      {/* Breadcrumb */}
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
            
            {/* Left Column - Checkout Steps */}
            <div className="lg:col-span-8 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#374151] mb-8">Complete Your Order</h1>
              
              {/* Checkout Progress */}
              <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                <div className={`flex items-center gap-2 flex-shrink-0 ${step >= 1 ? 'text-[#01AC28]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-[#01AC28] text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping</span>
                </div>
                <div className="w-12 h-[1px] bg-gray-200" />
                <div className={`flex items-center gap-2 flex-shrink-0 ${step >= 2 ? 'text-[#01AC28]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-[#01AC28] text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                </div>
                <div className="w-12 h-[1px] bg-gray-200" />
                <div className={`flex items-center gap-2 flex-shrink-0 ${step >= 3 ? 'text-[#01AC28]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-[#01AC28] text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                  <span className="text-xs font-bold uppercase tracking-widest">Review</span>
                </div>
              </div>

              {/* Prescription Upload Section */}
              {prescriptionRequiredItems.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Prescription Verification</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    The following products require a valid prescription. Please upload clear images of your prescriptions for verification.
                  </p>
                  <div className="space-y-6">
                    {prescriptionRequiredItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-[#374151] mb-1">{item.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {item.variation} • {item.quantity}
                            </p>
                          </div>
                        </div>
                        <PrescriptionUpload
                          itemId={item.id}
                          itemName={item.name}
                          currentStatus={item.prescription?.status || null}
                          fileName={item.prescription?.fileName}
                          rejectionReason={item.prescription?.rejectionReason}
                          onUpload={(file) => uploadPrescription(item.id, file)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Form */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Shipping Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="Doe" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                      <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="123 Health Ave, Apt 4B" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="Wellness City" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Postcode</label>
                      <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="12345" />
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Delivery Method</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="relative flex items-center p-4 border-2 border-[#01AC28] bg-[#F0FDF4] rounded-xl cursor-pointer">
                      <input type="radio" name="delivery" className="sr-only" defaultChecked />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#374151]">Standard Delivery</p>
                        <p className="text-xs text-[#6B7280]">3-5 Business Days</p>
                      </div>
                      <span className="text-sm font-bold text-[#01AC28]">FREE</span>
                      <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-3" />
                    </label>
                    <label className="relative flex items-center p-4 border border-gray-100 bg-gray-50/50 rounded-xl cursor-pointer hover:border-[#01AC28] transition-all group">
                      <input type="radio" name="delivery" className="sr-only" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#374151]">Express Delivery</p>
                        <p className="text-xs text-[#6B7280]">Next Business Day</p>
                      </div>
                      <span className="text-sm font-bold text-[#374151] group-hover:text-[#01AC28] transition-colors">Rs. 15.00</span>
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-[#01AC28]" />
                    <h2 className="text-xl font-bold text-[#374151]">Payment Method</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border-2 border-[#01AC28] bg-[#F0FDF4] rounded-xl cursor-pointer">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <CreditCard className="w-6 h-6 text-[#01AC28]" />
                        </div>
                        <span className="text-sm font-bold text-[#374151]">Credit / Debit Card</span>
                        <CheckCircle2 className="w-5 h-5 text-[#01AC28] ml-auto" />
                      </label>
                      <label className="flex items-center p-4 border border-gray-100 bg-gray-50/50 rounded-xl cursor-pointer hover:border-[#01AC28] transition-all group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm grayscale group-hover:grayscale-0 transition-all">
                          <div className="w-6 h-6 bg-[#003087] rounded-sm" />
                        </div>
                        <span className="text-sm font-bold text-[#374151] group-hover:text-[#01AC28]">PayPal</span>
                      </label>
                    </div>

                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
                        <div className="relative">
                          <input type="text" className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all" placeholder="XXXX XXXX XXXX XXXX" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-6 h-4 bg-gray-300 rounded-sm" />
                            <div className="w-6 h-4 bg-gray-300 rounded-sm" />
                          </div>
                        </div>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
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
                            {item.prescription?.status === 'verified' && (
                              <span className="text-[10px] text-green-400 font-bold">✓ Prescription Verified</span>
                            )}
                            {item.prescription?.status === 'pending' && (
                              <span className="text-[10px] text-yellow-400 font-bold">⏳ Verification Pending</span>
                            )}
                            {item.prescription?.status === 'rejected' && (
                              <span className="text-[10px] text-red-400 font-bold">✗ Prescription Rejected</span>
                            )}
                            {!item.prescription && (
                              <span className="text-[10px] text-orange-400 font-bold">⚠ Prescription Required</span>
                            )}
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
                    <span className="text-white/60 font-medium">Tax (15%)</span>
                    <span className="font-bold">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-medium">Shipping Fee</span>
                    <span className="text-[#01AC28] font-bold">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black text-[#01AC28]">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  data-cursor="Place Order"
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder}
                  className={`w-full py-4 rounded-xl font-bold text-xs tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 shadow-lg ${
                    canPlaceOrder
                      ? 'bg-[#01AC28] hover:bg-[#044644] text-white hover:shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canPlaceOrder ? (
                    <>
                      Confirm & Place Order <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Verify Prescriptions First <AlertCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                {!canPlaceOrder && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Please ensure all prescription-required products have verified prescriptions.
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
            <Link 
              href="/special-offers"
              className="text-[#01AC28] font-bold text-sm hover:underline flex items-center gap-1"
            >
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
