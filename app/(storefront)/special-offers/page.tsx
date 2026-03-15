import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import OfferBannerDetail from "@/components/OfferBannerDetail";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import { getOffers } from "@/lib/api/offers";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Offer } from "@/types/offer";
import type { Product as BackendProduct, PaginatedProducts } from "@/types/product";
import type { Category } from "@/types/category";
import type { ProductGridItem } from "@/components/ProductGrid";

function mapProductToGridItem(p: BackendProduct, offerPercent: number): ProductGridItem {
  const opts = p.packaging_display?.options ?? [];
  const usePackagingDisplay = opts.length > 0;

  let displayPrice: number;
  let quantityLabel: string;
  let unitType: "item" | "secondary" | "box" = "item";

  if (usePackagingDisplay) {
    const first = opts[0];
    displayPrice = Number.parseFloat(first?.price ?? "0") || 0;
    quantityLabel = first?.label ? `1 ${first.label}` : "1 Unit";
    if (first?.tier === "box" || first?.tier === "secondary" || first?.tier === "item") {
      unitType = first.tier;
    }
  } else {
    const canSellItem = !!p.can_sell_item;
    const canSellBox = !!p.can_sell_box;
    const itemPrice = Number.parseFloat(String(p.retail_price_item ?? "0"));
    const boxPrice = Number.parseFloat((p.retail_price_box as unknown as string) ?? "0");
    const secondaryPrice = Number.parseFloat((p.retail_price_secondary as unknown as string) ?? "0");
    const baseLabel = p.base_unit_label ?? "Unit";
    if (canSellItem && Number.isFinite(itemPrice) && itemPrice > 0) {
      displayPrice = itemPrice;
      quantityLabel = `1 ${baseLabel}`;
      unitType = "item";
    } else if (canSellBox && Number.isFinite(boxPrice) && boxPrice > 0) {
      displayPrice = boxPrice;
      quantityLabel = p.box_unit_label ? `1 ${p.box_unit_label}` : "1 Box";
      unitType = "box";
    } else {
      displayPrice = secondaryPrice;
      quantityLabel = p.secondary_unit_label ? `1 ${p.secondary_unit_label}` : "1 Unit";
      unitType = "secondary";
    }
  }

  const itemDiscountPct = Number.parseFloat((p.item_discount as unknown as string) ?? "0");
  const topTier: "item" | "secondary" | "box" = p.can_sell_box ? "box" : p.can_sell_secondary ? "secondary" : "item";
  const originalPrice =
    (itemDiscountPct > 0 || offerPercent > 0) && unitType === topTier
      ? displayPrice / (1 - Math.max(itemDiscountPct, offerPercent) / 100)
      : undefined;
  const discountPercent =
    originalPrice && originalPrice > 0 ? (1 - displayPrice / originalPrice) * 100 : undefined;
  const inStock = p.availability === "yes" || p.availability === "short";

  return {
    id: p.id,
    name: p.item_name,
    price: displayPrice,
    originalPrice,
    discountPercent,
    itemDiscount: itemDiscountPct,
    offerPercent,
    topTier,
    image: p.images?.[0] ? bucketUrl(p.images[0].object_key) : "/assets/home/product-1.png",
    variation: p.variation_value ?? p.secondary_unit_label ?? "",
    quantity: quantityLabel,
    unitType,
    inStock,
    requiresPrescription: !!p.requires_prescription,
  };
}

async function getProductsForOffer(
  offer: Offer,
  categories: Category[]
): Promise<ProductGridItem[]> {
  const categoryId = offer.category_id ?? offer.subcategory?.category_id;
  const category = categories.find((c) => c.id === categoryId);
  const categoryName = offer.category?.category_name ?? category?.category_name;
  if (!categoryName) return [];

  let data: PaginatedProducts = { data: [], total: 0, per_page: 100, current_page: 1, last_page: 1, from: null, to: null };
  try {
    data = await getProducts({ q: categoryName, per_page: 100 });
  } catch {
    return [];
  }

  const filtered = offer.category_id
    ? data.data.filter((p: BackendProduct) => p.category_id === offer.category_id)
    : data.data.filter((p: BackendProduct) =>
        p.subcategories?.some((s) => s.id === offer.subcategory_id)
      );

  return filtered.map((p: BackendProduct) =>
    mapProductToGridItem(p, Number(offer.discount_percentage) || 0)
  );
}

export const metadata = {
  title: "Special Offers | Pulse RX",
  description: "Current offers and discounts on categories and products",
};

export default async function SpecialOffersPage() {
  let offers: Offer[] = [];
  let categories: Category[] = [];
  try {
    const [offersRes, categoriesRes] = await Promise.all([getOffers(), getCategories({ per_page: 100 })]);
    offers = offersRes;
    categories = categoriesRes.data ?? [];
  } catch {
    // continue with empty
  }

  const offerSections: { offer: Offer; products: ProductGridItem[] }[] = [];
  for (const offer of offers) {
    const products = await getProductsForOffer(offer, categories);
    offerSections.push({ offer, products });
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

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
                  {offers.length} active offer{offers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {offerSections.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-gray-200 bg-gray-50">
              <p className="text-gray-500 text-lg">No active offers right now.</p>
              <Link href="/products" className="mt-4 inline-block text-[#01AC28] font-semibold hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16">
              {offerSections.map(({ offer, products }) => (
                <div key={offer.id}>
                  <OfferBannerDetail offer={offer} />
                  <div className="mt-6 md:mt-8">
                    {products.length === 0 ? (
                      <p className="text-gray-500 text-sm">No products in this offer.</p>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold text-[#374151] mb-4">
                          Products on offer ({products.length})
                        </h2>
                        <ProductGrid products={products} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
