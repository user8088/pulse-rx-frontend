import { cookies } from "next/headers";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SpecialOffers from "@/components/SpecialOffers";
import PromisesSection from "@/components/PromisesSection";
import TopCategories from "@/components/TopCategories";
import OfferBanners from "@/components/OfferBanners";
import InfoBanners from "@/components/InfoBanners";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import CategoryProductSection from "@/components/CategoryProductSection";
import { getCachedCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { CustomerCity } from "@/lib/context/CityContext";

export default async function Home() {
  const cookieStore = await cookies();
  const cityRaw = cookieStore.get("prx_customer_city")?.value;
  const customerCity: CustomerCity | undefined =
    cityRaw === "islamabad" || cityRaw === "other" ? cityRaw : undefined;

  // Reuses the same in-flight promise as the layout — zero extra API calls.
  const categoriesData = await getCachedCategories().catch(() => null);
  const categories = categoriesData?.data ?? [];

  const queryClient = new QueryClient();

  // Prefetch products for every category in parallel.
  await Promise.all(
    categories.map(async (c) => {
      const params: Record<string, any> = { q: c.category_name, per_page: 30 };
      if (customerCity) params.customer_city = customerCity;
      try {
        const data = await getProducts(params);
        queryClient.setQueryData(
          ["products", { category: c.category_name, per_page: 30, customer_city: customerCity ?? undefined }],
          data
        );
      } catch (error) {
        console.error("Failed to fetch products for category on home page:", c.category_name, error);
      }
    })
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />
      <Hero />
      <PromisesSection />
      <TopCategories />

      <HydrationBoundary state={dehydratedState}>
        {categories.map((category) => (
          <CategoryProductSection key={category.id} category={category} />
        ))}
      </HydrationBoundary>

      <OfferBanners />
      <SpecialOffers />
      <InfoBanners />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
