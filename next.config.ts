import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // A 404 for URLs outside the [locale] root layouts.
    globalNotFound: true,
  },
};

export default nextConfig;
