import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sqlite3'],
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // تنظیمات برای حل مشکل ENOENT
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sqlite3');
    }
    return config;
  },
};

export default nextConfig;

