import { NextRequest, NextResponse } from "next/server";
import { dashboardFetch } from "@/lib/dashboardApi";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ customerId: string; profileId: string; prescriptionId: string }> }
) {
  const { customerId, profileId, prescriptionId } = await params;
  const res = await dashboardFetch(
    `/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions/${prescriptionId}/file`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not retrieve prescription file URL" },
      { status: res.status }
    );
  }
  const data = await res.json();
  return NextResponse.json(data);
}
