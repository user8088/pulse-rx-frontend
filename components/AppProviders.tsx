"use client";

import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const StoreProviders = dynamic(() => import("@/components/StoreProviders"), { ssr: false });

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Keep the storefront and dashboard fully separate: the dashboard should not
  // mount storefront-only UX (cart, magic cursor, smooth scroll, etc).
  // Coming soon is a minimal shell without storefront providers.
  // Strip /test prefix when checking route groups.
  const effectivePath = pathname?.startsWith("/test")
    ? pathname.slice("/test".length) || "/"
    : pathname;

  if (
    effectivePath?.startsWith("/dashboard") ||
    effectivePath === "/coming-soon"
  ) {
    return <>{children}</>;
  }

  return <StoreProviders>{children}</StoreProviders>;
}

