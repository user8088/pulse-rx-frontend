import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import { OfferBanner, FlashSaleBanner, DeliveryBanner, ProcedureBanner } from "@/components/CategoryPromoBanner";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Category mapping - will be replaced with API data later
const categoryMap: Record<string, string> = {
  'pain-relief': 'Pain Relief',
  'cold-flu': 'Cold & Flu',
  'diabetes': 'Diabetes',
  'child-care': 'Child Care',
  'skin-care': 'Skin Care',
  'optics': 'Optics',
};

// Placeholder product data - will be replaced with API data later
// In a real app, this would be fetched based on the category slug
const getProductsByCategory = (categorySlug: string) => {
  // Generate sample products for each category
  const productImages = [
    '/assets/home/product-1.png',
    '/assets/home/product-2.png',
    '/assets/home/product-3.png',
    '/assets/home/product-4.png',
    '/assets/home/product-5.png',
    '/assets/home/product-6.png',
    '/assets/home/product-7.png',
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `${categoryMap[categorySlug] || 'Product'} Item ${i + 1} - Premium Quality Medicine`,
    price: Math.round((Math.random() * 50 + 10) * 100) / 100,
    originalPrice: Math.random() > 0.5 ? Math.round((Math.random() * 60 + 15) * 100) / 100 : undefined,
    rating: 5,
    image: productImages[i % productImages.length],
  }));
};

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categorySlug = slug || '';
  const categoryName = categoryMap[categorySlug] || (categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category');
  const products = getProductsByCategory(categorySlug);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-[#EFEFEF] py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-sm md:text-base">
            <Link href="/" className="text-[#6B7280] hover:text-[#01AC28] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[#374151] font-semibold">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-2">
                {categoryName}
              </h1>
              <p className="text-[#6B7280] text-sm md:text-base">
                {products.length} products found
              </p>
            </div>
            
            {/* Filter Button - Mobile */}
            <div className="lg:hidden">
              <FilterSidebar showCategoryFilter={false} />
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-6 lg:gap-8">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <FilterSidebar showCategoryFilter={false} />
            </div>

            {/* Products Section */}
            <div className="flex-1">

              {/* Top Promotional Banner */}
              <div className="mb-8 md:mb-12">
                <OfferBanner />
              </div>

              {/* Products Grid - First Batch */}
              <ProductGrid products={products.slice(0, 10)} />

              {/* Mid-section Promotional Banners */}
              <div className="my-12 md:my-16 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FlashSaleBanner />
                  <DeliveryBanner />
                </div>
              </div>

              {/* Products Grid - Second Batch */}
              <ProductGrid products={products.slice(10)} />

              {/* Bottom Promotional Banner */}
              <div className="mt-12 md:mt-16">
                <ProcedureBanner />
              </div>

              {/* Load More / Pagination */}
              <div className="mt-12 md:mt-16 text-center">
                <button className="bg-[#01AC28] hover:bg-[#044644] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Load More Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
