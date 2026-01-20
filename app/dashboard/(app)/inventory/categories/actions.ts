"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";

export async function createCategory(formData: FormData) {
  const category_name = String(formData.get("category_name") ?? "").trim();

  if (!category_name) {
    return redirect("/dashboard/inventory/categories?error=missing&message=Category name is required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ category_name }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory/categories?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory/categories?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory/categories");
  return redirect("/dashboard/inventory/categories?message=Category created successfully.");
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id");
  const category_name = String(formData.get("category_name") ?? "").trim();

  if (!id || !category_name) {
    return redirect("/dashboard/inventory/categories?error=missing&message=ID and category name are required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ category_name }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory/categories?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory/categories?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory/categories");
  return redirect("/dashboard/inventory/categories?message=Category updated successfully.");
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id");

  if (!id) {
    return redirect("/dashboard/inventory/categories?error=missing&message=Category ID is required.");
  }

  let res: Response;
  try {
    res = await dashboardFetch(`/categories/${id}`, {
      method: "DELETE",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return redirect(`/dashboard/inventory/categories?error=network&message=${encodeURIComponent(message)}`);
  }

  if (!res.ok && res.status !== 204) {
    const message = await readErrorMessage(res);
    return redirect(`/dashboard/inventory/categories?error=failed&message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/inventory/categories");
  return redirect("/dashboard/inventory/categories?message=Category deleted successfully.");
}
