import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { dashboardFetch } from "@/lib/dashboardApi";
import type { PaginatedCategories, PaginatedProducts } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { createProduct, importProductsExcel } from "./actions";
import { ProductsTable } from "./ProductsTable";
import { InventoryToolbar } from "./InventoryToolbar";

async function getProducts({
  page,
  q,
}: {
  page?: number;
  q?: string;
}): Promise<PaginatedProducts | null> {
  try {
    const sp = new URLSearchParams();
    if (page && Number.isFinite(page)) sp.set("page", String(page));
    const query = (q ?? "").trim();
    if (query) sp.set("q", query);

    const qs = sp.toString();
    const res = await dashboardFetch(qs ? `/products?${qs}` : "/products");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCategories(): Promise<PaginatedCategories | null> {
  try {
    const res = await dashboardFetch("/categories");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; error?: string; page?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const message = sp.message;
  const error = sp.error;
  const page = sp.page ? Number.parseInt(sp.page, 10) : undefined;
  const q = (sp.q ?? "").trim();

  const [productsData, categoriesData] = await Promise.all([
    getProducts({ page, q }),
    getCategories(),
  ]);

  const categories = categoriesData?.data ?? [];
  const products = productsData?.data ?? [];

  const lastImportRaw = (await cookies()).get("prx_products_last_import")?.value;
  const lastImport = (() => {
    if (!lastImportRaw) return null;
    try {
      return JSON.parse(lastImportRaw) as {
        at: string;
        import_uuid?: string | null;
        total_rows: number;
        created_count: number;
        updated_count: number;
        skipped_count: number;
        errors: { row: number; item_id: string | null; reason: string; message: string }[];
      };
    } catch {
      return null;
    }
  })();

  const total = productsData?.total ?? products.length;
  const low = products.filter((p) => p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold).length;
  const out = products.filter((p) => p.stock_qty <= 0).length;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
            Inventory
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Products</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage products, upload images, and import from Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/inventory/categories"
            className="text-xs font-extrabold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-[0.2em]"
          >
            Manage categories →
          </Link>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      {/* Cards (top) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
              Total products
            </div>
            <div className="mt-1 text-3xl font-black text-[#111827]">{total}</div>
            <div className="mt-1 text-xs text-gray-500">Across all pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
              Low stock
            </div>
            <div className="mt-1 text-3xl font-black text-[#111827]">{low}</div>
            <div className="mt-1 text-xs text-gray-500">On this page</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
              Out of stock
            </div>
            <div className="mt-1 text-3xl font-black text-[#111827]">{out}</div>
            <div className="mt-1 text-xs text-gray-500">On this page</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <InventoryToolbar
        categories={categories}
        products={products}
        createProductAction={createProduct}
        importProductsAction={importProductsExcel}
      />

      {/* Table (below) */}
      <div className="flex-1 min-h-0">
        <ProductsTable
          products={products}
          categories={categories}
          query={q}
          total={productsData?.total}
        />
      </div>

      {productsData ? (
        <Pagination
          basePath="/dashboard/inventory"
          currentPage={productsData.current_page}
          lastPage={productsData.last_page}
          total={productsData.total}
          from={productsData.from}
          to={productsData.to}
          params={q ? { q } : undefined}
        />
      ) : null}

      {lastImport ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
            Last import
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-bold text-[#374151]">
              {lastImport.created_count} created · {lastImport.updated_count} updated · {lastImport.skipped_count}{" "}
              skipped
            </div>
            {lastImport.import_uuid ? (
              <Link
                href={`/dashboard/inventory/import-logs/${encodeURIComponent(lastImport.import_uuid)}`}
                className="text-xs font-extrabold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-[0.2em]"
              >
                View full log →
              </Link>
            ) : null}
          </div>
          {lastImport.errors?.length ? (
            <div className="mt-2 text-xs text-gray-600">Issues: {lastImport.errors.length} (showing first)</div>
          ) : (
            <div className="mt-2 text-xs text-gray-600">No issues reported.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}


