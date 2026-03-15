import Link from "next/link";
import Image from "next/image";
import { getOffers } from "@/lib/api/dashboardOffers";
import { dashboardFetch } from "@/lib/dashboardApi";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { OffersToolbar } from "./OffersToolbar";
import { OfferRowActions } from "./OfferRowActions";
import type { Category } from "@/types/category";
import type { Subcategory } from "@/types/category";
import { tryBucketUrl } from "@/lib/bucketUrl";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await dashboardFetch("/categories?per_page=100");
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getSubcategories(categoryId?: number): Promise<Subcategory[]> {
  if (!categoryId) return [];
  try {
    const res = await dashboardFetch(`/categories/${categoryId}/subcategories?per_page=100`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

function isActive(start: string, end: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  return today >= startDate && today <= endDate;
}

export default async function DashboardOffersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    active?: string;
    category_id?: string;
    subcategory_id?: string;
    message?: string;
    error?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const activeFilter = sp.active ?? "";
  const categoryIdFilter = sp.category_id ?? "";
  const subcategoryIdFilter = sp.subcategory_id ?? "";
  const message = sp.message;
  const error = sp.error;

  const [offersData, categories] = await Promise.all([
    getOffers({
      page,
      per_page: 15,
      active: activeFilter === "1" ? 1 : activeFilter === "0" ? 0 : undefined,
      category_id: categoryIdFilter ? parseInt(categoryIdFilter, 10) : undefined,
      subcategory_id: subcategoryIdFilter ? parseInt(subcategoryIdFilter, 10) : undefined,
    }),
    getCategories(),
  ]);

  const subcategories = categoryIdFilter
    ? await getSubcategories(parseInt(categoryIdFilter, 10))
    : [];

  const offers = offersData?.data ?? [];
  const total = offersData?.total ?? 0;
  const currentPage = offersData?.current_page ?? 1;
  const lastPage = offersData?.last_page ?? 1;
  const from = offersData?.from ?? null;
  const to = offersData?.to ?? null;

  const paginationParams: Record<string, string> = {};
  if (activeFilter) paginationParams.active = activeFilter;
  if (categoryIdFilter) paginationParams.category_id = categoryIdFilter;
  if (subcategoryIdFilter) paginationParams.subcategory_id = subcategoryIdFilter;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Offers</div>
        <h2 className="mt-0.5 text-2xl font-bold text-gray-900">Special offers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage category or subcategory offers. Discount applies to products in the selected scope.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            error ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <OffersToolbar
          total={total}
          showing={offers.length}
          categories={categories}
          subcategories={subcategories}
          activeFilter={activeFilter}
          categoryIdFilter={categoryIdFilter}
          subcategoryIdFilter={subcategoryIdFilter}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Banner</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Discount</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Scope</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Period</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                    No offers found.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => {
                  const active = isActive(offer.start_date, offer.end_date);
                  const scope = offer.subcategory
                    ? `${offer.subcategory.subcategory_name} (${offer.category?.category_name ?? "—"})`
                    : offer.category?.category_name ?? "—";
                  const bannerUrl = offer.banner_url
                    ? (offer.banner_url.startsWith("http") ? offer.banner_url : tryBucketUrl(offer.banner_url))
                    : null;
                  return (
                    <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-4 py-3">
                        {bannerUrl ? (
                          <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={bannerUrl} alt="" fill className="object-cover" sizes="64px" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{offer.name}</div>
                        {offer.description ? (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{offer.description}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#374151]">{offer.discount_percentage}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{scope}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {offer.start_date.slice(0, 10)} – {offer.end_date.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <OfferRowActions offerId={offer.id} offerName={offer.name} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {offersData && lastPage > 1 ? (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              basePath="/dashboard/offers"
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              from={from}
              to={to}
              params={Object.keys(paginationParams).length ? paginationParams : undefined}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
