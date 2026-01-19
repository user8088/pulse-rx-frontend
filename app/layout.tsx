import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
