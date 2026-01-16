'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  name: string;
  variation: string;
  quantity: string;
  price: number;
  image: string;
  qty: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Mock initial items
const initialItems: CartItem[] = [
  {
    id: 1,
    name: "MedRelief Fast-Acting Pain Killer",
    variation: "250mg",
    quantity: "60TAB",
    price: 99.00,
    image: "/assets/home/product-250mg.png",
    qty: 1
  },
  {
    id: 2,
    name: "Solgar ESTER 100 PLUS Kapsul 500MG",
    variation: "500mg",
    quantity: "30TAB",
    price: 43.00,
    image: "/assets/home/product-1.png",
    qty: 1
  }
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    openCart();
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
