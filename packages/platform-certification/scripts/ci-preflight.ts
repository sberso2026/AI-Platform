import { existsSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export function main(): void {
  const target = process.env.PLATFORM_CERTIFICATION_TARGET ?? "hosted_staging";
  if (process.env.ALLOW_PRODUCTION_CERTIFICATION === "true") {
    throw new Error("Production destructive certification is blocked for Phase 7B");
  }
  if (target !== "hosted_staging") {
    throw new Error(`Unsupported certification target: ${target}`);
  }
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`[platform-preflight] Missing secrets (unit gates may still run): ${missing.join(", ")}`);
  }
  const root = resolve(import.meta.dirname, "../../..");
  if (!existsSync(resolve(root, "docs/architecture/RTB_AI_PLATFORM_PRODUCT_MODEL.md"))) {
    throw new Error("RTB AI Platform product model doc missing");
  }
  console.log("[platform-preflight] ok");
}

const isDirect =
  process.argv[1]?.includes("ci-preflight") ||
  process.env.PLATFORM_PREFLIGHT_DIRECT === "1";

if (isDirect) {
  try {
    main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
