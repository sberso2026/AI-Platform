/**
 * Lightweight secret exposure scan for Engineering OS Phase 14A.
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
  resolve(root, "packages/engineering-os"),
  resolve(root, "packages/engineering-os-certification"),
];

const SCAN_DOCS = [
  "docs/architecture/ENGINEERING_OS_PHASE_14A.md",
  "docs/architecture/ENGINEERING_OS_PHASE_14A_EXISTING_SYSTEM_INVENTORY.md",
  "docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md",
  "docs/architecture/ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_CANONICAL_OWNERSHIP_NORMALIZATION.md",
  "docs/architecture/ENGINEERING_OS_SHARED_DOMAIN_MATURITY_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_V1_MODULE_COMPATIBILITY_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_V1_CAPABILITY_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_CROSS_MODULE_SEARCH_MODEL.md",
  "docs/architecture/ENGINEERING_OS_AI_ORCHESTRATION_MODEL.md",
  "docs/architecture/ENGINEERING_OS_TOOL_FRAMEWORK_INTEGRATION.md",
  "docs/architecture/ENGINEERING_OS_V1_NAVIGATION_MODEL.md",
  "docs/architecture/ENGINEERING_OS_CONTEXT_MODEL.md",
  "docs/architecture/ENGINEERING_OS_V1_EVENT_MATRIX.md",
  "docs/architecture/ENGINEERING_OS_V1_HEALTH_MODEL.md",
  "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md",
  "docs/architecture/ENGINEERING_OS_V1_READINESS_MATRIX.md",
  "docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md",
  "apps/web/src/app/(platform)/engineering/modules/page.tsx",
  "apps/web/src/app/(platform)/engineering/page.tsx",
  "docs/commercial/ENGINEERING_OS_V1_PACKAGING_ARCHITECTURE.md",
  "docs/security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md",
  "docs/operations/ENGINEERING_OS_V1_CAPACITY_AND_PERFORMANCE_BASELINE.md",
  "docs/operations/ENGINEERING_OS_V1_OPERATIONS_READINESS.md",
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
  console.log(
    JSON.stringify({ secretExposureDetected: false, filesScanned: files.length }),
  );
}

main();
