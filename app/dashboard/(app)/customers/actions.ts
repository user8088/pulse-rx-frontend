"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import type { CreateCustomerBody } from "@/types/customer";

function toNum(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

export async function createCustomerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return redirect("/dashboard/customers?error=missing&message=Name is required.");
  }

  const body: CreateCustomerBody = { name };
  const email = String(formData.get("email") ?? "").trim();
  if (email) body.email = email;
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone) body.phone = phone;
  const external_id = String(formData.get("external_id") ?? "").trim();
  if (external_id) body.external_id = external_id;
  const gender = String(formData.get("gender") ?? "").trim().toLowerCase();
  if (gender && ["male", "female", "other"].includes(gender)) body.gender = gender;
  const address = String(formData.get("address") ?? "").trim();
  if (address) body.address = address;
  const city = String(formData.get("city") ?? "").trim();
  if (city) body.city = city;
  const lat = toNum(formData.get("latitude"));
  if (lat != null) body.latitude = lat;
  const lng = toNum(formData.get("longitude"));
  if (lng != null) body.longitude = lng;
  const discount = toNum(formData.get("discount_percentage"));
  if (discount != null) body.discount_percentage = discount;

  let res: Response;
  try {
    res = await dashboardFetch("/dashboard/customers", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/customers?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/customers?error=failed&message=${encodeURIComponent(message)}`);
  }

  const data = await res.json();
  revalidatePath("/dashboard/customers");
  return redirect(`/dashboard/customers?message=Customer created.`);
}

export async function updateCustomerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/customers?error=missing&message=Customer ID is required.");
  }

  const body: Partial<CreateCustomerBody> = {};
  const name = String(formData.get("name") ?? "").trim();
  if (name) body.name = name;
  if (formData.has("email")) body.email = String(formData.get("email") ?? "").trim() || null;
  if (formData.has("phone")) body.phone = String(formData.get("phone") ?? "").trim() || null;
  if (formData.has("external_id")) body.external_id = String(formData.get("external_id") ?? "").trim() || null;
  if (formData.has("gender")) {
    const g = String(formData.get("gender") ?? "").trim().toLowerCase();
    body.gender = ["male", "female", "other"].includes(g) ? g : null;
  }
  if (formData.has("address")) body.address = String(formData.get("address") ?? "").trim() || null;
  if (formData.has("city")) body.city = String(formData.get("city") ?? "").trim() || null;
  if (formData.has("latitude")) {
    const v = toNum(formData.get("latitude"));
    body.latitude = v ?? null;
  }
  if (formData.has("longitude")) {
    const v = toNum(formData.get("longitude"));
    body.longitude = v ?? null;
  }
  if (formData.has("discount_percentage")) {
    const v = toNum(formData.get("discount_percentage"));
    body.discount_percentage = v ?? 0;
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/dashboard/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/customers/${id}?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/customers/${id}?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${id}`);
  return redirect(`/dashboard/customers/${id}?message=Customer updated.`);
}

export async function deleteCustomerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/customers?error=missing&message=Customer ID is required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/dashboard/customers/${id}`, { method: "DELETE" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/customers/${id}?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/customers/${id}?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/customers");
  return redirect("/dashboard/customers?message=Customer deleted.");
}

export async function importCustomersAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.name) {
    return redirect("/dashboard/customers/import?error=missing&message=Please choose an Excel file.");
  }

  const payload = new FormData();
  payload.set("file", file);

  let res: Response;
  try {
    res = await dashboardFetch("/dashboard/customers/import", { method: "POST", body: payload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/customers/import?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/customers/import?error=failed&message=${encodeURIComponent(message)}`);
  }

  const result = await res.json();
  const importUuid = result.import_uuid ?? "";
  const msg = `Import complete: ${result.created_count} created, ${result.updated_count} updated, ${result.skipped_count} skipped.`;
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/customers/import");
  return redirect(
    `/dashboard/customers/import?message=${encodeURIComponent(msg)}&import_uuid=${encodeURIComponent(importUuid)}`
  );
}

