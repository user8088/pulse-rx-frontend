import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCategories, getSubcategories } from "@/lib/api/categories";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  // Best-effort prefetch: if the API is down or slow during build,
  // we don't want the whole build to fail. Navbar and other clients
  // will still load categories via React Query on the client.
  try {
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
  } catch (error) {
    console.error(
      "StorefrontLayout prefetch failed; continuing without cached categories:",
      error
    );
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
