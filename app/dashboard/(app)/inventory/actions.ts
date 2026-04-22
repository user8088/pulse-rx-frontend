"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import type { Product, ProductDetailSection, ProductImportResult } from "@/types";

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

/**
 * Catalog publish / review actions.
 * Mutations elsewhere use `/products/...` (PUT, DELETE, import). Approve/reject must use the same routes
 * so Laravel policies match (dashboard-prefixed routes may be admin-only and return 403 "unauthorized").
 * Try `/products/{id}/{action}` first; on 403/404/405 try `/dashboard/products/{id}/{action}`.
 */
async function postCatalogWorkflow(
  productId: string,
  action: "approve" | "reject" | "submit-for-review",
  init?: RequestInit
): Promise<Response> {
  const opts: RequestInit = { method: "POST", ...init };
  const primary = await dashboardFetch(`/products/${productId}/${action}`, opts);
  if (primary.ok) return primary;
  if (primary.status === 403 || primary.status === 404 || primary.status === 405) {
    const fallback = await dashboardFetch(`/dashboard/products/${productId}/${action}`, opts);
    if (fallback.ok) return fallback;
  }
  return primary;
}

function parseDetailSectionsJson(raw: string): ProductDetailSection[] | null {
  const s = raw.trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: ProductDetailSection[] = [];
    const seenKeys = new Set<string>();
    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      if (!row || typeof row !== "object") return null;
      const key = String((row as Record<string, unknown>).key ?? "").trim();
      const label = String((row as Record<string, unknown>).label ?? "").trim();
      const content = String((row as Record<string, unknown>).content ?? "");
      if (!key || !label) return null;
      if (seenKeys.has(key)) return null;
      seenKeys.add(key);
      const sortRaw = (row as Record<string, unknown>).sort_order;
      const sort_order =
        typeof sortRaw === "number" && Number.isFinite(sortRaw) ? sortRaw : i;
      out.push({ key, label, content, sort_order });
    }
    return out;
  } catch {
    return null;
  }
}

/** Full product row for editing tabs (list responses may omit `detail_sections` bodies). */
export async function getDashboardProduct(id: string): Promise<Product | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;
  try {
    const res = await dashboardFetch(`/dashboard/products/${trimmed}`);
    if (!res.ok) return null;
    return res.json() as Promise<Product>;
  } catch {
    return null;
  }
}

