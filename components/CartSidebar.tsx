'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

export default function CartSidebar() {
  const { cartItems, isCartOpen, closeCart, updateQty, removeItem, cartTotal, cartCount } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeCart]);

  // Prevent scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end transition-all duration-500 ${
        isCartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={closeCart}
      />

      {/* Sidebar Content */}
      <div 
        ref={sidebarRef}
        className={`relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col transition-transform duration-500 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EFEFEF] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#374151]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#374151]">Your Cart</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cartCount} Items</p>
            </div>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-[#374151]" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Image */}
                <div className="relative w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 flex-shrink-0 overflow-hidden">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-[#374151] line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {item.variation} • {item.quantity}
                    </p>
                    {item.requiresPrescription && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {item.prescription?.status === 'verified' && (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="text-[10px] font-bold text-green-600">Prescription Verified</span>
                          </>
                        )}
                        {item.prescription?.status === 'pending' && (
                          <>
                            <Clock className="w-3 h-3 text-yellow-600 animate-pulse" />
                            <span className="text-[10px] font-bold text-yellow-600">Verification Pending</span>
                          </>
                        )}
                        {item.prescription?.status === 'rejected' && (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span className="text-[10px] font-bold text-red-600">Prescription Rejected</span>
                          </>
                        )}
                        {!item.prescription && (
                          <>
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            <span className="text-[10px] font-bold text-orange-600">Prescription Required</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Qty Controls */}
                    <div className="flex items-center bg-[#EFEFEF] rounded-lg p-1">
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-all text-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#374151]">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-all text-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#01AC28]">Rs. {(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#374151]">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mt-2">Looks like you haven&apos;t added anything yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
            <span className="text-xl font-black text-[#374151]">Rs. {cartTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/cart"
              onClick={closeCart}
              className="w-full bg-white border border-gray-200 text-[#374151] py-4 rounded-xl font-bold text-[10px] tracking-[0.2em] transition-all uppercase flex items-center justify-center hover:border-gray-400"
            >
              View In Page
            </Link>
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-[#374151] text-white py-4 rounded-xl font-bold text-[10px] tracking-[0.2em] transition-all uppercase flex items-center justify-center hover:bg-[#111827] shadow-lg shadow-gray-200"
            >
              Checkout
            </Link>
          </div>
          
          <button 
            onClick={closeCart}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-[0.2em]"
          >
            Continue Shopping <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
