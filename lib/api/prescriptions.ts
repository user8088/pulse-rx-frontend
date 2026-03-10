import apiClient from "./client";
import type { Prescription, PaginatedPrescriptions } from "@/types/prescription";

// ---------------------------------------------------------------------------
// Customer (authenticated) — uses apiClient with Bearer token from localStorage
// ---------------------------------------------------------------------------

export async function listPrescriptions(
  orderId: number | string,
  orderItemId: number | string
): Promise<Prescription[]> {
  const { data } = await apiClient.get<PaginatedPrescriptions>(
    `/customer/orders/${orderId}/items/${orderItemId}/prescriptions`
  );
  return data.data ?? [];
}

export async function uploadPrescription(
  orderId: number | string,
  orderItemId: number | string,
  file: File,
  notes?: string
): Promise<Prescription> {
  const form = new FormData();
  form.append("file", file);
  if (notes) form.append("notes", notes);
  const { data } = await apiClient.post<Prescription>(
    `/customer/orders/${orderId}/items/${orderItemId}/prescriptions`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deletePrescription(
  orderId: number | string,
  orderItemId: number | string,
  prescriptionId: number | string
): Promise<void> {
  await apiClient.delete(
    `/customer/orders/${orderId}/items/${orderItemId}/prescriptions/${prescriptionId}`
  );
}

// ---------------------------------------------------------------------------
// Guest (unauthenticated) — uses apiClient (no token needed, phone in query)
// ---------------------------------------------------------------------------

export async function listGuestPrescriptions(
  orderNumber: string,
  orderItemId: number | string,
  phone: string
): Promise<Prescription[]> {
  const { data } = await apiClient.get<PaginatedPrescriptions>(
    `/orders/${encodeURIComponent(orderNumber)}/items/${orderItemId}/prescriptions`,
    { params: { phone } }
  );
  return data.data ?? [];
}

export async function uploadGuestPrescription(
  orderNumber: string,
  orderItemId: number | string,
  phone: string,
  file: File,
  notes?: string
): Promise<Prescription> {
  const form = new FormData();
  form.append("file", file);
  if (notes) form.append("notes", notes);
  const { data } = await apiClient.post<Prescription>(
    `/orders/${encodeURIComponent(orderNumber)}/items/${orderItemId}/prescriptions`,
    form,
    {
      params: { phone },
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

// ---------------------------------------------------------------------------
// Dashboard functions are handled via Next.js API route proxies at
// /api/dashboard/prescriptions/* (which use dashboardFetch server-side).
// See app/api/dashboard/prescriptions/ for the implementations.
// ---------------------------------------------------------------------------
