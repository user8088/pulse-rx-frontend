'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, AlertCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { getProduct, getProductVariations } from "@/lib/api/products";
import { getOffers } from "@/lib/api/offers";
import { bucketUrl } from "@/lib/bucketUrl";
import { effectiveDiscountPerUnit } from "@/utils/pricing";
import { getBestOfferPercentForProduct } from "@/utils/offers";
import type { Product } from "@/types/product";
import type { Offer } from "@/types/offer";

interface ProductDetailsProps {
  productId: string;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [variations, setVariations] = useState<Product[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Product | null>(null);
  const [unitType, setUnitType] = useState<"item" | "secondary" | "box">("secondary");
  const [selectedPackOptionIndex, setSelectedPackOptionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [infoTab, setInfoTab] = useState<string>("");
  const { addItem } = useCart();
  const { customerProfile } = useAuth();
  const customerDiscountPct = Number(customerProfile?.discount_percentage) || 0;

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [productData, offersData] = await Promise.all([
          getProduct(productId),
          getOffers().catch(() => []),
        ]);
        setProduct(productData);
        setSelectedVariation(productData);
        setOffers(offersData);

        const opts = productData.packaging_display?.options ?? [];
        if (opts.length > 0) {
          setSelectedPackOptionIndex(0);
        } else {
          const canSellItem = !!productData.can_sell_item;
          const canSellSecondary = !!productData.can_sell_secondary;
          const canSellBox = !!productData.can_sell_box;
          if (canSellItem) setUnitType("item");
          else if (canSellSecondary) setUnitType("secondary");
          else if (canSellBox) setUnitType("box");
        }

        if (productData.product_group_id) {
          const variants = await getProductVariations(productData.product_group_id);
          setVariations(variants);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productId]);

  const handleVariationChange = (variant: Product) => {
    setSelectedVariation(variant);
    const opts = variant.packaging_display?.options ?? [];
    if (opts.length > 0) {
      setSelectedPackOptionIndex(0);
    } else {
      const canSellItem = !!variant.can_sell_item;
      const canSellSecondary = !!variant.can_sell_secondary;
      const canSellBox = !!variant.can_sell_box;
      if (canSellItem) setUnitType("item");
      else if (canSellSecondary) setUnitType("secondary");
      else if (canSellBox) setUnitType("box");
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariation) return;
    const opts = selectedVariation.packaging_display?.options ?? [];
    const canSellSecondary = !!selectedVariation.can_sell_secondary;
    const canSellBox = !!selectedVariation.can_sell_box;

    let safePrice: number;
    let quantityLabel: string;
    let resolvedUnitType: "item" | "secondary" | "box" = "item";

    if (opts.length > 0) {
      const opt = opts[selectedPackOptionIndex];
      if (!opt) return;
      safePrice = Number.parseFloat(opt.price) || 0;
      quantityLabel = `1 ${opt.label}`;
      resolvedUnitType = opt.tier;
    } else {
      const canSellItem = !!selectedVariation.can_sell_item;
      if (!canSellItem && !canSellSecondary && !canSellBox) return;
      const itemPrice = Number.parseFloat(
        (selectedVariation.retail_price_item as unknown as string) ?? "0"
      );
      const secondaryPrice = Number.parseFloat(
        (selectedVariation.retail_price_secondary as unknown as string) ?? "0"
      );
      const boxPrice = Number.parseFloat(
        (selectedVariation.retail_price_box as unknown as string) ?? "0"
      );
      let effectiveType: "item" | "secondary" | "box" = "secondary";
      if (unitType === "item" && canSellItem) effectiveType = "item";
      else if (unitType === "box" && canSellBox) effectiveType = "box";
      else if (canSellSecondary) effectiveType = "secondary";
      else if (canSellBox) effectiveType = "box";
      else if (canSellItem) effectiveType = "item";
      const priceSource =
        effectiveType === "item" ? itemPrice : effectiveType === "box" ? boxPrice : secondaryPrice;
      safePrice = Number.isFinite(priceSource) ? priceSource : 0;
      const baseLabel =
        (selectedVariation.base_unit_label as unknown as string) || "Unit";
      const secLabel =
        (selectedVariation.secondary_unit_label as unknown as string) || "Pack";
      const bxLabel =
        (selectedVariation.box_unit_label as unknown as string) || "Box";
      quantityLabel =
        effectiveType === "item"
          ? `1 ${baseLabel}`
          : effectiveType === "box"
            ? `Per ${bxLabel}`
            : `Per ${secLabel}`;
      resolvedUnitType = effectiveType;
    }

    const itemDiscountPct = Number.parseFloat((selectedVariation.item_discount as unknown as string) ?? "0") || 0;
    const topTier: "item" | "secondary" | "box" = canSellBox ? "box" : canSellSecondary ? "secondary" : "item";
    const offerPercent = getBestOfferPercentForProduct(offers, {
      category_id: selectedVariation.category_id ?? null,
      subcategories: selectedVariation.subcategories ?? undefined,
    });
    addItem({
      id: selectedVariation.id,
      name: selectedVariation.item_name,
      variation: selectedVariation.variation_value || "",
      quantity: quantityLabel,
      price: safePrice,
      item_discount: itemDiscountPct,
      offer_percent: offerPercent,
      top_tier: topTier,
      image: selectedVariation.images?.[0] ? bucketUrl(selectedVariation.images[0].object_key) : "/assets/home/product-1.png",
      qty: quantity,
      unit_type: resolvedUnitType,
      requiresPrescription: !!selectedVariation.requires_prescription,
    });
  };

  const handleOrderNow = () => {
    if (!selectedVariation || !isInStock) return;
    // Add to cart without popping open the cart sidebar
    const opts = selectedVariation.packaging_display?.options ?? [];
    const canSellSecondary = !!selectedVariation.can_sell_secondary;
    const canSellBox = !!selectedVariation.can_sell_box;

    let safePrice: number;
    let quantityLabel: string;
    let resolvedUnitType: "item" | "secondary" | "box" = "item";

    if (opts.length > 0) {
      const opt = opts[selectedPackOptionIndex];
      if (!opt) return;
      safePrice = Number.parseFloat(opt.price) || 0;
      quantityLabel = `1 ${opt.label}`;
      resolvedUnitType = opt.tier;
    } else {
      const canSellItem = !!selectedVariation.can_sell_item;
      if (!canSellItem && !canSellSecondary && !canSellBox) return;
      const itemPrice = Number.parseFloat(
        (selectedVariation.retail_price_item as unknown as string) ?? "0"
      );
      const secondaryPrice = Number.parseFloat(
        (selectedVariation.retail_price_secondary as unknown as string) ?? "0"
      );
      const boxPrice = Number.parseFloat(
        (selectedVariation.retail_price_box as unknown as string) ?? "0"
      );
      let effectiveType: "item" | "secondary" | "box" = "secondary";
      if (unitType === "item" && canSellItem) effectiveType = "item";
      else if (unitType === "box" && canSellBox) effectiveType = "box";
      else if (canSellSecondary) effectiveType = "secondary";
      else if (canSellBox) effectiveType = "box";
      else if (canSellItem) effectiveType = "item";
      const priceSource =
        effectiveType === "item" ? itemPrice : effectiveType === "box" ? boxPrice : secondaryPrice;
      safePrice = Number.isFinite(priceSource) ? priceSource : 0;
      const baseLabel =
        (selectedVariation.base_unit_label as unknown as string) || "Unit";
      const secLabel =
        (selectedVariation.secondary_unit_label as unknown as string) || "Pack";
      const bxLabel =
        (selectedVariation.box_unit_label as unknown as string) || "Box";
      quantityLabel =
        effectiveType === "item"
          ? `1 ${baseLabel}`
          : effectiveType === "box"
            ? `Per ${bxLabel}`
            : `Per ${secLabel}`;
      resolvedUnitType = effectiveType;
    }

    const itemDiscountPct = Number.parseFloat((selectedVariation.item_discount as unknown as string) ?? "0") || 0;
    const topTier: "item" | "secondary" | "box" = canSellBox ? "box" : canSellSecondary ? "secondary" : "item";
    const offerPercent = getBestOfferPercentForProduct(offers, {
      category_id: selectedVariation.category_id ?? null,
      subcategories: selectedVariation.subcategories ?? undefined,
    });
    addItem(
      {
        id: selectedVariation.id,
        name: selectedVariation.item_name,
        variation: selectedVariation.variation_value || "",
        quantity: quantityLabel,
        price: safePrice,
        item_discount: itemDiscountPct,
        offer_percent: offerPercent,
        top_tier: topTier,
        image: selectedVariation.images?.[0]
          ? bucketUrl(selectedVariation.images[0].object_key)
          : "/assets/home/product-1.png",
        qty: quantity,
        unit_type: resolvedUnitType,
        requiresPrescription: !!selectedVariation.requires_prescription,
      },
      { openCart: false }
    );
    router.push("/checkout");
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01AC28] mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading product details...</p>
    </div>
  );

