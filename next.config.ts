import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the standard output in normal use while allowing validation builds
  // to run alongside the development server without sharing build artifacts.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
