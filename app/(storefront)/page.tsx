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
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Category } from "@/types/category";

export default async function Home() {
  let categories: Category[] = [];
  try {
    const data = await getCategories({ per_page: 10 });
    categories = data.data;
  } catch (error) {
    console.error("Failed to fetch categories for home page:", error);
  }

  const queryClient = new QueryClient();
  const productsPerCategory = await Promise.all(
    categories.map((c) => getProducts({ q: c.category_name, per_page: 8 }))
  );
  productsPerCategory.forEach((paginated, i) => {
    const categoryName = categories[i]?.category_name;
    if (categoryName) {
      queryClient.setQueryData(
        ["products", { category: categoryName, per_page: 8 }],
        paginated
      );
    }
  });
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
