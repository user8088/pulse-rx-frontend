import Image from "next/image";
import Link from "next/link";

const offers = [
  {
    id: 1,
    image: "/assets/home/offer-bannner-main.png",
    title: "Black Garlic Oil",
    description: "Stronger and Thicker Hair With Black Garlic Oil.",
    originalPrice: 37.00,
    currentPrice: 37.00,
    discount: "25% OFF",
    isMain: true,
  },
  {
    id: 2,
    image: "/assets/home/offer-banner-1.png",
    title: "Dental Care Set for Vivid and Bright Smiles",
    originalPrice: 33.90,
    currentPrice: 22.90,
    discount: "25% OFF",
    isMain: false,
  },
  {
    id: 3,
    image: "/assets/home/offer-banner-2.png",
    title: "Banana Flavoured Toothpaste",
    originalPrice: 37.00,
    currentPrice: 37.00,
    discount: "25% OFF",
    isMain: false,
  },
];

export default function OfferBanners() {
  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Offer Card - Left Side */}
          <Link
            href="/special-offers"
            data-cursor="View Products"
            className="group relative lg:col-span-2 rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[600px]"
          >
            <div className="relative w-full h-full">
              <Image
                src={offers[0].image}
                alt={offers[0].title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
              />
              
              {/* Overlay Gradient - Subtle from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10">
                {/* Discount Badge */}
                <div className="self-start">
                  <span className="inline-block bg-[#01AC28] text-white px-4 py-2 rounded-full text-sm md:text-base font-bold">
                    {offers[0].discount}
                  </span>
                </div>
                
                {/* Text Content */}
                <div className="text-white">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
                    {offers[0].title}
                  </h3>
                  {offers[0].description && (
                    <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-6 max-w-md">
                      {offers[0].description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm md:text-base text-white/70 line-through">
                      Rs. {offers[0].originalPrice.toFixed(2)}
                    </span>
                    <span className="text-lg md:text-xl lg:text-2xl font-bold">
                      Rs. {offers[0].currentPrice.toFixed(2)} Including Tax
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Side - Two Smaller Cards */}
          <div className="flex flex-col gap-4 md:gap-6">
            {offers.slice(1).map((offer) => (
              <Link
                key={offer.id}
                href="/special-offers"
                data-cursor="View Products"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:flex-1 lg:h-[290px]"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient - Subtle from bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6">
                    {/* Discount Badge */}
                    <div className="self-start">
                      <span className="inline-block bg-[#01AC28] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                        {offer.discount}
                      </span>
                    </div>
                    
                    {/* Text Content */}
                    <div className="text-white">
                      <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 line-clamp-2">
                        {offer.title}
                      </h3>
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <span className="text-xs md:text-sm text-white/70 line-through">
                          Rs. {offer.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm md:text-base lg:text-lg font-bold">
                          Rs. {offer.currentPrice.toFixed(2)} Including Tax
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
