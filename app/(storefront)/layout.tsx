import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ per_page: 20 }),
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
