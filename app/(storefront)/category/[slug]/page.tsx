import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import { OfferBanner, FlashSaleBanner, DeliveryBanner, ProcedureBanner } from "@/components/CategoryPromoBanner";
import SubcategoryChips from "@/components/SubcategoryChips";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories, getSubcategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Product as BackendProduct, PaginatedProducts } from "@/types/product";
import type { Category, Subcategory } from "@/types/category";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sub?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const subFilter = sp.sub ? Number.parseInt(sp.sub, 10) : null;
  const categoryAlias = (slug || '').toUpperCase();

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

  let subcategories: Subcategory[] = [];
  try {
    const subRes = await getSubcategories(category.id, { per_page: 50 });
    subcategories = subRes.data;
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
  }

  const activeSubcategory = subFilter
    ? subcategories.find((s) => s.id === subFilter)
    : null;

  let productsData: PaginatedProducts = { 
    data: [], 
    total: 0, 
    per_page: 100, 
    current_page: 1, 
    last_page: 1, 
    from: null, 
    to: null 
  };
  try {
    productsData = await getProducts({ q: category.category_name, per_page: 100 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  // Filter to only products that actually belong to this category
  const categoryProducts = productsData.data.filter(
    (p: BackendProduct) => p.category_id === category.id
  );

  // Then further filter by subcategory if one is selected
  const filteredProducts = activeSubcategory
    ? categoryProducts.filter((p: BackendProduct) =>
        p.subcategories?.some((s) => s.id === activeSubcategory.id)
      )
    : categoryProducts;

  const mappedProducts = filteredProducts.map((p: BackendProduct) => {
    const canSellBox = !!p.can_sell_box;
    const boxPrice = Number.parseFloat((p.retail_price_box as unknown as string) ?? "0");
    const secondaryPrice = Number.parseFloat((p.retail_price_secondary as unknown as string) ?? "0");
    const showBoxPrice = canSellBox && Number.isFinite(boxPrice) && boxPrice > 0;
    const displayPrice = showBoxPrice ? boxPrice : secondaryPrice;

    const discount = Number.parseFloat((p.item_discount as unknown as string) ?? "0");
    const originalPrice = discount > 0 ? displayPrice + discount : undefined;
    const discountPercent =
      originalPrice && originalPrice > 0
        ? (discount / originalPrice) * 100
        : undefined;

    return {
      id: p.id,
      name: p.item_name,
      price: displayPrice,
      originalPrice,
      discountPercent,
      image: p.images?.[0] ? bucketUrl(p.images[0].object_key) : "/assets/home/product-1.png",
      variation: p.variation_value ?? p.secondary_unit_label ?? "",
      quantity: p.secondary_unit_label ? `1 ${p.secondary_unit_label}` : "1 Unit",
    };
  });

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
            {activeSubcategory ? (
              <>
                <Link
                  href={`/category/${slug}`}
                  className="text-[#6B7280] hover:text-[#01AC28] transition-colors"
                >
                  {category.category_name}
                </Link>
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#374151] font-semibold">
                  {activeSubcategory.subcategory_name}
                </span>
              </>
            ) : (
              <span className="text-[#374151] font-semibold">{category.category_name}</span>
            )}
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-2">
                {activeSubcategory ? activeSubcategory.subcategory_name : category.category_name}
              </h1>
              <p className="text-[#6B7280] text-sm md:text-base">
                {mappedProducts.length} products found
              </p>
            </div>
            
            {/* Filter Button - Mobile */}
            <div className="lg:hidden">
              <FilterSidebar
                showCategoryFilter={false}
                subcategories={subcategories}
                categoryAlias={slug}
                activeSubcategoryId={subFilter}
              />
            </div>
          </div>

          {/* Subcategory Chips */}
          {subcategories.length > 0 && (
            <SubcategoryChips
              subcategories={subcategories}
              categoryAlias={slug}
              activeSubcategoryId={subFilter}
            />
          )}

          {/* Main Content with Sidebar */}
          <div className="flex gap-6 lg:gap-8 mt-8">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <FilterSidebar
                showCategoryFilter={false}
                subcategories={subcategories}
                categoryAlias={slug}
                activeSubcategoryId={subFilter}
              />
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
              {mappedProducts.length > 10 && (
                <div className="my-12 md:my-16 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FlashSaleBanner />
                    <DeliveryBanner />
                  </div>
                </div>
              )}

              {/* Products Grid - Second Batch */}
              {mappedProducts.length > 10 && (
                <ProductGrid products={mappedProducts.slice(10)} />
              )}

              {/* Bottom Promotional Banner */}
              <div className="mt-12 md:mt-16">
                <ProcedureBanner />
              </div>

              {/* Empty state */}
              {mappedProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No products found in this category.</p>
                  {activeSubcategory && (
                    <Link
                      href={`/category/${slug}`}
                      className="mt-4 inline-block text-[#01AC28] hover:underline font-semibold"
                    >
                      View all {category.category_name} products
                    </Link>
                  )}
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