export async function createProduct(formData: FormData) {
  const item_id = String(formData.get("item_id") ?? "").trim();
  const item_name = String(formData.get("item_name") ?? "").trim();
  const brandRaw = String(formData.get("brand") ?? "").trim();
  const category_id_raw = String(formData.get("category_id") ?? "").trim();
  const generic_name_raw = String(formData.get("generic_name") ?? "").trim();
  const is_narcotic = toBool(formData.get("is_narcotic"));
  const retail_price_unit = toFloatOrUndefined(formData.get("retail_price_unit"));
  const retail_price_item = toFloatOrUndefined(formData.get("retail_price_item"));
  const retail_price_secondary = toFloatOrUndefined(formData.get("retail_price_secondary"));
  const retail_price_box = toFloatOrUndefined(formData.get("retail_price_box"));
  const can_sell_item = toBool(formData.get("can_sell_item"));
  const can_sell_secondary = toBool(formData.get("can_sell_secondary"));
  const can_sell_box = toBool(formData.get("can_sell_box"));
  const secondary_unit_label_raw = String(formData.get("secondary_unit_label") ?? "").trim();
  const box_unit_label_raw = String(formData.get("box_unit_label") ?? "").trim();
  const base_unit_label_raw = String(formData.get("base_unit_label") ?? "").trim();
  const pack_qty = toIntOrUndefined(formData.get("pack_qty"));
  const strip_qty = toIntOrUndefined(formData.get("strip_qty"));
  const availability_raw = String(formData.get("availability") ?? "").trim().toLowerCase();
  const cold_chain_needed = toBool(formData.get("cold_chain_needed"));
  const item_discount = toFloatOrUndefined(formData.get("item_discount"));

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
  if (generic_name_raw) body.generic_name = generic_name_raw;
  if (category_id_raw) {
    const n = Number.parseInt(category_id_raw, 10);
    if (Number.isFinite(n)) body.category_id = n;
  }
  if (typeof is_narcotic === "boolean") body.is_narcotic = is_narcotic;
  if (typeof retail_price_unit === "number") body.retail_price_unit = retail_price_unit;
  if (typeof retail_price_item === "number") body.retail_price_item = retail_price_item;
  if (typeof retail_price_secondary === "number") body.retail_price_secondary = retail_price_secondary;
  if (typeof retail_price_box === "number") body.retail_price_box = retail_price_box;
  if (typeof can_sell_item === "boolean") body.can_sell_item = can_sell_item;
  if (typeof can_sell_secondary === "boolean") body.can_sell_secondary = can_sell_secondary;
  if (typeof can_sell_box === "boolean") body.can_sell_box = can_sell_box;
  if (secondary_unit_label_raw) body.secondary_unit_label = secondary_unit_label_raw;
  if (box_unit_label_raw) body.box_unit_label = box_unit_label_raw;
  body.base_unit_label = base_unit_label_raw || null;
  if (typeof pack_qty === "number") body.pack_qty = pack_qty;
  if (typeof strip_qty === "number") body.strip_qty = strip_qty;
  if (availability_raw && ["yes", "no", "short"].includes(availability_raw)) {
    body.availability = availability_raw;
  }
  if (typeof cold_chain_needed === "boolean") body.cold_chain_needed = cold_chain_needed;
  if (typeof item_discount === "number") body.item_discount = item_discount;

  const subcategoryRaw = formData.getAll("subcategory_ids[]");
  const subcategory_ids = subcategoryRaw
    .map((v) => Number.parseInt(String(v), 10))
    .filter((n) => Number.isFinite(n));
  if (subcategory_ids.length > 0) body.subcategory_ids = subcategory_ids;

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

function buildUpdateBody(formData: FormData): { id: string; body: Record<string, unknown> } | { error: string } {
  const id = String(formData.get("id") ?? "").trim();
  const item_id = String(formData.get("item_id") ?? "").trim();
  const item_name = String(formData.get("item_name") ?? "").trim();
  const hasBrand = formData.has("brand");
  const hasCategory = formData.has("category_id");
  const hasGenericName = formData.has("generic_name");
  const brandRaw = String(formData.get("brand") ?? "");
  const category_id_raw = String(formData.get("category_id") ?? "").trim();
  const generic_name_raw = String(formData.get("generic_name") ?? "");
  const is_narcotic = toBool(formData.get("is_narcotic"));
  const retail_price_unit = toFloatOrUndefined(formData.get("retail_price_unit"));
  const retail_price_item = toFloatOrUndefined(formData.get("retail_price_item"));
  const retail_price_secondary = toFloatOrUndefined(formData.get("retail_price_secondary"));
  const retail_price_box = toFloatOrUndefined(formData.get("retail_price_box"));
  const can_sell_item = toBool(formData.get("can_sell_item"));
  const can_sell_secondary = toBool(formData.get("can_sell_secondary"));
  const can_sell_box = toBool(formData.get("can_sell_box"));
  const secondary_unit_label_raw = String(formData.get("secondary_unit_label") ?? "");
  const box_unit_label_raw = String(formData.get("box_unit_label") ?? "").trim();
  const base_unit_label_raw = String(formData.get("base_unit_label") ?? "").trim();
  const pack_qty = toIntOrUndefined(formData.get("pack_qty"));
  const strip_qty = toIntOrUndefined(formData.get("strip_qty"));
  const availability_raw = String(formData.get("availability") ?? "").trim().toLowerCase();
  const cold_chain_needed = toBool(formData.get("cold_chain_needed"));
  const item_discount = toFloatOrUndefined(formData.get("item_discount"));

  if (!id) return { error: "Product ID is required." };

  const body: Record<string, unknown> = {};
  if (item_id) body.item_id = item_id;
  if (item_name) body.item_name = item_name;

  if (hasBrand) {
    const brandTrimmed = String(brandRaw ?? "").trim();
    body.brand = brandTrimmed ? brandTrimmed : null;
  }
  if (hasCategory) {
    body.category_id = category_id_raw ? Number.parseInt(category_id_raw, 10) : null;
  }
  if (hasGenericName) {
    const gn = String(generic_name_raw ?? "").trim();
    body.generic_name = gn || null;
  }

  if (typeof is_narcotic === "boolean") body.is_narcotic = is_narcotic;
  if (typeof retail_price_unit === "number") body.retail_price_unit = retail_price_unit;
  if (typeof retail_price_item === "number") body.retail_price_item = retail_price_item;
  if (typeof retail_price_secondary === "number") body.retail_price_secondary = retail_price_secondary;
  if (typeof retail_price_box === "number") body.retail_price_box = retail_price_box;
  if (typeof can_sell_item === "boolean") body.can_sell_item = can_sell_item;
  if (typeof can_sell_secondary === "boolean") body.can_sell_secondary = can_sell_secondary;
  if (typeof can_sell_box === "boolean") body.can_sell_box = can_sell_box;
  if (secondary_unit_label_raw.trim()) body.secondary_unit_label = secondary_unit_label_raw.trim();
  if (box_unit_label_raw) body.box_unit_label = box_unit_label_raw;
  body.base_unit_label = base_unit_label_raw || null;
  if (typeof pack_qty === "number") body.pack_qty = pack_qty;
  if (typeof strip_qty === "number") body.strip_qty = strip_qty;
  if (availability_raw && ["yes", "no", "short"].includes(availability_raw)) {
    body.availability = availability_raw;
  }
  if (typeof cold_chain_needed === "boolean") body.cold_chain_needed = cold_chain_needed;
  if (typeof item_discount === "number") body.item_discount = item_discount;

  const subcategoryRaw = formData.getAll("subcategory_ids[]");
  const subcategory_ids = subcategoryRaw
    .map((v) => Number.parseInt(String(v), 10))
    .filter((n) => Number.isFinite(n));
  body.subcategory_ids = subcategory_ids;

  const detailReady = String(formData.get("detail_sections_ready") ?? "") === "1";
  if (detailReady) {
    const rawJson = String(formData.get("detail_sections_json") ?? "");
    const sections = parseDetailSectionsJson(rawJson);
    if (sections === null) {
      return { error: "Invalid detail tabs. Each tab needs a header, and tabs must not conflict. Try again or reload the page." };
    }
    body.detail_sections = sections.map((s, index) => ({
      key: s.key,
      label: s.label,
      content: s.content,
      sort_order: s.sort_order ?? index,
    }));
    const lockStr = String(formData.get("detail_sections_locked") ?? "true").trim().toLowerCase();
    body.detail_sections_locked = lockStr !== "false" && lockStr !== "0";
  }

  return { id, body };
}

async function sendProductUpdate(id: string, body: Record<string, unknown>): Promise<string | null> {
  let res: Response;
  try {
    res = await dashboardFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    return err instanceof Error ? err.message : "Network error";
  }
  if (!res.ok) return await readErrorMessage(res);
  return null;
}

export async function updateProduct(formData: FormData) {
  const parsed = buildUpdateBody(formData);
  if ("error" in parsed) {
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(parsed.error)}`);
  }

  const err = await sendProductUpdate(parsed.id, parsed.body);
  if (err) {
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(err)}`);
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

/** Clears all detail tabs and allows object-storage / Excel detail sync to repopulate. */
export async function clearProductDetailSections(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({ detail_sections: null }),
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
  return redirect("/dashboard/inventory?message=Detail tabs cleared. File sync can update this product again.");
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
    if (res.status === 403) {
      return redirect(
        `/dashboard/inventory?error=failed&message=${encodeURIComponent(
          "Import denied (403). Backend must allow product_manager on POST /products/import; new rows should default to draft until a pharmacist approves. See changelog.md."
        )}`
      );
    }
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

export async function updateProductAndSubmit(formData: FormData) {
  const parsed = buildUpdateBody(formData);
  if ("error" in parsed) {
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(parsed.error)}`);
  }

  const updateErr = await sendProductUpdate(parsed.id, parsed.body);
  if (updateErr) {
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(updateErr)}`);
  }

  let res: Response;
  try {
    res = await postCatalogWorkflow(parsed.id, "submit-for-review");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }
  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=" + encodeURIComponent("Changes saved and submitted for review."));
}

