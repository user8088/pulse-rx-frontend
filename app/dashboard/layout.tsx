import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard • Pulse RX",
  description: "Pulse RX dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50 text-[#111827]">{children}</div>;
}

