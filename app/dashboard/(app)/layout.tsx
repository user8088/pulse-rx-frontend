import SidebarNav from "@/components/dashboard/SidebarNav";
import { dashboardSignOut } from "@/app/dashboard/sign-in/actions";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export default function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <SidebarNav />

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                  Pulse RX
                </div>
                <div className="text-lg font-black text-[#374151] leading-tight">
                  Inventory Management
                </div>
              </div>

              <form action={dashboardSignOut}>
                <Button type="submit" variant="secondary" size="sm" className="tracking-[0.2em]">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </header>

          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

