import { NextRequest, NextResponse } from "next/server";
import { dashboardFetch } from "@/lib/dashboardApi";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.json({ data: [] });
  }
  const res = await dashboardFetch(
    `/dashboard/prescriptions?order_id=${orderId}&per_page=100`,
    { cache: "no-store" }
  );
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
