import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['img.youtube.com'], // Allow YouTube thumbnails
  },
  reactStrictMode: false,
};

export default nextConfig;
