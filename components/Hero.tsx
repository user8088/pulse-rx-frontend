import Image from "next/image";
import { ShoppingCart } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full bg-[#044644] min-h-[600px] md:h-[600px] flex items-end overflow-hidden" style={{ background: 'linear-gradient(to right, #044644 0%, #044644 10%, #5C9D40 100%)' }}>
      <div className="container mx-auto px-4 md:px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between h-full z-10 py-8 md:py-12 relative">
        {/* Text Content */}
        <div className="w-full md:w-1/2 text-white space-y-4 md:space-y-6 py-4 md:py-12 z-20 relative pb-[320px] sm:pb-[400px] md:pb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
            Quality Medicines At <br className="hidden sm:block" /> Your Doorstep.
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-lg leading-relaxed">
            We ensure every medicine is genuine and stored under proper conditions, from us to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
            <button 
              data-cursor="Shop Now"
              className="bg-[#01AC28] hover:brightness-110 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all shadow-lg text-sm md:text-base w-full sm:w-auto"
            >
              Shop Now <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              data-cursor="View Products"
              className="border-2 border-white/40 hover:border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium transition-all bg-white/5 backdrop-blur-sm text-sm md:text-base w-full sm:w-auto"
            >
              Top Products
            </button>
          </div>
        </div>

        {/* Image Content - Absolutely positioned at bottom */}
        <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-[300px] sm:h-[380px] md:h-[110%] flex items-end justify-center md:justify-end z-10 pointer-events-none">
          <div className="relative w-full h-full max-w-[350px] sm:max-w-[450px] md:max-w-[600px]">
            <Image
              src="/assets/home/hero-img.png"
              alt="Doctor"
              fill
              className="object-contain object-bottom select-none"
              priority
            />
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-30">
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white"></div>
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/30"></div>
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/30"></div>
      </div>
    </section>
  );
}
