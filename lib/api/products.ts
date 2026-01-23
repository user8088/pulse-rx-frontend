import apiClient from "./client";
import type { Product, PaginatedProducts } from "@/types/product";

export async function getProducts(params?: Record<string, any>) {
  const { data } = await apiClient.get<PaginatedProducts>('/products', { params });
  return data;
}

export async function getProduct(id: number | string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function getProductVariations(productGroupId: string) {
  const { data } = await apiClient.get<PaginatedProducts>('/products', {
    params: { product_group_id: productGroupId }
  });
  return data.data;
}
