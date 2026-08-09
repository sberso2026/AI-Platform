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
  "packages/platform-identity/src/draft-contracts.ts",
  "packages/platform-identity/src/architecture-decisions.ts",
  "packages/platform-identity/src/footprint.ts",
  "docs/identity/PLATFORM_IDENTITY_PHASE_16A_EXISTING_FOOTPRINT.md",
  "docs/architecture/PLATFORM_ENTERPRISE_IDENTITY_ARCHITECTURE.md",
  "docs/architecture/PLATFORM_ENTERPRISE_SSO_OWNERSHIP_MATRIX.md",
  "docs/architecture/PLATFORM_IDENTITY_PHASE_16A.md",
  "docs/security/PLATFORM_ENTERPRISE_SSO_THREAT_MODEL.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_PROTOCOL_STRATEGY.md",
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_LIFECYCLE.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_TIER1_READINESS.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_GAP_REGISTER.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_IMPLEMENTATION_ROADMAP.md",
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_1_0_DRAFT.md",
  "docs/identity/PLATFORM_ENTERPRISE_SSO_UX_AND_COMMERCIAL.md",
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
