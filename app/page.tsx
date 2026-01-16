import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PromisesSection from "@/components/PromisesSection";
import TopCategories from "@/components/TopCategories";
import TrendingProducts from "@/components/TrendingProducts";
import OfferBanners from "@/components/OfferBanners";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />
      <Hero />
      <PromisesSection />
      <TopCategories />
      <TrendingProducts />
      <OfferBanners />
      
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-[#374151]">More Products</h2>
          <p className="text-[#9CA3AF] mt-2 text-lg">Coming soon...</p>
        </div>
      </section>
    </main>
  );
}
