/**
 * Secret exposure scan for Engineering Review trees.
 * Never prints secret values. Fail closed on high-confidence committed secrets.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const TARGETS = [
  "packages/engineering-review",
  "packages/engineering-review-persistence",
  "apps/web/src/lib/review",
  "apps/web/src/app/(platform)/review",
  "apps/web/src/app/api/review",
  "apps/web/src/__tests__/engineering-review-mup.test.ts",
  "docs/engineering-review",
  "supabase/migrations/20260919120000_engineering_review_persistence.sql",
  "supabase/migrations/20260919133000_engineering_review_persist_functions.sql",
  "supabase/migrations/20260920040000_engineering_core_rls_workspace.sql",
  "supabase/migrations/20260920120000_engineering_review_security_schema_status.sql",
  ".github/workflows/engineering-review-unit.yml",
  ".github/workflows/engineering-review-hosted-rls.yml",
];

const SKIP_DIR = new Set(["node_modules", "dist", ".next", "coverage"]);

const PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "private_key", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "jwt", re: /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { name: "assigned_api_key", re: /(?:api[_-]?key|service_role)\s*[:=]\s*['"][A-Za-z0-9_\-]{24,}['"]/i },
];

const ALLOWLIST = [
  "packages/engineering-review-persistence/src/env.ts",
  "packages/engineering-review-persistence/scripts/secret-scan.ts",
  "packages/engineering-review-persistence/src/secret-scan.test.ts",
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (SKIP_DIR.has(entry)) return [];
      return walk(path);
    }
    if (!/\.(ts|tsx|js|mjs|md|yml|yaml|sql|json)$/i.test(entry)) return [];
    return [path];
  });
}

export function scanReviewSecrets(): { files: number; findings: string[] } {
  const files: string[] = [];
  for (const target of TARGETS) {
    const path = resolve(root, target);
    try {
      if (statSync(path).isDirectory()) files.push(...walk(path));
      else files.push(path);
    } catch {
      // optional path
    }
  }
  const findings: string[] = [];
  for (const file of files) {
    const rel = relative(root, file).replace(/\\/g, "/");
    if (ALLOWLIST.includes(rel)) continue;
    const text = readFileSync(file, "utf8");
    for (const pattern of PATTERNS) {
      if (pattern.re.test(text)) findings.push(`${rel}:${pattern.name}`);
    }
  }
  return { files: files.length, findings };
}

async function main() {
  const result = scanReviewSecrets();
  if (result.findings.length > 0) {
    for (const finding of result.findings) console.error(finding);
    process.exit(1);
  }
  console.log(JSON.stringify({ secret_scan: "PASS", files: result.files, findings: 0 }));
}

const isDirect = process.argv[1]?.includes("secret-scan");
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "scan failed");
    process.exit(1);
  });
}
