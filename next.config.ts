import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://dpetals.com/cdn/shop/**"),
      new URL("https://cdn.shopify.com/**"),
    ],
  },
};

export default nextConfig;
