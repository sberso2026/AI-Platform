import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rtb/ui",
    "@rtb/types",
    "@rtb/platform-core",
    "@rtb/platform-kernel",
    "@rtb/plugin-sdk",
    "@rtb/database",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "@rtb/ui"],
  },
};

export default nextConfig;
