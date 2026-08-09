/**
 * Lightweight secret exposure scan for Engineering OS Phase 14C.
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
  "docs/architecture/ENGINEERING_OS_PHASE_14C.md",
  "docs/architecture/RTB_SECURITY_AND_ASSURANCE_BOUNDARY.md",
  "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md",
  "docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md",
  "docs/security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md",
  "docs/security/RTB_ENTERPRISE_SECURITY_EXISTING_CONTROL_INVENTORY.md",
  "docs/security/RTB_SECURITY_OWNERSHIP_MATRIX.md",
  "docs/security/RTB_SECURITY_POLICY_ENFORCEMENT_MODEL.md",
  "docs/security/RTB_PRIVILEGED_ACCESS_BASELINE.md",
  "docs/security/RTB_TENANT_ISOLATION_ASSURANCE_MODEL.md",
  "docs/security/RTB_DATA_CLASSIFICATION_MODEL.md",
  "docs/security/RTB_DATA_GOVERNANCE_BASELINE.md",
  "docs/security/RTB_ENCRYPTION_BASELINE.md",
  "docs/security/RTB_AI_SECURITY_AND_TRUST_BASELINE.md",
  "docs/security/RTB_SECURE_SDLC_BASELINE.md",
  "docs/security/RTB_VULNERABILITY_MANAGEMENT_BASELINE.md",
  "docs/security/RTB_SECURITY_INCIDENT_RESPONSE_BASELINE.md",
  "docs/security/RTB_SECURITY_LOGGING_AND_MONITORING.md",
  "docs/security/RTB_THREAT_INTELLIGENCE_BOUNDARY.md",
  "docs/security/RTB_BACKUP_RECOVERY_AND_RESILIENCE.md",
  "docs/security/RTB_ARTIFACT_INTEGRITY_PROVENANCE_MODEL.md",
  "docs/security/RTB_CUSTOMER_TRUST_CENTER_BOUNDARY.md",
  "docs/security/RTB_ENTERPRISE_SECURITY_CONTROL_MATRIX.md",
  "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md",
  "docs/security/RTB_ENTERPRISE_SECURITY_READINESS_MATRIX.md",
  "docs/security/RTB_ENTERPRISE_CUSTOMER_ASSURANCE_READINESS.md",
  "docs/security/RTB_ESSENTIAL_EIGHT_APPLICABILITY.md",
  "apps/web/src/app/(platform)/engineering/modules/page.tsx",
  "apps/web/src/app/(platform)/engineering/page.tsx",
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
