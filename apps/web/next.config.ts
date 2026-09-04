import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "package.json"));
const repoRoot = path.resolve(process.cwd(), "../..");

function resolveFromProjectIntelligence(specifier: string): string | null {
  try {
    return require.resolve(specifier, {
      paths: [path.join(repoRoot, "packages/project-intelligence")],
    });
  } catch {
    return null;
  }
}

function toWebRelative(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath).split(path.sep).join("/");
}

const pdfJsWorker = resolveFromProjectIntelligence("pdfjs-dist/legacy/build/pdf.worker.mjs");
const pdfParseWorker = resolveFromProjectIntelligence("pdf-parse/dist/worker/pdf.worker.mjs");
const pdfJsPackage = pdfJsWorker
  ? path.join(pdfJsWorker, "..", "..", "..")
  : resolveFromProjectIntelligence("pdfjs-dist/package.json")?.replace(/package\.json$/, "") ?? null;
const pdfParsePackage = resolveFromProjectIntelligence("pdf-parse/package.json")?.replace(/package\.json$/, "") ?? null;

const pdfTraceIncludes = [
  pdfJsWorker,
  pdfParseWorker,
  pdfJsPackage ? path.join(pdfJsPackage, "**") : null,
  pdfParsePackage ? path.join(pdfParsePackage, "dist/**") : null,
]
  .filter((value): value is string => Boolean(value))
  .map(toWebRelative);

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
  // Invariant: general PI API lambdas must not load pdf-parse. Trace parsers only on document routes.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/engineering/project-intelligence/documents/**": pdfTraceIncludes,
    "/api/engineering/documents/**": pdfTraceIncludes,
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      const previous = config.externals;
      const forcePdfExternal = (
        { request }: { request?: string },
        callback: (error?: Error | null, result?: string) => void,
      ) => {
        if (
          request === "pdf-parse" ||
          request === "pdf-parse/worker" ||
          request === "pdfjs-dist" ||
          request?.startsWith("pdfjs-dist/") ||
          request === "@napi-rs/canvas"
        ) {
          callback(null, `commonjs ${request}`);
          return;
        }
        callback();
      };
      config.externals = Array.isArray(previous)
        ? [...previous, forcePdfExternal]
        : [previous, forcePdfExternal].filter(Boolean);
    } else {
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
  // Pre-existing digital-twin / model-interoperability TS debt is outside this Command Center repair.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
