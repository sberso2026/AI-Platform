/**
 * Lightweight secret exposure scan for Inspection Intelligence packages.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const SECRET_ENV_NAMES = [
  "PLATFORM_EMBEDDING_API_KEY",
  "OPENAI_API_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MICROSOFT_CLIENT_SECRET",
] as const;

const SCAN_ROOTS = [
  resolve(root, "packages/inspection-intelligence"),
  resolve(root, "packages/inspection-intelligence-certification"),
  resolve(root, "docs/architecture"),
  resolve(root, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence"),
];

function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "artifacts") continue;
      collectFiles(full, acc);
    } else if (st.isFile() && st.size < 2_000_000) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const needles = SECRET_ENV_NAMES.map((n) => process.env[n]?.trim())
    .filter((v): v is string => Boolean(v) && v.length >= 12)
    .filter((v) => v !== "fixture-secret");
  const hits: string[] = [];
  for (const scanRoot of SCAN_ROOTS) {
    for (const file of collectFiles(scanRoot)) {
      const text = readFileSync(file, "utf8");
      for (const needle of needles) {
        if (text.includes(needle)) hits.push(file);
      }
    }
  }
  if (hits.length) {
    console.error(JSON.stringify({ secretExposureDetected: true, hits }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ secretExposureDetected: false }, null, 2));
}

main();
