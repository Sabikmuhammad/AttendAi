import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Subdomain-based routing is disabled; keep dev origins to root hosts only.
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.1.6',
    '172.20.10.2',
  ],
  experimental: {
    devtoolSegmentExplorer: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
