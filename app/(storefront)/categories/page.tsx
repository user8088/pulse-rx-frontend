import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategories } from "@/lib/api/categories";
import CategoriesGrid from "./CategoriesGrid";

export const metadata = {
  title: "All Categories | Pulse RX",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>>["data"] = [];
  try {
    const res = await getCategories({ per_page: 100 });
    categories = res.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <section className="py-10 md:py-14 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F3B5C] mb-8">
            All Categories
          </h1>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <CategoriesGrid categories={categories} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
