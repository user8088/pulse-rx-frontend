"use client";

import React from "react";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { SmoothScroll } from "@/components/SmoothScroll";
import MagicCursor from "@/components/MagicCursor";
import CartSidebar from "@/components/CartSidebar";

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MagicCursor />
      <SmoothScroll />
      <AuthProvider>
        <CartProvider>
          <CartSidebar />
          {children}
        </CartProvider>
      </AuthProvider>
    </>
  );
}

