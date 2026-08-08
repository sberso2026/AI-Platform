/**
 * Lightweight secret exposure scan for Digital Twin discovery packages and docs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const SECRET_ENV_NAMES = [
  "PLATFORM_EMBEDDING_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "MICROSOFT_CLIENT_SECRET",
  "CERT_USER_PASSWORD",
] as const;

const SCAN_ROOTS = [
  resolve(root, "packages/digital-twin"),
  resolve(root, "packages/digital-twin-certification"),
];

const SCAN_DOCS = [
  "docs/architecture/DIGITAL_TWIN_PHASE_12A_EXISTING_FOOTPRINT.md",
  "docs/architecture/DIGITAL_TWIN_TERMINOLOGY.md",
  "docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md",
  "docs/architecture/DIGITAL_TWIN_FIDELITY_MODEL.md",
  "docs/architecture/DIGITAL_THREAD_MODEL.md",
  "docs/architecture/DIGITAL_TWIN_SPATIAL_BOUNDARY.md",
  "docs/architecture/DIGITAL_TWIN_ASSET_INTELLIGENCE_BOUNDARY.md",
  "docs/architecture/DIGITAL_TWIN_SHM_BOUNDARY.md",
  "docs/architecture/DIGITAL_TWIN_PHASE_12A_CAPABILITY_MATRIX.md",
  "docs/architecture/DIGITAL_TWIN_PHASE_12A_DISCOVERY.md",
  "docs/contracts/DIGITAL_TWIN_PUBLIC_CONTRACTS_DRAFT.md",
  "docs/architecture/DIGITAL_TWIN_TELEMETRY_AND_TIMESERIES_ADR.md",
].map((rel) => resolve(root, rel));

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
  const files = [
    ...SCAN_ROOTS.flatMap((dir) => collectFiles(dir)),
    ...SCAN_DOCS.filter((file) => existsSync(file)),
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const name of SECRET_ENV_NAMES) {
      const re = new RegExp(`${name}\\s*[=:]\\s*['"][^'"]+['"]`);
      if (re.test(text)) {
        console.error(`Secret-like assignment found for ${name} in ${file}`);
        process.exit(1);
      }
    }
    if (/BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY/.test(text)) {
      console.error(`Private key material found in ${file}`);
      process.exit(1);
    }
    if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./.test(text)) {
      console.error(`JWT-like literal found in ${file}`);
      process.exit(1);
    }
  }
  console.log(JSON.stringify({ secretExposureDetected: false, filesScanned: files.length }));
}

main();
