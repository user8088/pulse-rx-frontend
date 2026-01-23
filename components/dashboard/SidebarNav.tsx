"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { Boxes, LayoutGrid } from "lucide-react";

const navItems = [
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Boxes,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:gap-4 lg:border-r lg:border-gray-100 lg:bg-white/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">Pulse RX</div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Manage
            </div>
          </div>
        </div>
      </div>

      <nav className="px-3 pb-6">
        <div className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Inventory
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

