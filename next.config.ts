import type { NextConfig } from "next";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add support for Web Workers
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
