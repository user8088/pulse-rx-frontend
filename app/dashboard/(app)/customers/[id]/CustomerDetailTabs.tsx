"use client";

import Link from "@/lib/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/utils/cn";
import { User, Percent, ShoppingCart, FolderHeart } from "lucide-react";

const TABS = [
  { key: "info", label: "Info", icon: User },
  { key: "discount", label: "Discount", icon: Percent },
  { key: "orders", label: "Order history", icon: ShoppingCart },
  { key: "profiles", label: "Medical profiles", icon: FolderHeart },
] as const;

export function CustomerDetailTabs({
  customerId,
  currentTab,
}: {
  customerId: number | string;
  currentTab: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const base = `/dashboard/customers/${customerId}`;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-gray-200">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = currentTab === key;
        const href = key === "info" ? base : `${base}?tab=${key}`;
        return (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-[#01AC28] text-[#01AC28]"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
