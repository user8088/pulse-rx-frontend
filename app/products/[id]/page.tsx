import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />
      <ProductDetails productId={id} />
      <Footer />
    </main>
  );
}
