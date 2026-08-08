/**
 * Lightweight secret exposure scan for Shared Spatial Domain discovery.
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
  resolve(root, "packages/engineering-shared-spatial-domain"),
  resolve(root, "packages/engineering-shared-spatial-domain-certification"),
];

const SCAN_DOCS = [
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_EXISTING_FOOTPRINT.md",
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.md",
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_BOUNDARY_MAP.md",
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE_12L.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_OWNERSHIP.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_GEOMETRY_OWNERSHIP.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_CRS_GOVERNANCE.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_LOCAL_VS_GLOBAL_COORDINATES.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_BIM_GIS_MODEL_BOUNDARY.md",
  "docs/architecture/adr/ADR_SHARED_SPATIAL_LINEAR_REFERENCING_BOUNDARY.md",
  "docs/architecture/adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md",
  "docs/contracts/ENGINEERING_SHARED_SPATIAL_DOMAIN_PUBLIC_CONTRACTS_DRAFT.md",
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
