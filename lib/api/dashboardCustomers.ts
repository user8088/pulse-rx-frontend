import { dashboardFetch } from "@/lib/dashboardApi";
import type {
  Customer,
  PaginatedCustomers,
  CustomerImportResult,
  CustomerImportLog,
  PaginatedCustomerImportLogs,
  MedicalProfile,
  ProfileProduct,
  ProfilePrescription,
  CreateCustomerBody,
} from "@/types/customer";
import type { Order } from "@/types/order";

const BASE = "/dashboard/customers";

export async function getCustomers(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}): Promise<PaginatedCustomers | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.per_page != null) sp.set("per_page", String(params.per_page));
    if (params?.q?.trim()) sp.set("q", params.q.trim());
    const qs = sp.toString();
    const res = await dashboardFetch(qs ? `${BASE}?${qs}` : BASE, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCustomer(id: number | string): Promise<Customer | null> {
  try {
    const res = await dashboardFetch(`${BASE}/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createCustomer(body: CreateCustomerBody): Promise<Customer | null> {
  const res = await dashboardFetch(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCustomer(
  id: number | string,
  body: Partial<CreateCustomerBody>
): Promise<Customer | null> {
  const res = await dashboardFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCustomer(id: number | string): Promise<void> {
  const res = await dashboardFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function importCustomersExcel(file: File): Promise<CustomerImportResult> {
  const form = new FormData();
  form.set("file", file);
  const res = await dashboardFetch(`${BASE}/import`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCustomerImportLogs(params?: {
  per_page?: number;
  page?: number;
}): Promise<PaginatedCustomerImportLogs | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.per_page != null) sp.set("per_page", String(params.per_page));
    const qs = sp.toString();
    const res = await dashboardFetch(
      qs ? `/dashboard/customers/import-logs?${qs}` : "/dashboard/customers/import-logs",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCustomerImportLog(
  importUuid: string
): Promise<CustomerImportLog | null> {
  try {
    const res = await dashboardFetch(
      `/dashboard/customers/import-logs/${encodeURIComponent(importUuid)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCustomerOrders(
  customerId: number | string,
  params?: { page?: number; per_page?: number; status?: string; from_date?: string; to_date?: string }
): Promise<{ data: Order[]; total: number; current_page: number; last_page: number; from: number | null; to: number | null } | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.per_page != null) sp.set("per_page", String(params.per_page));
    if (params?.status) sp.set("status", params.status);
    if (params?.from_date) sp.set("from_date", params.from_date);
    if (params?.to_date) sp.set("to_date", params.to_date);
    const qs = sp.toString();
    const res = await dashboardFetch(
      qs ? `${BASE}/${customerId}/orders?${qs}` : `${BASE}/${customerId}/orders`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getOrder(orderId: number | string): Promise<Order | null> {
  try {
    const res = await dashboardFetch(`/dashboard/orders/${orderId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCustomerProfiles(
  customerId: number | string,
  opts?: { with_products?: boolean; with_prescriptions?: boolean }
): Promise<MedicalProfile[]> {
  try {
    const sp = new URLSearchParams();
    if (opts?.with_products) sp.set("with_products", "1");
    if (opts?.with_prescriptions) sp.set("with_prescriptions", "1");
    const qs = sp.toString();
    const res = await dashboardFetch(
      qs ? `${BASE}/${customerId}/profiles?${qs}` : `${BASE}/${customerId}/profiles`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getProfile(
  customerId: number | string,
  profileId: number | string
): Promise<MedicalProfile | null> {
  try {
    const res = await dashboardFetch(
      `${BASE}/${customerId}/profiles/${profileId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createProfile(
  customerId: number | string,
  body: { name: string; sort_order?: number }
): Promise<MedicalProfile | null> {
  const res = await dashboardFetch(`${BASE}/${customerId}/profiles`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProfile(
  customerId: number | string,
  profileId: number | string,
  body: { name?: string; sort_order?: number }
): Promise<MedicalProfile | null> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProfile(
  customerId: number | string,
  profileId: number | string
): Promise<void> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function getProfileProducts(
  customerId: number | string,
  profileId: number | string
): Promise<ProfileProduct[]> {
  try {
    const res = await dashboardFetch(
      `${BASE}/${customerId}/profiles/${profileId}/products`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addProfileProduct(
  customerId: number | string,
  profileId: number | string,
  body: { product_id: number; quantity?: number }
): Promise<unknown> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/products`,
    { method: "POST", body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addProfileProductsFromOrder(
  customerId: number | string,
  profileId: number | string,
  body: { order_id: number; order_item_ids?: number[] }
): Promise<unknown> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/products/from-order`,
    { method: "POST", body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeProfileProduct(
  customerId: number | string,
  profileId: number | string,
  productId: number | string
): Promise<void> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/products/${productId}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function getProfilePrescriptions(
  customerId: number | string,
  profileId: number | string
): Promise<ProfilePrescription[]> {
  try {
    const res = await dashboardFetch(
      `${BASE}/${customerId}/profiles/${profileId}/prescriptions`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function uploadProfilePrescription(
  customerId: number | string,
  profileId: number | string,
  file: File
): Promise<ProfilePrescription | null> {
  const form = new FormData();
  form.set("file", file);
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/prescriptions`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addProfilePrescriptionFromOrder(
  customerId: number | string,
  profileId: number | string,
  body: { prescription_id: number }
): Promise<unknown> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/prescriptions/from-order`,
    { method: "POST", body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeProfilePrescription(
  customerId: number | string,
  profileId: number | string,
  profilePrescriptionId: number | string
): Promise<void> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/prescriptions/${profilePrescriptionId}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function getProfilePrescriptionFileUrl(
  customerId: number | string,
  profileId: number | string,
  profilePrescriptionId: number | string
): Promise<string> {
  const res = await dashboardFetch(
    `${BASE}/${customerId}/profiles/${profileId}/prescriptions/${profilePrescriptionId}/file`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { url: string };
  return data.url;
}
