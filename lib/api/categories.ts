import apiClient from "./client";
import type { Category, PaginatedCategories } from "@/types/category";

export async function getCategories(params?: Record<string, any>) {
  const { data } = await apiClient.get<PaginatedCategories>('/categories', { params });
  return data;
}

export async function getCategory(id: number | string) {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
}
