import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow reading from Drive CDN for thumbnails
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
