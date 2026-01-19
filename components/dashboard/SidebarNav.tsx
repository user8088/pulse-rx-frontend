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
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:gap-6 lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#044644] text-white flex items-center justify-center shadow-sm">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-black text-[#374151] leading-tight">Pulse RX</div>
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
              Dashboard
            </div>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-6">
        <div className="px-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-3">
          Manage
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
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
                  active
                    ? "bg-[#EFEFEF] text-[#111827]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-[#01AC28]" : "text-gray-400 group-hover:text-[#01AC28]"
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

