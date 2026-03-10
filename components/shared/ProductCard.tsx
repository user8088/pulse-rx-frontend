'use client';

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

export interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  variation?: string;
  quantity?: string;
  href?: string;
  unitType?: "item" | "secondary" | "box";
  requiresPrescription?: boolean;
  inStock?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discountPercent,
  image,
  variation = "",
  quantity = "1 Unit",
  href,
  unitType = "item",
  requiresPrescription = false,
  inStock = true,
}: ProductCardProps) {
  const { addItem } = useCart();

  const hasDiscount =
    discountPercent != null && discountPercent > 0 && originalPrice != null && originalPrice > price;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!inStock) return;
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      variation,
      quantity,
      price,
      image,
      qty: 1,
      unit_type: unitType,
      requiresPrescription,
    });
  };

  const card = (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {hasDiscount && (
          <span className="absolute top-2.5 right-2.5 bg-[#1F3B5C] text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-md">
            {Math.round(discountPercent)}% OFF
          </span>
        )}

        {!inStock && (
          <span className="absolute bottom-2.5 left-2.5 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-md">
            Out of stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="text-xs md:text-sm font-semibold text-[#374151] mb-3 line-clamp-2 flex-1 leading-snug">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm md:text-base font-bold text-[#1F3B5C]">
            Rs. {price.toFixed(price % 1 === 0 ? 0 : 2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              Rs. {originalPrice.toFixed(originalPrice % 1 === 0 ? 0 : 2)}
            </span>
          )}
        </div>

        {/* Add To Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-fit border text-xs font-semibold px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
            inStock
              ? "border-[#1F3B5C] text-[#1F3B5C] hover:bg-[#1F3B5C] hover:text-white"
              : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {inStock ? "Add To Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full" data-cursor="View Product">
        {card}
      </Link>
    );
  }

  return card;
}
