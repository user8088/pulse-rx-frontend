'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, Quote } from "lucide-react";
import { useRef, useState } from "react";

// Placeholder testimonial data - will be replaced with API data later
const testimonials = [
  {
    id: 1,
    name: "Dr. Daniel Lester",
    date: "23 March 2024",
    rating: 5,
    text: "Every so often I suffer from cystitis. Going to the doctor's is difficult if not impossible. Placed an order only for it to be refunded. 6 tablets of antibiotics.",
    avatar: "/assets/home/product-1.png", // Placeholder - will be replaced with actual avatars
  },
  {
    id: 2,
    name: "Dr. Devil Ron",
    date: "23 March 2024",
    rating: 5,
    text: "Best wishes Pharmacy Town! Be sure to ask for free multi vitamins, children's chewable vitamins, or prenatal vitamin. The dose packs helps simplicity all your medications.",
    avatar: "/assets/home/product-2.png", // Placeholder - will be replaced with actual avatars
  },
  {
    id: 3,
    name: "Dr. Raffa Anne",
    date: "23 March 2024",
    rating: 5,
    text: "The customer service for local pharmacies will always be willing go the extra mile when compared to other generic pharmacy when bombarded with questions.",
    avatar: "/assets/home/product-3.png", // Placeholder - will be replaced with actual avatars
  },
  {
    id: 4,
    name: "Dr. William Jack",
    date: "23 March 2024",
    rating: 5,
    text: "Great customer service. It's refreshing to find a pharmacy that makes you feel like you can ask anything and get an informed answer.",
    avatar: "/assets/home/product-4.png", // Placeholder - will be replaced with actual avatars
  },
  {
    id: 5,
    name: "Dr. Sarah Johnson",
    date: "20 March 2024",
    rating: 5,
    text: "Excellent service and quick delivery. The quality of medicines is top-notch and the staff is very knowledgeable.",
    avatar: "/assets/home/product-5.png", // Placeholder - will be replaced with actual avatars
  },
];

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
      
      // Check if we can still scroll right
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
      }, 300);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#F9FAFB] py-16 md:py-20 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-2">
              Trusted by Doctors
            </h2>
            {/* <p className="text-[#6B7280] text-sm md:text-base">
              See what medical professionals say about us
            </p> */}
          </div>
          <Link
            href="/testimonials"
            className="text-[#01AC28] font-semibold text-sm md:text-base hover:underline flex items-center gap-1 transition-colors hover:text-[#044644]"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex-shrink-0 w-[340px] sm:w-[380px] md:w-[420px] flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#01AC28]/20"
              >
                {/* Decorative Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-16 h-16 md:w-20 md:h-20 text-[#01AC28]" />
                </div>

                {/* Header with Avatar, Name and Date */}
                <div className="flex items-start gap-4 md:gap-5 mb-5 md:mb-6 relative z-10">
                  {/* Avatar with Border */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#01AC28] to-[#5C9D40] p-0.5">
                      <div className="w-full h-full rounded-full bg-white"></div>
                    </div>
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </div>

                  {/* Name and Date */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-base md:text-lg font-bold text-[#374151] mb-1.5">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs md:text-sm text-[#6B7280] font-medium">
                      {testimonial.date}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-5 md:mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <div className="relative z-10 flex-1">
                  <p className="text-sm md:text-base text-[#374151] leading-relaxed font-medium">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>

                {/* Bottom Accent Line */}
                <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#01AC28] to-[#5C9D40] rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Arrow */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-[#01AC28] rounded-full flex items-center justify-center text-gray-700 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 z-20 border border-gray-200 hover:border-[#01AC28]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
