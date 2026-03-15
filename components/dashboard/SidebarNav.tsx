"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { Boxes, LayoutGrid, ShoppingCart, Users, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const SIDEBAR_COLLAPSED_KEY = "pulse-rx-sidebar-collapsed";

const navItems = [
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/offers", label: "Offers", icon: Tag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      // ignore
    }
  }, [mounted]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:border-r lg:border-gray-100 lg:bg-white/50 backdrop-blur-sm shrink-0 transition-[width] duration-200 ease-in-out relative",
        collapsed ? "lg:w-[72px]" : "lg:w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center border-b border-gray-100 shrink-0", collapsed ? "justify-center p-4" : "gap-3 p-6 pr-12")}>
        <div className="h-9 w-9 shrink-0 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
          <LayoutGrid className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 leading-tight truncate">Pulse RX</div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Manage</div>
          </div>
        )}
        {/* Toggle in brand row when expanded */}
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Collapse sidebar"
            className="absolute right-3 top-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav - when collapsed, toggle sits just below the links */}
      <nav className={cn("flex-1 overflow-hidden flex flex-col", collapsed ? "px-3 py-4 pt-5" : "px-3 pb-6 pt-4")}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center",
                  active
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
        {/* Toggle just below nav icons when collapsed */}
        {collapsed && (
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expand sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
