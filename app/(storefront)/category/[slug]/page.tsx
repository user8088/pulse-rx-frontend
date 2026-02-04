import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import { OfferBanner, FlashSaleBanner, DeliveryBanner, ProcedureBanner } from "@/components/CategoryPromoBanner";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Product as BackendProduct, PaginatedProducts } from "@/types/product";
import type { Category } from "@/types/category";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryAlias = (slug || '').toUpperCase();

  // 1. Fetch categories to find the ID for this alias
  let category: Category | undefined = undefined;
  try {
    const categoriesRes = await getCategories({ per_page: 100 });
    category = categoriesRes.data.find(c => c.alias.toUpperCase() === categoryAlias);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Link href="/" className="text-[#01AC28] hover:underline mt-4 inline-block">Return to Home</Link>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Fetch products for this category
  // The products API doesn't support direct `category_id` filtering;
  // instead we use the full-text `q` search which also matches `categories.category_name`.
  let productsData: PaginatedProducts = { 
    data: [], 
    total: 0, 
    per_page: 20, 
    current_page: 1, 
    last_page: 1, 
    from: null, 
    to: null 
  };
  try {
    productsData = await getProducts({ q: category.category_name, per_page: 20 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  // 3. Map backend products to the interface expected by ProductGrid
  const mappedProducts = productsData.data.map((p: BackendProduct) => ({
    id: p.id,
    name: p.item_name,
    price: parseFloat(p.retail_price),
    rating: 5,
    image: p.images?.[0] ? bucketUrl(p.images[0].object_key) : "/assets/home/product-1.png",
  }));

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
            <span className="text-[#374151] font-semibold">{category.category_name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-2">
                {category.category_name}
              </h1>
              <p className="text-[#6B7280] text-sm md:text-base">
                {productsData.total} products found
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
              <ProductGrid products={mappedProducts.slice(0, 10)} />

              {/* Mid-section Promotional Banners */}
              <div className="my-12 md:my-16 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FlashSaleBanner />
                  <DeliveryBanner />
                </div>
              </div>

              {/* Products Grid - Second Batch */}
              <ProductGrid products={mappedProducts.slice(10)} />

              {/* Bottom Promotional Banner */}
              <div className="mt-12 md:mt-16">
                <ProcedureBanner />
              </div>

              {/* Load More / Pagination */}
              {productsData.total > 20 && (
                <div className="mt-12 md:mt-16 text-center">
                  <button className="bg-[#01AC28] hover:bg-[#044644] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
