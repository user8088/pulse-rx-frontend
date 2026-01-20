"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const subNavItems = [
  { href: "/dashboard/inventory", label: "Products" },
  { href: "/dashboard/inventory/categories", label: "Categories" },
  { href: "/dashboard/inventory/import-logs", label: "Import logs" },
];

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex border-b border-gray-200">
        {subNavItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-colors border-b-2",
                active
                  ? "border-[#01AC28] text-[#111827]"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
