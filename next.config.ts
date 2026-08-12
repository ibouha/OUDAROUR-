import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the live development preview from writing into production build output.
  distDir: process.env.NODE_ENV === "development" ? ".next" : ".next-production",
};

export default nextConfig;
