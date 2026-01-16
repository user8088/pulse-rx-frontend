import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";

// Get products with offers/discounts - will be replaced with API data later
const getSpecialOfferProducts = () => {
  const productImages = [
    '/assets/home/product-1.png',
    '/assets/home/product-2.png',
    '/assets/home/product-3.png',
    '/assets/home/product-4.png',
    '/assets/home/product-5.png',
    '/assets/home/product-6.png',
    '/assets/home/product-7.png',
  ];

  // Generate products with discounts
  return Array.from({ length: 24 }, (_, i) => {
    const originalPrice = Math.round((Math.random() * 60 + 20) * 100) / 100;
    const discountPercent = Math.floor(Math.random() * 30 + 10); // 10-40% discount
    const discountedPrice = Math.round((originalPrice * (1 - discountPercent / 100)) * 100) / 100;
    
    return {
      id: i + 1,
      name: `Special Offer Product ${i + 1} - Premium Quality Medicine with ${discountPercent}% Off`,
      price: discountedPrice,
      originalPrice: originalPrice,
      rating: 5,
      image: productImages[i % productImages.length],
      discount: discountPercent,
    };
  });
};

export default function SpecialOffersPage() {
  const products = getSpecialOfferProducts();

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
            <span className="text-[#374151] font-semibold">Special Offers</span>
          </nav>
        </div>
      </div>

      {/* Special Offers Header */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#01AC28]/10 flex items-center justify-center">
                <Tag className="w-8 h-8 md:w-10 md:h-10 text-[#01AC28]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-2">
                  Special Offers
                </h1>
                <p className="text-[#6B7280] text-sm md:text-base">
                  {products.length} products on sale
                </p>
              </div>
            </div>
            
            {/* Filter Button - Mobile */}
            <div className="lg:hidden">
              <FilterSidebar showCategoryFilter={true} />
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-6 lg:gap-8">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <FilterSidebar showCategoryFilter={true} />
            </div>

            {/* Products Section */}
            <div className="flex-1">
              {/* Promotional Banner */}
              <div className="mb-8 md:mb-12 bg-gradient-to-r from-[#01AC28] to-[#5C9D40] rounded-2xl p-6 md:p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Limited Time Offers
                    </h2>
                    <p className="text-white/90 text-sm md:text-base">
                      Save up to 40% on selected products. Don't miss out on these amazing deals!
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl md:text-5xl font-black mb-1">40%</div>
                    <div className="text-sm md:text-base text-white/80">MAX DISCOUNT</div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <ProductGrid products={products} />

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
