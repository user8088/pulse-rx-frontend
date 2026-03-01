import apiClient from "./client";
import type { Category, PaginatedCategories, Subcategory, PaginatedSubcategories } from "@/types/category";

export async function getCategories(params?: Record<string, any>) {
  const { data } = await apiClient.get<PaginatedCategories>('/categories', { params });
  return data;
}

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
