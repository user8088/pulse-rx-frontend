import { cookies } from "next/headers";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCachedCategories, getSubcategories } from "@/lib/api/categories";
import { getCachedOffers } from "@/lib/api/offers";
import { CityProvider, type CustomerCity } from "@/lib/context/CityContext";
import { CityModal } from "@/components/CityModal";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cityRaw = cookieStore.get("prx_customer_city")?.value;
  const initialCity: CustomerCity | null =
    cityRaw === "islamabad" || cityRaw === "other" ? cityRaw : null;

  const queryClient = new QueryClient();

  try {
    const [categoriesData, offersData] = await Promise.all([
      getCachedCategories(),
      getCachedOffers(),
    ]);

    queryClient.setQueryData(["categories"], categoriesData);
    queryClient.setQueryData(["offers"], offersData);

    await Promise.all(
      (categoriesData?.data ?? []).map((cat) =>
        queryClient.prefetchQuery({
          queryKey: ["subcategories", cat.id],
          queryFn: () => getSubcategories(cat.id, { per_page: 50 }),
        })
      )
    );
  } catch (error) {
    console.error(
      "StorefrontLayout prefetch failed; continuing without cached data:",
      error
    );
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <CityProvider initialCity={initialCity}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      <CityModal />
    </CityProvider>
  );
}
