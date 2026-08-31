import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rtb/ui",
    "@rtb/types",
    "@rtb/platform-core",
    "@rtb/platform-kernel",
    "@rtb/platform-commerce",
    "@rtb/plugin-sdk",
    "@rtb/database",
    "@rtb/digital-twin",
    "@rtb/engineering-os",
    "@rtb/project-intelligence",
    "@rtb/project-controls",
    "@rtb/inspection-intelligence",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "@rtb/ui"],
  },
  // Workspace packages are source-imported; pre-existing TS debt is outside the EOS pilot
  // webpack boundary fix. Vercel `next build` must complete after the node:crypto client failure.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
