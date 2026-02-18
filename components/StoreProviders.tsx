"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
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

function GlobalQueryLoader() {
  const isFetching = useIsFetching();
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // During the very first app load, show the loader while any queries are fetching.
    if (!hasCompletedInitialLoad) {
      if (isFetching) {
        setVisible(true);
      } else if (visible) {
        // Small delay when hiding to avoid quick flickers.
        const timeout = setTimeout(() => {
          setVisible(false);
          setHasCompletedInitialLoad(true);
        }, 200);
        return () => clearTimeout(timeout);
      }
      return;
    }

    // After the first full load, don't show the global loader again.
  }, [isFetching, hasCompletedInitialLoad, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-[#01AC28] border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  );
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
          <GlobalQueryLoader />
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

