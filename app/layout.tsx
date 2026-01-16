import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { SmoothScroll } from "@/components/SmoothScroll";
import MagicCursor from "@/components/MagicCursor";
import CartSidebar from "@/components/CartSidebar";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse RX Digital Pharmacy",
  description: "Pharmacy Retail Platform Storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased font-nunito`}>
        <MagicCursor />
        <SmoothScroll />
        <AuthProvider>
          <CartProvider>
            <CartSidebar />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
