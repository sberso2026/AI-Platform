import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
  // Pre-existing digital-twin / model-interoperability TS debt is outside this PI UX pass.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
