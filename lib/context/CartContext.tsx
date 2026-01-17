'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PrescriptionStatus = 'pending' | 'verified' | 'rejected' | null;

export interface PrescriptionData {
  file: File | null;
  fileName: string;
  uploadedAt: string;
  status: PrescriptionStatus;
  rejectionReason?: string;
}

interface CartItem {
  id: number;
  name: string;
  variation: string;
  quantity: string;
  price: number;
  image: string;
  qty: number;
  requiresPrescription?: boolean;
  prescription?: PrescriptionData;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  uploadPrescription: (itemId: number, file: File) => void;
  getPrescriptionStatus: (itemId: number) => PrescriptionStatus;
  cartCount: number;
  cartTotal: number;
  canPlaceOrder: boolean;
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
    qty: 1,
    requiresPrescription: false
  },
  {
    id: 2,
    name: "Solgar ESTER 100 PLUS Kapsul 500MG",
    variation: "500mg",
    quantity: "30TAB",
    price: 43.00,
    image: "/assets/home/product-1.png",
    qty: 1,
    requiresPrescription: false
  }
];

// Load cart from localStorage on mount
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return initialItems;
  try {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert prescription data back to proper format
      return parsed.map((item: CartItem) => ({
        ...item,
        prescription: item.prescription ? {
          ...item.prescription,
          file: null // Don't store File objects in localStorage
        } : undefined
      }));
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
  }
  return initialItems;
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Remove file objects before saving
    const itemsToSave = items.map(item => ({
      ...item,
      prescription: item.prescription ? {
        ...item.prescription,
        file: null
      } : undefined
    }));
    localStorage.setItem('cart_items', JSON.stringify(itemsToSave));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.variation === item.variation && i.quantity === item.quantity);
      if (existing) {
        return prev.map(i => i.id === item.id && i.variation === item.variation && i.quantity === item.quantity 
          ? { ...i, qty: i.qty + 1 } 
          : i);
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

  const uploadPrescription = (itemId: number, file: File) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const prescriptionData: PrescriptionData = {
          file,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          status: 'pending'
        };
        return { ...item, prescription: prescriptionData };
      }
      return item;
    }));

    // Simulate admin verification after 3 seconds (for demo)
    setTimeout(() => {
      // 80% chance of verification, 20% chance of rejection
      const isVerified = Math.random() > 0.2;
      setCartItems(prev => prev.map(item => {
        if (item.id === itemId && item.prescription?.status === 'pending') {
          return {
            ...item,
            prescription: {
              ...item.prescription,
              status: isVerified ? 'verified' : 'rejected',
              rejectionReason: isVerified ? undefined : 'Prescription image is unclear or does not match the product requirements. Please upload a clear, valid prescription.'
            }
          };
        }
        return item;
      }));
    }, 3000);
  };

  const getPrescriptionStatus = (itemId: number): PrescriptionStatus => {
    const item = cartItems.find(i => i.id === itemId);
    return item?.prescription?.status || null;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Check if order can be placed (all prescription-required items must be verified)
  const canPlaceOrder = cartItems.every(item => {
    if (!item.requiresPrescription) return true;
    return item.prescription?.status === 'verified';
  });

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      uploadPrescription,
      getPrescriptionStatus,
      cartCount,
      cartTotal,
      canPlaceOrder
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