/**
 * Inline variant that returns a result object instead of redirecting.
 * Used from the client via useTransition so the edit panel stays open.
 */
export async function stageImageDeletionInline(
  productId: number,
  imageId: number
): Promise<{ ok: boolean; error?: string }> {
  if (!productId || !imageId) {
    return { ok: false, error: "Product ID and Image ID are required." };
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/products/${productId}/images/${imageId}/stage-deletion`, {
      method: "POST",
    });
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return { ok: false, error: message };
  }

  revalidatePath("/dashboard/inventory");
  return { ok: true };
}

export async function submitProductForReview(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }
  let res: Response;
  try {
    res = await postCatalogWorkflow(id, "submit-for-review");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }
  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=" + encodeURIComponent("Submitted for review."));
}

export async function approveProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }
  let res: Response;
  try {
    res = await postCatalogWorkflow(id, "approve");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory?error=network&message=${encodeURIComponent(message)}`);
  }
  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/inventory");
  return redirect("/dashboard/inventory?message=" + encodeURIComponent("Product approved and published."));
}

export async function rejectProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const note = String(formData.get("catalog_rejection_note") ?? "").trim();
  if (!id) {
    return redirect("/dashboard/inventory?error=missing&message=Product ID is required.");
  }
  const body = JSON.stringify(note ? { catalog_rejection_note: note } : {});
  let res: Response;
  try {
    res = await postCatalogWorkflow(id, "reject", {
      headers: { "Content-Type": "application/json" },
      body,
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
  return redirect("/dashboard/inventory?message=" + encodeURIComponent("Product rejected."));
}

function parseIdListJson(raw: string): number[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: number[] = [];
    for (const x of parsed) {
      if (typeof x === "number" && Number.isFinite(x) && x > 0) {
        out.push(x);
        continue;
      }
      if (typeof x === "string" && /^\d+$/.test(x.trim())) {
        const n = Number.parseInt(x.trim(), 10);
        if (Number.isFinite(n) && n > 0) out.push(n);
      }
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

/** Approve/publish many products (same workflow as single approve). */
export async function bulkApproveProducts(formData: FormData) {
  const ids = parseIdListJson(String(formData.get("ids") ?? ""));
  if (!ids || ids.length === 0) {
    return redirect("/dashboard/inventory?error=missing&message=No products selected to publish.");
  }
  let ok = 0;
  const failed: number[] = [];
  let firstError: string | null = null;
  for (const id of ids) {
    let res: Response;
    try {
      res = await postCatalogWorkflow(String(id), "approve");
    } catch {
      failed.push(id);
      if (!firstError) firstError = "Network error";
      continue;
    }
    if (res.ok) ok++;
    else {
      failed.push(id);
      if (!firstError) {
        try {
          firstError = await readErrorMessage(res);
        } catch {
          firstError = `HTTP ${res.status}`;
        }
      }
    }
  }
  revalidatePath("/dashboard/inventory");
  if (failed.length === 0) {
    return redirect(
      `/dashboard/inventory?message=${encodeURIComponent(`Published ${ok} product(s).`)}`
    );
  }
  const detail = firstError ? ` Example: ${firstError}` : "";
  const unauthorized =
    (firstError ?? "").toLowerCase().includes("unauthorized") ||
    (firstError ?? "").toLowerCase().includes("forbidden");
  const backendNote =
    unauthorized || ok === 0
      ? " Backend: allow the approver role on POST /products/{id}/approve (see changelog.md — Approve / publish authorization)."
      : "";
  const msg = `Published ${ok} of ${ids.length}. Failed: ${failed.length}.${detail}${backendNote}`.trim();
  if (ok === 0) {
    return redirect(`/dashboard/inventory?error=failed&message=${encodeURIComponent(msg)}`);
  }
  return redirect(`/dashboard/inventory?message=${encodeURIComponent(msg)}`);
}

/** Hard-delete many products (admin/staff). */
export async function bulkDeleteProducts(formData: FormData) {
  const ids = parseIdListJson(String(formData.get("ids") ?? ""));
  if (!ids || ids.length === 0) {
    return redirect("/dashboard/inventory?error=missing&message=No products selected to delete.");
  }
  let ok = 0;
  const failed: number[] = [];
  for (const id of ids) {
    let res: Response;
    try {
      res = await dashboardFetch(`/products/${id}`, { method: "DELETE" });
    } catch {
      failed.push(id);
      continue;
    }
    if (res.ok || res.status === 204) ok++;
    else failed.push(id);
  }
  revalidatePath("/dashboard/inventory");
  const msg =
    failed.length === 0
      ? `Deleted ${ok} product(s).`
      : `Deleted ${ok} of ${ids.length}. Failed IDs: ${failed.join(", ")}.`;
  return redirect(`/dashboard/inventory?message=${encodeURIComponent(msg)}`);
}

