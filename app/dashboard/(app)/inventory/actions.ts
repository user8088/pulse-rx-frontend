"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import type { ProductImportResult } from "@/types";

const LAST_IMPORT_COOKIE = "prx_products_last_import";

function toIntOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
  return n;
}

function toBool(value: FormDataEntryValue | null): boolean | undefined {
  if (value === null) return undefined;
  const s = String(value).trim().toLowerCase();
  if (!s) return undefined;
  return s === "true" || s === "1" || s === "on" || s === "yes";
}

function toFloatOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
  return n;
}

export async function createProduct(formData: FormData) {
  const item_id = String(formData.get("item_id") ?? "").trim();
  const item_name = String(formData.get("item_name") ?? "").trim();
  const brandRaw = String(formData.get("brand") ?? "").trim();
  const category_id_raw = String(formData.get("category_id") ?? "").trim();
  const stock_qty = toIntOrUndefined(formData.get("stock_qty"));
  const low_stock_threshold = toIntOrUndefined(formData.get("low_stock_threshold"));
  const retail_price = toFloatOrUndefined(formData.get("retail_price"));

  if (!item_id || !item_name) {
    return redirect(
      "/dashboard/inventory?error=missing&message=Item ID and Item Name are required."
    );
  }

  const body: Record<string, unknown> = {
    item_id,
    item_name,
  };

  if (brandRaw) body.brand = brandRaw;
  if (category_id_raw) {
    const n = Number.parseInt(category_id_raw, 10);
    if (Number.isFinite(n)) body.category_id = n;
  }
  if (typeof stock_qty === "number") body.stock_qty = stock_qty;
  if (typeof low_stock_threshold === "number") body.low_stock_threshold = low_stock_threshold;
  if (typeof retail_price === "number") body.retail_price = retail_price;

  let res: Response;
  try {
    res = await dashboardFetch("/products", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Product created successfully.");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const item_id = String(formData.get("item_id") ?? "").trim();
  const item_name = String(formData.get("item_name") ?? "").trim();
  const hasBrand = formData.has("brand");
  const hasCategory = formData.has("category_id");
  const brandRaw = String(formData.get("brand") ?? "");
  const category_id_raw = String(formData.get("category_id") ?? "").trim();
  const stock_qty = toIntOrUndefined(formData.get("stock_qty"));
  const low_stock_threshold = toIntOrUndefined(formData.get("low_stock_threshold"));
  const retail_price = toFloatOrUndefined(formData.get("retail_price"));

  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }

  const body: Record<string, unknown> = {};
  if (item_id) body.item_id = item_id;
  if (item_name) body.item_name = item_name;

  // Allow clearing brand/category by sending null (only if fields were submitted).
  if (hasBrand) {
    const brandTrimmed = String(brandRaw ?? "").trim();
    body.brand = brandTrimmed ? brandTrimmed : null;
  }
  if (hasCategory) {
    body.category_id = category_id_raw ? Number.parseInt(category_id_raw, 10) : null;
  }

  if (typeof stock_qty === "number") body.stock_qty = stock_qty;
  if (typeof low_stock_threshold === "number") body.low_stock_threshold = low_stock_threshold;
  if (typeof retail_price === "number") body.retail_price = retail_price;

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Product updated successfully.");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${id}`, { method: "DELETE" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Product deleted successfully.");
}

export async function importProductsExcel(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.name) {
    return redirect("/dashboard/inventory?error=missing&message=Please choose an Excel file to import.");
  }

  // Only pass expected fields to backend.
  const payload = new FormData();
  payload.set("file", file);

  let res: Response;
  try {
    res = await dashboardFetch("/products/import", { method: "POST", body: payload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  const result = (await res.json()) as ProductImportResult;
  const issues = Array.isArray(result.errors) ? result.errors.length : 0;
  const msg = `Import complete: ${result.created_count} created, ${result.updated_count} updated, ${result.skipped_count} skipped${
    issues ? ` (${issues} issues)` : ""
  }.`;

  // Store a small "last import" summary for display (truncate errors for cookie size).
  const safe = {
    at: new Date().toISOString(),
    import_uuid: result.import_uuid ?? null,
    total_rows: result.total_rows,
    created_count: result.created_count,
    updated_count: result.updated_count,
    skipped_count: result.skipped_count,
    errors: (result.errors ?? []).slice(0, 20).map((e) => ({
      row: e.row,
      item_id: e.item_id ?? null,
      reason: e.reason,
      message: e.message,
    })),
  };

  (await cookies()).set(LAST_IMPORT_COOKIE, JSON.stringify(safe), {
    httpOnly: true,
    sameSite: "lax",
    path: "/dashboard/inventory",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 6, // 6 hours
  });

  revalidatePath("/dashboard/inventory");
  return redirect(`/dashboard/inventory?message=${encodeURIComponent(msg)}`);
}

export async function uploadProductImage(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "").trim();
  const file = formData.get("file");
  const is_primary = toBool(formData.get("is_primary"));

  if (!productId) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required for upload.");
  }
  if (!(file instanceof File) || !file.name) {
    return redirect("/dashboard/inventory?error=missing&message=Please choose an image file to upload.");
  }

  const payload = new FormData();
  payload.set("file", file);
  payload.set("is_primary", is_primary ? "1" : "0");

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${productId}/images/upload`, {
      method: "POST",
      body: payload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Image uploaded successfully.");
}

export async function updateProductImageMetadata(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "").trim();
  const imageId = String(formData.get("image_id") ?? "").trim();
  const is_primary = toBool(formData.get("is_primary"));
  const sort_order = toIntOrUndefined(formData.get("sort_order"));

  if (!productId || !imageId) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID and Image ID are required.");
  }

  const body: Record<string, unknown> = {};
  if (typeof is_primary === "boolean") body.is_primary = is_primary;
  if (typeof sort_order === "number") body.sort_order = sort_order;

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Image updated successfully.");
}

export async function deleteProductImage(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "").trim();
  const imageId = String(formData.get("image_id") ?? "").trim();

  if (!productId || !imageId) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID and Image ID are required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=Image deleted successfully.");
}

