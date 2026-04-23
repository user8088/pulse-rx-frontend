"use client";

import Link from "@/lib/navigation";
import { useRouter } from "@/lib/navigation";
import { deleteOfferAction } from "./actions";

export function OfferRowActions({ offerId, offerName }: { offerId: number; offerName: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete offer "${offerName}"? This cannot be undone.`)) return;
    try {
      await deleteOfferAction(offerId);
      router.push("/dashboard/offers?message=Offer+deleted.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete offer.";
      router.push(`/dashboard/offers?error=${encodeURIComponent(msg)}`);
    }
  };

  return (
    <>
      <Link
        href={`/dashboard/offers/${offerId}/edit`}
        className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-wider"
      >
        Edit
      </Link>
      <span className="mx-2 text-gray-300">|</span>
      <button
        type="button"
        onClick={handleDelete}
        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline uppercase tracking-wider"
      >
        Delete
      </button>
    </>
  );
}
