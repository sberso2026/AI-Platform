/**
 * Secret exposure scan for Phase 16A enterprise identity discovery corpus.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const targets = [
  "packages/platform-identity/src/version.ts",
  "packages/platform-identity/src/discovery-flags.ts",
  "packages/platform-identity/src/runtime-flags.ts",
  "packages/platform-identity/src/contracts.ts",
  "packages/platform-identity/src/draft-contracts.ts",
  "packages/platform-identity/src/architecture-decisions.ts",
  "packages/platform-identity/src/footprint.ts",
  "packages/platform-identity/src/domain/engine.ts",
  "packages/platform-identity/src/domain/events.ts",
  "docs/identity/PLATFORM_IDENTITY_PHASE_16A_EXISTING_FOOTPRINT.md",
  "docs/architecture/PLATFORM_ENTERPRISE_IDENTITY_ARCHITECTURE.md",
  "docs/architecture/PLATFORM_ENTERPRISE_SSO_OWNERSHIP_MATRIX.md",
  "docs/architecture/PLATFORM_IDENTITY_PHASE_16A.md",
  "docs/architecture/PLATFORM_IDENTITY_PHASE_16B.md",
  "docs/security/PLATFORM_ENTERPRISE_SSO_THREAT_MODEL.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_PROTOCOL_STRATEGY.md",
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_LIFECYCLE.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_TIER1_READINESS.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_GAP_REGISTER.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_IMPLEMENTATION_ROADMAP.md",
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_1_0_DRAFT.md",
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_2_0.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_UX_AND_COMMERCIAL.md",
  "docs/operations/PLATFORM_ENTERPRISE_SSO_OPERATIONS.md",
  "apps/web/src/app/(platform)/platform/enterprise-sso/page.tsx",
  "apps/web/src/app/(auth)/login/page.tsx",
  "supabase/migrations/20260808350000_batch_96_platform_enterprise_identity_oidc.sql",
].map((rel) => resolve(root, rel));

const patterns = [
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /client_secret\s*[:=]\s*['"][^'"]+['"]/i,
  /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i,
  /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
];

let failed = false;
for (const file of targets) {
  const text = readFileSync(file, "utf8");
  for (const re of patterns) {
    if (re.test(text)) {
      console.error(`Secret-like pattern in ${file}: ${re}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log("Phase 16A secret scan PASS");
