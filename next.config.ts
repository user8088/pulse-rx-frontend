import type { NextConfig } from "next";

const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL || "";
let bucketHost = "";
let bucketProtocol: "https" | "http" = "https";

try {
  const u = bucketUrl ? new URL(bucketUrl) : null;
  bucketHost = u?.hostname ?? "";
  bucketProtocol = u?.protocol === "http:" ? "http" : "https";
} catch {
  bucketHost = "";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: bucketHost
      ? [
          {
            protocol: bucketProtocol,
            hostname: bucketHost,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
