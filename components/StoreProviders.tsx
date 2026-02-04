"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { SmoothScroll } from "@/components/SmoothScroll";
import MagicCursor from "@/components/MagicCursor";
import CartSidebar from "@/components/CartSidebar";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - avoid refetch on every mount
      },
    },
  });
}

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MagicCursor />
      <SmoothScroll />
      <AuthProvider>
        <CartProvider>
          <CartSidebar />
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

