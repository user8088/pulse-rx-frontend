import Link from "next/link";
import { ShoppingCart, Truck, Phone, ArrowRight, Tag } from "lucide-react";

interface PromoBannerProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon?: React.ReactNode;
  gradient?: string;
}

export default function CategoryPromoBanner({
  title,
  description,
  ctaText,
  ctaLink,
  icon,
  gradient = 'from-[#01AC28] to-[#5C9D40]',
}: PromoBannerProps) {
  return (
    <Link
      href={ctaLink}
      data-cursor={ctaText}
      className="group relative block rounded-2xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradient} p-6 md:p-8 lg:p-10 text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {icon || (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
                </div>
              )}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">
                {title}
              </h3>
            </div>
            <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 max-w-2xl">
              {description}
            </p>
            <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
              <span className="text-base md:text-lg">{ctaText}</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>

          {/* Decorative Element */}
          <div className="hidden md:block w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/10 backdrop-blur-sm flex-shrink-0"></div>
        </div>
      </div>
    </Link>
  );
}

// Pre-configured banner components
export function OfferBanner() {
  return (
    <CategoryPromoBanner
      title="Special Category Discount"
      description="Get up to 30% off on all products in this category. Limited time offer - shop now!"
      ctaText="Shop Now"
      ctaLink="/special-offers"
      icon={
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      }
      gradient="from-[#01AC28] to-[#5C9D40]"
    />
  );
}

export function FlashSaleBanner() {
  return (
    <CategoryPromoBanner
      title="Flash Sale - Limited Time Offer"
      description="Hurry up! Get amazing deals on selected products. Buy 2 Get 1 Free on all items in this category. Don't miss out!"
      ctaText="Shop Flash Sale"
      ctaLink="/special-offers"
      icon={
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Tag className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      }
      gradient="from-[#044644] to-[#01AC28]"
    />
  );
}

export function DeliveryBanner() {
  return (
    <CategoryPromoBanner
      title="Free Delivery on Orders Over $199"
      description="Enjoy free shipping and returns on all orders above $199. Fast and secure delivery to your doorstep."
      ctaText="Learn More"
      ctaLink="/shipping"
      icon={
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Truck className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      }
      gradient="from-[#5C9D40] to-[#01AC28]"
    />
  );
}

export function ProcedureBanner() {
  return (
    <CategoryPromoBanner
      title="Need Help Choosing the Right Product?"
      description="Our pharmacists are available 24/7 to help you find the perfect product for your needs."
      ctaText="Contact Us"
      ctaLink="/contact"
      icon={
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Phone className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      }
      gradient="from-[#01AC28] to-[#044644]"
    />
  );
}