  if (error || !selectedVariation) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-800">{error || "Product not found"}</h2>
      <Link href="/" className="text-[#01AC28] hover:underline mt-4 inline-block">Return to Home</Link>
    </div>
  );

  const images = selectedVariation.images || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const mainImageUrl = primaryImage ? bucketUrl(primaryImage.object_key) : "/assets/home/product-1.png";

  const canSellItem = !!selectedVariation.can_sell_item;
  const canSellSecondary = !!selectedVariation.can_sell_secondary;
  const canSellBox = !!selectedVariation.can_sell_box;
  const isInStock =
    selectedVariation.availability === "yes" ||
    selectedVariation.availability === "short";
  const detailSections = [...(selectedVariation.detail_sections ?? [])]
    .filter((section) => !!section?.key && !!section?.label)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const hasDynamicDetails = detailSections.length > 0;
  const activeTab =
    detailSections.find((section) => section.key === infoTab)?.key ??
    detailSections[0]?.key ??
    "";
  const packOptions = selectedVariation.packaging_display?.options ?? [];
  const usePackagingDisplay = packOptions.length > 0;
  const baseUnitLabel =
    (selectedVariation.base_unit_label as unknown as string) || "Unit";
  const secondaryLabel =
    (selectedVariation.secondary_unit_label as unknown as string) || "Pack";
  const boxUnitLabel =
    (selectedVariation.box_unit_label as unknown as string) || "Box";
  const itemPrice = Number.parseFloat(
    (selectedVariation.retail_price_item as unknown as string) ?? "0"
  );
  const secondaryPrice = Number.parseFloat(
    (selectedVariation.retail_price_secondary as unknown as string) ?? "0"
  );
  const boxPrice = Number.parseFloat(
    (selectedVariation.retail_price_box as unknown as string) ?? "0"
  );
  const hasMultiplePackOptions =
    usePackagingDisplay
      ? packOptions.length > 1
      : [
          canSellItem && Number.isFinite(itemPrice) && itemPrice > 0,
          canSellSecondary && Number.isFinite(secondaryPrice) && secondaryPrice > 0,
          canSellBox && Number.isFinite(boxPrice) && boxPrice > 0,
        ].filter(Boolean).length > 1;
  const selectedPrice = usePackagingDisplay
    ? Number.parseFloat(packOptions[selectedPackOptionIndex]?.price ?? "0") || 0
    : unitType === "item" && canSellItem
      ? itemPrice
      : unitType === "box" && canSellBox
        ? boxPrice
        : secondaryPrice;

  const itemDiscountPct = Number.parseFloat((selectedVariation.item_discount as unknown as string) ?? "0") || 0;
  const topTier: "item" | "secondary" | "box" = canSellBox ? "box" : canSellSecondary ? "secondary" : "item";
  const selectedTier: "item" | "secondary" | "box" = usePackagingDisplay
    ? (packOptions[selectedPackOptionIndex]?.tier ?? "item")
    : unitType;
  const offerPercent = getBestOfferPercentForProduct(offers, {
    category_id: selectedVariation.category_id ?? null,
    subcategories: selectedVariation.subcategories ?? undefined,
  });
  const { amount: effectiveDiscount, isCustomerDiscount, source, effectivePercent } = effectiveDiscountPerUnit(
    selectedPrice,
    itemDiscountPct,
    customerDiscountPct,
    selectedTier === topTier,
    offerPercent
  );
  const displayPrice = Math.round((selectedPrice - effectiveDiscount) * 100) / 100;
  const showCustomerDiscount = effectiveDiscount > 0 && isCustomerDiscount;

  return (
    <div className="w-full">
      {/* Close Button */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#374151] hover:text-[#01AC28] transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Close</span>
        </Link>
      </div>

      {/* Main Product Section */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            {/* Left - Thumbnails */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3 md:gap-4 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
              {images.map((img) => (
                <button
                  key={img.id}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-full lg:aspect-square rounded-xl overflow-hidden border transition-all ${
                    primaryImage?.id === img.id
                      ? 'border-[#01AC28] shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <Image
                    src={bucketUrl(img.object_key)}
                    alt="Product thumbnail"
                    fill
                    className="object-contain p-2 md:p-3"
                    sizes="(max-width: 1024px) 120px, 150px"
                  />
                </button>
              ))}
            </div>

            {/* Center - Main Product Image */}
            <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full aspect-square max-w-[350px] sm:max-w-[450px] lg:max-w-full">
                <Image
                  key={selectedVariation.id}
                  src={mainImageUrl}
                  alt={selectedVariation.item_name}
                  fill
                  className="object-contain animate-[fadeIn_0.5s_ease-in-out]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Right - Product Information */}
            <div className="lg:col-span-6 flex flex-col order-3 lg:order-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    {selectedVariation.category?.category_name || "PRODUCT"}
                  </span>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#374151]">
                      {selectedVariation.item_name}
                    </h1>
                  </div>
                <div className="mt-2">
                  <span
                    className={`text-xs font-semibold ${
                      isInStock ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isInStock ? "In stock" : "Out of stock"}
                  </span>
                </div>
                  {/* Subcategory Badges */}
                  {selectedVariation.subcategories && selectedVariation.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedVariation.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={
                            selectedVariation.category?.alias
                              ? `/category/${selectedVariation.category.alias.toLowerCase()}?sub=${sub.id}`
                              : "#"
                          }
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#374151] hover:bg-[#01AC28] hover:text-white transition-all"
                        >
                          {sub.subcategory_name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end pt-2">
                  {effectiveDiscount > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {selectedPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl md:text-2xl font-bold text-[#374151]">
                    Rs. {Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : "0.00"}
                  </span>
                  {effectiveDiscount > 0 && (
                    <span className="text-[10px] font-bold text-[#01AC28] uppercase tracking-wider mt-0.5">
                      {showCustomerDiscount
                        ? `${effectivePercent}% your discount`
                        : source === "offer"
                          ? `${effectivePercent}% off`
                          : `${effectivePercent}% off${selectedTier === "box" ? " per box" : selectedTier === "secondary" ? " per pack" : ""}`}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm md:text-base text-[#6B7280] mb-10 mt-6 leading-relaxed max-w-xl">
                Brand: {selectedVariation.brand || "Pulse RX"}
                <br />
                SKU: {selectedVariation.item_id}
              </p>

              {/* Variations */}
              {variations.length > 0 && (
                <div className="mb-8">
                  <span className="text-xs font-bold text-[#374151] block uppercase tracking-wider mb-3">
                    {selectedVariation.variation_type || "VARIATION"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variations.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleVariationChange(v)}
                        className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                          selectedVariation.id === v.id
                            ? 'bg-[#374151] text-white border-[#374151]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {v.variation_value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase options - only show when customer can choose between multiple pack sizes */}
              {hasMultiplePackOptions && (
                <div className="mb-8">
                  <span className="text-xs font-bold text-[#374151] block uppercase tracking-wider mb-3">
                    {usePackagingDisplay ? "Select Pack Size" : "HOW DO YOU WANT TO BUY?"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {usePackagingDisplay ? (
                      packOptions.map((opt, idx) => {
                        const optPrice = Number.parseFloat(opt.price ?? "0") || 0;
                        const optTier: "item" | "secondary" | "box" = opt.tier ?? "item";
                        const { amount: optDiscount } = effectiveDiscountPerUnit(optPrice, itemDiscountPct, customerDiscountPct, optTier === topTier, offerPercent);
                        const optDisplayPrice = Math.round((optPrice - optDiscount) * 100) / 100;
                        return (
                          <button
                            key={opt.tier}
                            type="button"
                            onClick={() => setSelectedPackOptionIndex(idx)}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                              selectedPackOptionIndex === idx
                                ? "bg-[#374151] text-white border-[#374151]"
                                : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            {opt.description} · Rs. {optDisplayPrice.toFixed(2)}
                          </button>
                        );
                      })
                    ) : (
                      <>
                        {canSellItem && Number.isFinite(itemPrice) && itemPrice > 0 && (() => {
                          const { amount: d } = effectiveDiscountPerUnit(itemPrice, itemDiscountPct, customerDiscountPct, "item" === topTier, offerPercent);
                          const p = Math.round((itemPrice - d) * 100) / 100;
                          return (
                            <button
                              type="button"
                              onClick={() => setUnitType("item")}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                                unitType === "item"
                                  ? "bg-[#374151] text-white border-[#374151]"
                                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              {baseUnitLabel} · Rs. {p.toFixed(2)}
                            </button>
                          );
                        })()}
                        {canSellSecondary && Number.isFinite(secondaryPrice) && secondaryPrice > 0 && (() => {
                          const { amount: d } = effectiveDiscountPerUnit(secondaryPrice, itemDiscountPct, customerDiscountPct, "secondary" === topTier, offerPercent);
                          const p = Math.round((secondaryPrice - d) * 100) / 100;
                          return (
                            <button
                              type="button"
                              onClick={() => setUnitType("secondary")}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                                unitType === "secondary"
                                  ? "bg-[#374151] text-white border-[#374151]"
                                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              {secondaryLabel} · Rs. {p.toFixed(2)}
                            </button>
                          );
                        })()}
                        {canSellBox && Number.isFinite(boxPrice) && boxPrice > 0 && (() => {
                          const { amount: d } = effectiveDiscountPerUnit(boxPrice, itemDiscountPct, customerDiscountPct, "box" === topTier, offerPercent);
                          const p = Math.round((boxPrice - d) * 100) / 100;
                          return (
                            <button
                              type="button"
                              onClick={() => setUnitType("box")}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                                unitType === "box"
                                  ? "bg-[#374151] text-white border-[#374151]"
                                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              {boxUnitLabel} · Rs. {p.toFixed(2)}
                            </button>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center mb-8">
                <span className="text-xs font-bold text-[#374151] w-24 uppercase tracking-wider">QUANTITY</span>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="px-4 py-2 font-bold text-[#374151]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8">
                <button
                  data-cursor="Order Now"
                  onClick={handleOrderNow}
                  disabled={!isInStock}
                  className={`flex-1 py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md ${
                    isInStock
                      ? "bg-[#374151] hover:bg-[#1F2937] text-white hover:shadow-lg cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isInStock ? "ORDER NOW" : "OUT OF STOCK"}
                </button>
                <button
                  data-cursor="Add to Cart"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`flex-1 py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-[#01AC28] hover:bg-[#044644] text-white hover:shadow-lg cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isInStock ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product info tabs */}
      <section className="py-16 px-4 md:px-6 lg:px-12 border-t border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
            {hasDynamicDetails ? (
              <>
                {/* Dynamic tabs from backend detail_sections */}
                <div className="flex border-b border-gray-100 px-6 pt-4">
                  {detailSections.map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setInfoTab(tab.key)}
                        className={`relative px-4 pb-3 pt-2 text-sm font-medium transition-colors ${
                          active
                            ? "text-[#059669]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                        {active && (
                          <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#059669] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-6 py-6">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {detailSections.find((section) => section.key === activeTab)?.content ?? ""}
                  </p>
                </div>
              </>
            ) : (
              <div className="px-6 py-6">
                <p className="text-sm text-gray-600">No description added yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
