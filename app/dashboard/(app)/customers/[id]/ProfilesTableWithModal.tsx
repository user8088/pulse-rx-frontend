"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ProfileProductsSection } from "@/app/dashboard/(app)/customers/[id]/ProfileProductsSection";
import { ProfilePrescriptionsSection } from "@/app/dashboard/(app)/customers/[id]/ProfilePrescriptionsSection";
import type { MedicalProfile, ProfileProduct, ProfilePrescription } from "@/types/customer";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import { Settings2 } from "lucide-react";

type ProfileWithDetails = MedicalProfile & {
  products?: ProfileProduct[];
  prescriptions?: ProfilePrescription[];
};

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function productSummary(pp: ProfileProduct): string {
  const name = pp.product?.item_name ?? `Product #${pp.product_id}`;
  return pp.quantity > 1 ? `${name} × ${pp.quantity}` : name;
}

function prescriptionDisplayName(pr: ProfilePrescription): string {
  return (pr.name?.trim() || pr.file_name || `Prescription #${pr.id}`).slice(0, 40);
}

export function ProfilesTableWithModal({
  customerId,
  profiles,
  products,
  orders,
}: {
  customerId: number | string;
  profiles: ProfileWithDetails[];
  products: Product[];
  orders: Order[];
}) {
  const [managedProfile, setManagedProfile] = useState<ProfileWithDetails | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[#374151] min-w-[140px]">
                Profile
              </th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[#374151] min-w-[200px]">
                Products
              </th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[#374151] min-w-[180px]">
                Prescriptions
              </th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[#374151] w-28">
                Updated
              </th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[#374151] text-right w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const profileProducts = profile.products ?? [];
              const profilePrescriptions = profile.prescriptions ?? [];
              const maxShow = 3;
              const productSlice = profileProducts.slice(0, maxShow);
              const prescriptionSlice = profilePrescriptions.slice(0, maxShow);
              const moreProducts = profileProducts.length > maxShow;
              const morePrescriptions = profilePrescriptions.length > maxShow;
              return (
                <tr
                  key={profile.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[#374151]">{profile.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">
                        ID {profile.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500">
                        {profileProducts.length} {profileProducts.length === 1 ? "product" : "products"}
                      </span>
                      {productSlice.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {productSlice.map((pp) => (
                            <li
                              key={`${pp.product_id}-${pp.quantity}`}
                              className="truncate max-w-[220px]"
                              title={productSummary(pp)}
                            >
                              {productSummary(pp)}
                            </li>
                          ))}
                          {moreProducts && (
                            <li className="text-gray-400 italic">
                              +{profileProducts.length - maxShow} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500">
                        {profilePrescriptions.length} {profilePrescriptions.length === 1 ? "prescription" : "prescriptions"}
                      </span>
                      {prescriptionSlice.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {prescriptionSlice.map((pr) => (
                            <li
                              key={pr.id}
                              className="truncate max-w-[200px]"
                              title={prescriptionDisplayName(pr)}
                            >
                              {prescriptionDisplayName(pr)}
                            </li>
                          ))}
                          {morePrescriptions && (
                            <li className="text-gray-400 italic">
                              +{profilePrescriptions.length - maxShow} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap text-xs">
                    {formatDate(profile.updated_at)}
                  </td>
                  <td className="px-5 py-4 text-right align-middle">
                    <button
                      type="button"
                      onClick={() => setManagedProfile(profile)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#01AC28] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#01AC28] hover:bg-[#01AC28] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!managedProfile}
        title={managedProfile?.name ?? "Profile"}
        description="Add or remove products and prescriptions for this medical profile."
        onClose={() => setManagedProfile(null)}
        className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] space-y-8 -mt-2">
          {managedProfile && (
            <>
              <ProfileProductsSection
                customerId={customerId}
                profileId={managedProfile.id}
                profileName={managedProfile.name}
                initialProducts={managedProfile.products ?? []}
                products={products}
                orders={orders}
              />
              <ProfilePrescriptionsSection
                customerId={customerId}
                profileId={managedProfile.id}
                profileName={managedProfile.name}
                initialPrescriptions={managedProfile.prescriptions ?? []}
                orders={orders}
              />
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
