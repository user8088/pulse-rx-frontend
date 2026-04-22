import { cache } from "react";
import apiClient from "./client";
import type { Category, PaginatedCategories, Subcategory, PaginatedSubcategories } from "@/types/category";

export async function getCategories(params?: Record<string, any>) {
  const { data } = await apiClient.get<PaginatedCategories>('/categories', { params });
  return data;
}

/**
 * Server-side deduped: returns the same promise within a single RSC render pass
 * so layout + page don't issue duplicate /categories requests.
 */
export const getCachedCategories = cache(() =>
  getCategories({ per_page: 20 })
);

export async function getCategory(id: number | string) {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
}

export async function getSubcategories(categoryId: number | string, params?: Record<string, any>) {
  const { data } = await apiClient.get<PaginatedSubcategories>(
    `/categories/${categoryId}/subcategories`,
    { params }
  );
  return data;
}

export async function getSubcategory(categoryId: number | string, subcategoryId: number | string) {
  const { data } = await apiClient.get<Subcategory>(
    `/categories/${categoryId}/subcategories/${subcategoryId}`
  );
  return data;
}
