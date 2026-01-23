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
import type { Category } from "@/types/category";

export default async function Home() {
  let categories: Category[] = [];
  try {
    const data = await getCategories({ per_page: 10 });
    categories = data.data;
  } catch (error) {
    console.error("Failed to fetch categories for home page:", error);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />
      <Hero />
      <PromisesSection />
      <TopCategories />
      
      {/* Dynamic Category Sections */}
      {categories.map((category) => (
        <CategoryProductSection key={category.id} category={category} />
      ))}

      <OfferBanners />
      <SpecialOffers />
      <InfoBanners />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
