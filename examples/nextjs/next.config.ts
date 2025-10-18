import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ignoreBuildErrors: true,
  optimizePackageImports: ["react-resizable-panels"],
};

export default nextConfig;
