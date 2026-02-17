import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCategories, getSubcategories } from "@/lib/api/categories";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const categoriesData = await queryClient.fetchQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ per_page: 20 }),
  });

  await Promise.all(
    (categoriesData?.data ?? []).map((cat) =>
      queryClient.prefetchQuery({
        queryKey: ["subcategories", cat.id],
        queryFn: () => getSubcategories(cat.id, { per_page: 50 }),
      })
    )
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
