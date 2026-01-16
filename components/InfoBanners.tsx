import Image from "next/image";
import Link from "next/link";

export default function InfoBanners() {
  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Banner - Medical Info */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[400px]">
            <Image
              src="/assets/home/banner-info-1.png"
              alt="Medical Information"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right Banner - Promotional Offer */}
          <Link
            href="/products?offer=25-off-free-delivery"
            data-cursor="Place Order"
            className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[400px] block"
          >
            <Image
              src="/assets/home/info-banner-2.png"
              alt="Special Offer"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-6 md:p-8 lg:p-10">
              {/* Offer Text */}
              <div className="text-white">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  Get 25%
                </h3>
                <p className="text-lg md:text-xl lg:text-2xl mb-2">
                  Discount &amp;
                </p>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold">
                  Free Delivery
                </h2>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
