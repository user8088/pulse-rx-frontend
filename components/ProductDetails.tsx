'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, AlertCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { getProduct, getProductVariations } from "@/lib/api/products";
import { bucketUrl } from "@/lib/bucketUrl";
import type { Product } from "@/types/product";

interface ProductDetailsProps {
  productId: string;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<Product[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productData = await getProduct(productId);
        setProduct(productData);
        setSelectedVariation(productData);

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
    // You might want to update the URL here if each variant has its own page
    // window.history.pushState({}, '', `/products/${variant.id}`);
  };

  const handleAddToCart = () => {
    if (!selectedVariation) return;

    addItem({
      id: selectedVariation.id,
      name: selectedVariation.item_name,
      variation: selectedVariation.variation_value || "",
      quantity: "1", // Default quantity string
      price: parseFloat(selectedVariation.retail_price_unit),
      image: selectedVariation.images?.[0] ? bucketUrl(selectedVariation.images[0].object_key) : "/assets/home/product-1.png",
      qty: quantity,
      requiresPrescription: false // Set based on business logic if needed
    });
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
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
                <span className="text-xl md:text-2xl font-bold text-[#374151] pt-2">
                  Rs. {parseFloat(selectedVariation.retail_price_unit).toFixed(2)}
                </span>
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
                  className="flex-1 bg-[#374151] hover:bg-[#1F2937] text-white py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md hover:shadow-lg"
                >
                  ORDER NOW
                </button>
                <button 
                  data-cursor="Add to Cart"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#01AC28] hover:bg-[#044644] text-white py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section Placeholder */}
      <section className="py-16 px-4 md:px-6 lg:px-12 border-t border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">PRODUCT INFO</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#374151]">Details & Usage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-[#374151] mb-4">Availability:</h3>
              <p className={`text-sm font-semibold ${selectedVariation.availability === "yes" ? 'text-green-600' : selectedVariation.availability === "short" ? 'text-amber-600' : 'text-red-600'}`}>
                {selectedVariation.availability === "yes" ? 'Available' : selectedVariation.availability === "short" ? 'Short Supply' : 'Unavailable'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-[#374151] mb-4">Brand Information:</h3>
              <p className="text-sm text-gray-500">
                {selectedVariation.brand || "This product is supplied by one of our trusted manufacturers."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
