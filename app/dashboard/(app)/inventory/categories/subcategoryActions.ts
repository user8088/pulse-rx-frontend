"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";

const BASE_PATH = "/dashboard/inventory/categories";

export async function createSubcategory(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const subcategory_name = String(formData.get("subcategory_name") ?? "").trim();

  if (!categoryId || !subcategory_name) {
    return redirect(`${BASE_PATH}?error=missing&message=Category ID and subcategory name are required.`);
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/categories/${categoryId}/subcategories`, {
      method: "POST",
      body: JSON.stringify({ subcategory_name }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`${BASE_PATH}?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`${BASE_PATH}?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath(BASE_PATH);
  return redirect(`${BASE_PATH}?message=Subcategory created successfully.`);
}

export async function updateSubcategory(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const subcategory_name = String(formData.get("subcategory_name") ?? "").trim();

  if (!categoryId || !id || !subcategory_name) {
    return redirect(`${BASE_PATH}?error=missing&message=Category ID, subcategory ID, and name are required.`);
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/categories/${categoryId}/subcategories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ subcategory_name }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`${BASE_PATH}?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`${BASE_PATH}?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath(BASE_PATH);
  return redirect(`${BASE_PATH}?message=Subcategory updated successfully.`);
}

export async function deleteSubcategory(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();

  if (!categoryId || !id) {
    return redirect(`${BASE_PATH}?error=missing&message=Category ID and subcategory ID are required.`);
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/categories/${categoryId}/subcategories/${id}`, {
      method: "DELETE",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`${BASE_PATH}?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(`${BASE_PATH}?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath(BASE_PATH);
  return redirect(`${BASE_PATH}?message=Subcategory deleted successfully.`);
}
