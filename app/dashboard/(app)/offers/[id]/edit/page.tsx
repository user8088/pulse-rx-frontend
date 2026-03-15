import { notFound } from "next/navigation";
import { getOffer } from "@/lib/api/dashboardOffers";
import { dashboardFetch } from "@/lib/dashboardApi";
import { OfferForm } from "../../OfferForm";
import type { Category } from "@/types/category";

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

export default async function EditOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const offerId = parseInt(id, 10);
  if (!Number.isFinite(offerId)) notFound();

  const sp = await searchParams;
  const error = sp?.error;
  const [offer, categories] = await Promise.all([getOffer(offerId), getCategories()]);
  if (!offer) notFound();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Offers</div>
        <h2 className="mt-0.5 text-2xl font-bold text-gray-900">Edit offer</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update offer details. Upload a new banner to replace the current one.
        </p>
      </div>
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}
      <OfferForm categories={categories} offer={offer} />
    </div>
  );
}
