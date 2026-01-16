import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: 1,
    image: "/assets/home/brand-img-1.jpg",
    title: "Anti-age",
    subtitle: "Skin Serum",
  },
  {
    id: 2,
    image: "/assets/home/brand-img-2.jpg",
    title: "Natural Wealth",
    subtitle: "Beta karoten",
  },
  {
    id: 3,
    image: "/assets/home/brand-img-3.png",
    title: "SKIN CARE",
    subtitle: "THAT SHOWS",
  },
];

export default function TopCategories() {
  return (
    <section className="w-full bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              data-cursor="View Products"
              className="group relative block rounded-xl md:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto lg:h-[400px]"
            >
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 lg:p-8">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
