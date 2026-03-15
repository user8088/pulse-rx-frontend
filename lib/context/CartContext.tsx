'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { computeLineDiscount } from '@/utils/pricing';

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected' | null;

export interface PrescriptionData {
  file: File | null;
  fileName: string;
  uploadedAt: string;
  status: PrescriptionStatus;
  rejectionReason?: string;
}

export interface CartItem {
  id: number;
  name: string;
  variation: string;
  quantity: string;
  /** Base unit price (before any discount) for the chosen tier. */
  price: number;
  /** Product discount percentage (item_discount 0–100). Applied only when unit_type is the product's top tier. */
  item_discount?: number;
  /** Best offer % for this product's category/subcategory (0–100). Applied only on top tier. */
  offer_percent?: number;
  /** Product's top tier: box if can_sell_box, else secondary if can_sell_secondary, else item. */
  top_tier?: "item" | "secondary" | "box";
  image: string;
  qty: number;
  unit_type: "item" | "secondary" | "box";
  requiresPrescription?: boolean;
  prescription?: PrescriptionData;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem, options?: { openCart?: boolean }) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  uploadPrescription: (key: string, file: File) => void;
  getPrescriptionStatus: (key: string) => PrescriptionStatus;
  cartCount: number;
  cartTotal: number;
  canPlaceOrder: boolean;
  prescriptionsPending: boolean;
}

/** Stable unique key for a cart line item (product + variation + tier). */
export function cartItemKey(item: { id: number; variation: string; unit_type: string }): string {
  return `${item.id}::${item.variation}::${item.unit_type}`;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage on mount. Empty cart for first-time visitors.
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
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
  return [];
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
    console.error('Failed to save the cart to storage:', error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { customerProfile } = useAuth();
  const customerDiscountPct = Number(customerProfile?.discount_percentage) || 0;

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (item: CartItem, options?: { openCart?: boolean }) => {
    const safeItem = { ...item, unit_type: item.unit_type || "item" } as CartItem;
    setCartItems(prev => {
      const existing = prev.find(
        i => i.id === safeItem.id && i.variation === safeItem.variation && i.unit_type === safeItem.unit_type
      );
      if (existing) {
        return prev.map(i =>
          i.id === safeItem.id && i.variation === safeItem.variation && i.unit_type === safeItem.unit_type
            ? { ...i, qty: i.qty + (safeItem.qty || 1) }
            : i
        );
      }
      return [...prev, { ...safeItem, qty: safeItem.qty || 1 }];
    });
    if (options?.openCart !== false) {
      openCart();
    }
  };

  const matchKey = (item: CartItem, key: string) => cartItemKey(item) === key;

  const removeItem = (key: string) => {
    setCartItems(prev => prev.filter(item => !matchKey(item, key)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQty = (key: string, qty: number) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(item => matchKey(item, key) ? { ...item, qty } : item));
  };

  const uploadPrescription = (key: string, file: File) => {
    setCartItems(prev => prev.map(item => {
      if (matchKey(item, key)) {
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
  };

  const getPrescriptionStatus = (key: string): PrescriptionStatus => {
    const item = cartItems.find(i => matchKey(i, key));
    return item?.prescription?.status || null;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    const lineTotal = item.price * item.qty;
    const discount = computeLineDiscount(
      item.price,
      item.qty,
      item.item_discount ?? 0,
      customerDiscountPct,
      item.unit_type ?? 'item',
      item.top_tier ?? 'item',
      item.offer_percent
    );
    return acc + (lineTotal - discount);
  }, 0);

  const prescriptionsPending = cartItems.some(
    item => item.requiresPrescription && !item.prescription?.file
  );

  // Block placing orders when any prescription-required item has no file attached.
  const canPlaceOrder = !prescriptionsPending;

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      uploadPrescription,
      getPrescriptionStatus,
      cartCount,
      cartTotal,
      canPlaceOrder,
      prescriptionsPending
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
