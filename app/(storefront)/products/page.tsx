import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Product as BackendProduct, PaginatedProducts } from "@/types/product";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export const metadata = {
  title: "All Products | Pulse RX",
  description: "Browse all medicines and healthcare products",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();

  let productsData: PaginatedProducts = {
    data: [],
    total: 0,
    per_page: 24,
    current_page: 1,
    last_page: 1,
    from: null,
    to: null,
  };

  try {
    productsData = await getProducts({
      page,
      per_page: 24,
      ...(q ? { q } : {}),
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  const mappedProducts = productsData.data.map((p: BackendProduct) => {
    const opts = p.packaging_display?.options ?? [];
    const usePackagingDisplay = opts.length > 0;

    let displayPrice: number;
    let quantityLabel: string;

    if (usePackagingDisplay) {
      const first = opts[0];
      displayPrice = Number.parseFloat(first?.price ?? "0") || 0;
      quantityLabel = first?.label ? `1 ${first.label}` : "1 Unit";
    } else {
      const canSellBox = !!p.can_sell_box;
      const boxPrice = Number.parseFloat((p.retail_price_box as unknown as string) ?? "0");
      const secondaryPrice = Number.parseFloat((p.retail_price_secondary as unknown as string) ?? "0");
      const showBoxPrice = canSellBox && Number.isFinite(boxPrice) && boxPrice > 0;
      displayPrice = showBoxPrice ? boxPrice : secondaryPrice;
      quantityLabel = p.secondary_unit_label ? `1 ${p.secondary_unit_label}` : "1 Unit";
    }

    const discount = Number.parseFloat((p.item_discount as unknown as string) ?? "0");
    const originalPrice = discount > 0 ? displayPrice + discount : undefined;
    const discountPercent =
      originalPrice && originalPrice > 0 ? (discount / originalPrice) * 100 : undefined;

    const primaryImage = p.images?.find((img) => img.is_primary) || p.images?.[0];

    return {
      id: p.id,
      name: p.item_name,
      price: displayPrice,
      originalPrice,
      discountPercent,
      image: primaryImage ? bucketUrl(primaryImage.object_key) : "/assets/home/product-1.png",
      variation: p.variation_value ?? p.secondary_unit_label ?? "",
      quantity: quantityLabel,
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
            <Link
              href="/"
              className="text-[#6B7280] hover:text-[#01AC28] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[#374151] font-semibold">All Products</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F3B5C] mb-2">
              Explore All Products
            </h1>
            <p className="text-[#6B7280] text-sm md:text-base">
              {productsData.total} products found
            </p>
          </div>

          {mappedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              <Link
                href="/products"
                className="mt-4 inline-block text-[#01AC28] hover:underline font-semibold"
              >
                View all products
              </Link>
            </div>
          ) : (
            <>
              <ProductGrid products={mappedProducts} />
              <div className="mt-10 md:mt-12">
                <Pagination
                  basePath="/products"
                  currentPage={productsData.current_page}
                  lastPage={productsData.last_page}
                  total={productsData.total}
                  from={productsData.from}
                  to={productsData.to}
                  params={q ? { q } : undefined}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