// --- Medical profile actions (for customer detail page) ---

export async function createProfileAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!customerId || !name) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Profile name is required.`
    );
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/dashboard/customers/${customerId}/profiles`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Profile added.`);
}

export async function addProfileProductAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const product_id = Number(formData.get("product_id"));
  const quantity = Number(formData.get("quantity")) || 1;
  if (!customerId || !profileId || !Number.isFinite(product_id)) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Customer, profile, and product are required.`
    );
  }

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/products`,
      { method: "POST", body: JSON.stringify({ product_id, quantity }) }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Product added to profile.`);
}

export async function removeProfileProductAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const productId = String(formData.get("product_id") ?? "").trim();
  if (!customerId || !profileId || !productId) {
    return redirect(`/dashboard/customers/${customerId}?tab=profiles&error=missing`);
  }

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/products/${productId}`,
      { method: "DELETE" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Product removed.`);
}

export async function uploadProfilePrescriptionAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const file = formData.get("file");
  if (!customerId || !profileId) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Customer and profile are required.`
    );
  }
  if (!(file instanceof File) || !file.name) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Please choose a file.`
    );
  }

  const payload = new FormData();
  payload.set("file", file);
  const name = String(formData.get("name") ?? "").trim();
  if (name) payload.set("name", name);

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions`,
      { method: "POST", body: payload }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Prescription uploaded.`);
}

export async function removeProfilePrescriptionAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const prescriptionId = String(formData.get("prescription_id") ?? "").trim();
  if (!customerId || !profileId || !prescriptionId) {
    return redirect(`/dashboard/customers/${customerId}?tab=profiles&error=missing`);
  }

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions/${prescriptionId}`,
      { method: "DELETE" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Prescription removed.`);
}

export async function addProfileProductsFromOrderAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const orderIdRaw = formData.get("order_id");
  const order_id = orderIdRaw != null ? Number(orderIdRaw) : NaN;
  const order_item_idsRaw = formData.getAll("order_item_ids[]");
  const order_item_ids = order_item_idsRaw
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));

  if (!customerId || !profileId || !Number.isFinite(order_id)) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Customer, profile, and order are required.`
    );
  }

  const body = order_item_ids.length > 0 ? { order_id, order_item_ids } : { order_id };
  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/products/from-order`,
      { method: "POST", body: JSON.stringify(body) }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(
    `/dashboard/customers/${customerId}?tab=profiles&message=Products from order added to profile.`
  );
}

export async function addProfilePrescriptionFromOrderAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const prescriptionIdRaw = formData.get("prescription_id");
  const prescription_id = prescriptionIdRaw != null ? Number(prescriptionIdRaw) : NaN;

  if (!customerId || !profileId || !Number.isFinite(prescription_id)) {
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=missing&message=Customer, profile, and prescription are required.`
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const body: { prescription_id: number; name?: string } = { prescription_id };
  if (name) body.name = name;

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions/from-order`,
      { method: "POST", body: JSON.stringify(body) }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(
    `/dashboard/customers/${customerId}?tab=profiles&message=Prescription from order added to profile.`
  );
}

export async function updateProfilePrescriptionAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const prescriptionId = String(formData.get("prescription_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!customerId || !profileId || !prescriptionId) {
    return redirect(`/dashboard/customers/${customerId}?tab=profiles&error=missing`);
  }

  const body: { name?: string | null } = {};
  body.name = name || null;

  let res: Response;
  try {
    res = await dashboardFetch(
      `/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions/${prescriptionId}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=network&message=${encodeURIComponent(message)}`
    );
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(
      `/dashboard/customers/${customerId}?tab=profiles&error=failed&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  return redirect(`/dashboard/customers/${customerId}?tab=profiles&message=Prescription updated.`);
}
