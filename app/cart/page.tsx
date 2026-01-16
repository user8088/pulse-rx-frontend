'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ChevronRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: "MedRelief Fast-Acting Pain Killer",
    variation: "250mg",
    quantity: "60TAB",
    price: 99.00,
    image: "/assets/home/product-250mg.png",
  },
  {
    id: 2,
    name: "Solgar ESTER 100 PLUS Kapsul 500MG",
    variation: "500mg",
    quantity: "30TAB",
    price: 43.00,
    image: "/assets/home/product-1.png",
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: number, increment: boolean) => {
    // In a real app, this would update state or local storage
    console.log(`Update quantity for ${id}: ${increment ? 'increment' : 'decrement'}`);
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.15;
  const shipping = subtotal > 199 ? 0 : 15.00;
  const total = subtotal + tax + shipping;

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
            <span className="text-[#374151] font-semibold">Your Cart</span>
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151]">Your Shopping Cart</h1>
            <span className="text-[#6B7280] font-medium">{cartItems.length} Items</span>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-6">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-gray-100 items-center group">
                    {/* Product Details */}
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-[#374151] mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">
                          {item.variation} • {item.quantity}
                        </p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, false)}
                          className="p-2 hover:bg-gray-100 transition-colors text-gray-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-bold text-[#374151]">1</span>
                        <button 
                          onClick={() => updateQuantity(item.id, true)}
                          className="p-2 hover:bg-gray-100 transition-colors text-gray-500"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-1 md:col-span-2 text-center hidden md:block">
                      <span className="text-base font-bold text-[#374151]">${item.price.toFixed(2)}</span>
                    </div>

                    {/* Item Total */}
                    <div className="col-span-1 md:col-span-2 text-right">
                      <span className="text-lg font-bold text-[#01AC28] md:text-[#374151] md:group-hover:text-[#01AC28] transition-colors">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <Link 
                  href="/special-offers" 
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#01AC28] hover:text-[#044644] transition-colors uppercase tracking-widest mt-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4">
                <div className="bg-[#EFEFEF] rounded-2xl p-6 md:p-8 sticky top-[150px]">
                  <h2 className="text-xl md:text-2xl font-bold text-[#374151] mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B7280] font-medium">Subtotal</span>
                      <span className="text-[#374151] font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B7280] font-medium">Tax (15%)</span>
                      <span className="text-[#374151] font-bold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B7280] font-medium">Shipping Fee</span>
                      <span className={`${shipping === 0 ? 'text-[#01AC28]' : 'text-[#374151]'} font-bold`}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-[10px] text-[#6B7280] italic">Add ${(199 - subtotal).toFixed(2)} more for FREE shipping</p>
                    )}
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-lg font-bold text-[#374151]">Total</span>
                      <span className="text-2xl font-black text-[#01AC28]">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full bg-[#374151] hover:bg-[#111827] text-white py-4 rounded-xl font-bold text-xs tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
                  </Link>

                  <div className="mt-6 space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">We Accept</p>
                    <div className="flex justify-center gap-4 grayscale opacity-50">
                      {/* Placeholder icons */}
                      <div className="w-8 h-5 bg-gray-300 rounded" />
                      <div className="w-8 h-5 bg-gray-300 rounded" />
                      <div className="w-8 h-5 bg-gray-300 rounded" />
                      <div className="w-8 h-5 bg-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-[#374151] mb-2">Your cart is empty</h2>
              <p className="text-[#6B7280] mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
              <Link 
                href="/special-offers"
                className="bg-[#01AC28] hover:bg-[#044644] text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
