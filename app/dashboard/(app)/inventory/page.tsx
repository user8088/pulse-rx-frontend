import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { dashboardFetch } from "@/lib/dashboardApi";
import { getDashboardUser } from "@/lib/dashboardUser";
import { defaultCatalogStatusQuery } from "@/lib/dashboardRoles";
import type { PaginatedCategories, PaginatedProducts } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { createProduct, importProductsExcel } from "./actions";
import { ProductsTable } from "./ProductsTable";
import { InventoryToolbar } from "./InventoryToolbar";
import { InventoryFiltersBar } from "./InventoryFiltersBar";
import { isProductManager } from "@/lib/dashboardRoles";

async function getProducts({
  page,
  q,
  catalogStatus,
  categoryId,
  availability,
  perPage,
}: {
  page?: number;
  q?: string;
  catalogStatus?: string;
  categoryId?: string;
  availability?: string;
  perPage?: number;
}): Promise<PaginatedProducts | null> {
  try {
    const sp = new URLSearchParams();
    if (page && Number.isFinite(page)) sp.set("page", String(page));
    const query = (q ?? "").trim();
    if (query) sp.set("q", query);
    const cs = (catalogStatus ?? "").trim();
    if (cs) sp.set("catalog_status", cs);
    const cat = (categoryId ?? "").trim();
    if (cat && /^\d+$/.test(cat)) sp.set("category_id", cat);
    const av = (availability ?? "").trim().toLowerCase();
    if (av && ["yes", "no", "short"].includes(av)) sp.set("availability", av);
    if (typeof perPage === "number" && perPage >= 1 && perPage <= 100) sp.set("per_page", String(perPage));

    const qs = sp.toString();
    // Catalog workflow filters (catalog_status, etc.) are implemented on the dashboard route only.
    // Storefront GET /products ignores them and can hide non-published rows.
    const res = await dashboardFetch(qs ? `/dashboard/products?${qs}` : "/dashboard/products");
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
  searchParams?: Promise<{
    message?: string;
    error?: string;
    page?: string;
    q?: string;
    catalog_status?: string;
    category_id?: string;
    availability?: string;
    per_page?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const message = sp.message;
  const error = sp.error;
  const page = sp.page ? Number.parseInt(sp.page, 10) : undefined;
  const q = (sp.q ?? "").trim();

  const session = await getDashboardUser();
  const viewerRole = session?.user.role ?? "staff";

  const catalogExplicit = sp.catalog_status !== undefined && sp.catalog_status !== null;
  const catalogStatus = catalogExplicit
    ? String(sp.catalog_status ?? "").trim()
    : (defaultCatalogStatusQuery(viewerRole) ?? "");

  const categoryId = String(sp.category_id ?? "").trim();
  const availability = String(sp.availability ?? "").trim().toLowerCase();
  const perPageRaw = sp.per_page ? Number.parseInt(String(sp.per_page), 10) : NaN;
  const perPage =
    Number.isFinite(perPageRaw) && perPageRaw >= 1 && perPageRaw <= 100 ? perPageRaw : undefined;

  const [productsData, categoriesData] = await Promise.all([
    getProducts({
      page,
      q,
      catalogStatus: catalogStatus || undefined,
      categoryId: categoryId || undefined,
      availability: availability || undefined,
      perPage,
    }),
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
  const short = products.filter((p) => p.availability === "short").length;
  const unavailable = products.filter((p) => p.availability === "no").length;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            Inventory
          </div>
          <h2 className="mt-0.5 text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Filter the catalog, search, and manage workflow from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {viewerRole === "admin" || viewerRole === "staff" ? (
            <Link
              href="/dashboard/inventory/categories"
              className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider"
            >
              Manage categories →
            </Link>
          ) : null}
        </div>
      </div>

      {isProductManager(viewerRole) ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold text-blue-950">How you’ll see pharmacist feedback</p>
          <p className="mt-1 text-xs text-blue-900/90 leading-relaxed">
            If a pharmacist <strong>rejects</strong> a submission, their note is stored on the product and shown on the
            row (Rejected) and at the top when you edit. After you fix and resubmit, it goes back to{" "}
            <strong>Pending review</strong>. If they <strong>approve</strong>, the product becomes{" "}
            <strong>Published</strong> and leaves your draft/rejected filters—check the published list or search by
            name/SKU. There is no separate inbox yet; use filters + rejection notes on each item.
          </p>
        </div>
      ) : null}

      {!productsData && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">Products could not be loaded</p>
          <p className="mt-1 text-xs text-red-800/90 leading-relaxed">
            The inventory list uses the dashboard catalog API. If this persists, confirm you are signed in,{" "}
            <code className="rounded bg-red-100/80 px-1">NEXT_PUBLIC_API_URL</code> points at the API, and your role can
            access <code className="rounded bg-red-100/80 px-1">GET /dashboard/products</code>.
          </p>
        </div>
      )}

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            error ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      {/* Cards (top) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="hover:shadow-md border-none bg-gray-50/50 shadow-none">
          <CardContent className="p-5">
            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
              Total products
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{total}</div>
            <div className="mt-1 text-[11px] text-gray-400 font-medium">Across all pages</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md border-none bg-gray-50/50 shadow-none">
          <CardContent className="p-5">
            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
              Short supply
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{short}</div>
            <div className="mt-1 text-[11px] text-gray-400 font-medium">On this page</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md border-none bg-gray-50/50 shadow-none">
          <CardContent className="p-5">
            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
              Unavailable
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{unavailable}</div>
            <div className="mt-1 text-[11px] text-gray-400 font-medium">On this page</div>
          </CardContent>
        </Card>
      </div>

      <InventoryFiltersBar
        categories={categories}
        role={viewerRole}
        catalogStatus={catalogStatus}
        categoryId={categoryId}
        availability={availability && ["yes", "no", "short"].includes(availability) ? availability : ""}
        perPage={perPage ? String(perPage) : "15"}
      />

      {/* Actions */}
      <InventoryToolbar
        categories={categories}
        products={products}
        createProductAction={createProduct}
        importProductsAction={importProductsExcel}
        showCreateProduct={viewerRole !== "pharmacist"}
        showImportProducts={viewerRole === "admin" || viewerRole === "staff"}
      />

      {/* Table (below) */}
      <div className="flex-1 min-h-0">
        <ProductsTable
          products={products}
          categories={categories}
          query={q}
          total={productsData?.total}
          viewerRole={viewerRole}
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
          params={{
            ...(q ? { q } : {}),
            ...(catalogStatus ? { catalog_status: catalogStatus } : {}),
            ...(categoryId ? { category_id: categoryId } : {}),
            ...(availability && ["yes", "no", "short"].includes(availability) ? { availability } : {}),
            ...(perPage && perPage !== 15 ? { per_page: String(perPage) } : {}),
          }}
        />
      ) : null}

      {lastImport ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-5">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            Last import
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-gray-700">
              {lastImport.created_count} created · {lastImport.updated_count} updated · {lastImport.skipped_count}{" "}
              skipped
            </div>
            {lastImport.import_uuid ? (
              <Link
                href={`/dashboard/inventory/import-logs/${encodeURIComponent(lastImport.import_uuid)}`}
                className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider"
              >
                View full log →
              </Link>
            ) : null}
          </div>
          {lastImport.errors?.length ? (
            <div className="mt-2 text-xs text-gray-500 font-medium">Issues: {lastImport.errors.length} (showing first)</div>
          ) : (
            <div className="mt-2 text-xs text-gray-500 font-medium">No issues reported.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}


