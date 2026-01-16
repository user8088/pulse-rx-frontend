import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable optimization to avoid Vercel 404 issues
  },
};

export default nextConfig;
