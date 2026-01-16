import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SpecialOffers from "@/components/SpecialOffers";
import TopSellingProducts from "@/components/TopSellingProducts";
import PromisesSection from "@/components/PromisesSection";
import TopCategories from "@/components/TopCategories";
import TrendingProducts from "@/components/TrendingProducts";
import OfferBanners from "@/components/OfferBanners";
import InfoBanners from "@/components/InfoBanners";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

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
      <SpecialOffers />
      <TopSellingProducts />   
      <InfoBanners />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
