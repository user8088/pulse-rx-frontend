import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#06422B] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1 - Company Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                PULSERX
              </span>
            </Link>
            
            {/* Address */}
            <div className="space-y-3 text-sm md:text-base text-white/80">
              <p className="leading-relaxed">
                123 Road, Dhaka, Bangladesh
              </p>
              <p>
                Phone: <a href="tel:+88017010767000" className="hover:text-white transition-colors">+880 1701 076 7000</a>
              </p>
              <p>
                Email: <a href="mailto:contact@pulserx.com" className="hover:text-white transition-colors">contact@pulserx.com</a>
              </p>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Careers", href: "/careers" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                { name: "Medical", href: "/services/medical" },
                { name: "Operation", href: "/services/operation" },
                { name: "Laboratory", href: "/services/laboratory" },
                { name: "ICU", href: "/services/icu" },
                { name: "Patient Ward", href: "/services/patient-ward" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Social Links */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Social Link</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Payment Methods */}
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xs md:text-sm font-semibold text-white/90 mb-3 md:mb-4 uppercase tracking-wider">
                WE ACCEPT
              </p>
              <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center md:justify-start">
                {/* Payment Icons - Using text placeholders, can be replaced with actual icons */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">AMEX</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">DISC</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">PP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-white/70">
                Copyright © {new Date().getFullYear()} Pulse RX. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
