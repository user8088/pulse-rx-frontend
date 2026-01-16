import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const promises = [
  {
    icon: Truck,
    title: "Free Shipping & Returns",
    description: "For all orders over $ 199.00",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "We ensure secure payment",
  },
  {
    icon: RotateCcw,
    title: "Money Back Guarantee",
    description: "Returning money 30 days",
  },
  {
    icon: Headphones,
    title: "24/9 Customer Support",
    description: "Friendly customer support",
  },
];

export default function PromisesSection() {
  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {/* Icon Circle */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#EFEFEF] flex items-center justify-center mb-5 md:mb-6 flex-shrink-0">
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-[#01AC28]" />
                </div>
                
                {/* Title */}
                <h3 className="text-base md:text-lg font-bold text-[#374151] mb-2 md:mb-3">
                  {promise.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm md:text-base text-[#6B7280] leading-relaxed">
                  {promise.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
