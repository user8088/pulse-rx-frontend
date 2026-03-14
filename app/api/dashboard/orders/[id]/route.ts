import { NextRequest, NextResponse } from "next/server";
import { dashboardFetch } from "@/lib/dashboardApi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }
  const res = await dashboardFetch(`/dashboard/orders/${id}`, { cache: "no-store" });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
