"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { dashboardSignOut } from "@/app/dashboard/sign-in/actions";
import type { User } from "@/types";

export function DashboardHeader({ userRole }: { userRole?: User["role"] }) {
  const pathname = usePathname();
  const isOrders = pathname?.startsWith("/dashboard/orders");
  const title = isOrders ? "Order Management" : "Inventory Management";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            Pulse RX
          </div>
          <div className="text-base font-semibold text-gray-900 leading-tight">
            {title}
          </div>
          {userRole ? (
            <div className="mt-0.5 text-[10px] font-medium text-gray-400 capitalize">
              {userRole.replace(/_/g, " ")}
            </div>
          ) : null}
        </div>

        <form action={dashboardSignOut}>
          <Button type="submit" variant="secondary" size="sm" className="font-medium tracking-normal h-8 rounded-lg">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
