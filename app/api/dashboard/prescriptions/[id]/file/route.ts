import { NextRequest, NextResponse } from "next/server";
import { dashboardFetch } from "@/lib/dashboardApi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await dashboardFetch(`/dashboard/prescriptions/${id}/file`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not retrieve file URL" },
      { status: res.status }
    );
  }
  const data = await res.json();
  return NextResponse.json(data);
}
