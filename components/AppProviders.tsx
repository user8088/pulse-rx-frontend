"use client";

import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const StoreProviders = dynamic(() => import("@/components/StoreProviders"), { ssr: false });

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Keep the storefront and dashboard fully separate: the dashboard should not
  // mount storefront-only UX (cart, magic cursor, smooth scroll, etc).
  if (pathname?.startsWith("/dashboard")) {
    return <>{children}</>;
  }

  return <StoreProviders>{children}</StoreProviders>;
}

