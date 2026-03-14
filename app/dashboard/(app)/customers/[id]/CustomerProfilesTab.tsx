import {
  getCustomerProfiles,
  getCustomerOrders,
  getProfileProducts,
  getProfilePrescriptions,
} from "@/lib/api/dashboardCustomers";
import { getDashboardProducts } from "@/lib/api/dashboardProducts";
import { AddProfileForm } from "@/app/dashboard/(app)/customers/[id]/AddProfileForm";
import { ProfilesTableWithModal } from "@/app/dashboard/(app)/customers/[id]/ProfilesTableWithModal";

export async function CustomerProfilesTab({
  customerId,
}: {
  customerId: number | string;
}) {
  const [profiles, productsData, ordersData] = await Promise.all([
    getCustomerProfiles(customerId, { with_products: true, with_prescriptions: true }),
    getDashboardProducts({ per_page: 200 }),
    getCustomerOrders(customerId, { per_page: 50 }),
  ]);

  const products = productsData?.data ?? [];
  const orders = ordersData?.data ?? [];

  // Fetch products and prescriptions per profile from dedicated endpoints so we always show the latest
  const profilesWithDetails = await Promise.all(
    profiles.map(async (profile) => {
      const [profileProducts, profilePrescriptions] = await Promise.all([
        getProfileProducts(customerId, profile.id),
        getProfilePrescriptions(customerId, profile.id),
      ]);
      return {
        ...profile,
        products: profileProducts.length > 0 ? profileProducts : (profile.products ?? []),
        prescriptions:
          profilePrescriptions.length > 0 ? profilePrescriptions : (profile.prescriptions ?? []),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Medical profiles (e.g. Diabetes, Blood pressure) with products and prescriptions.
        </p>
        <AddProfileForm customerId={customerId} />
      </div>

      {profilesWithDetails.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-600">
          No medical profiles yet. Add a profile to get started.
        </div>
      ) : (
        <ProfilesTableWithModal
          customerId={customerId}
          profiles={profilesWithDetails}
          products={products}
          orders={orders}
        />
      )}
    </div>
  );
}
