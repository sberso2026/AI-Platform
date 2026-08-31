import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: [
    "@rtb/ui",
    "@rtb/types",
    "@rtb/platform-core",
    "@rtb/platform-kernel",
    "@rtb/platform-intelligence",
    "@rtb/platform-commerce",
    "@rtb/plugin-sdk",
    "@rtb/database",
    "@rtb/engineering-os",
    "@rtb/project-intelligence",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "@rtb/ui"],
  },
};

export default nextConfig;
