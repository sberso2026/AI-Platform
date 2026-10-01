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
  "docs/architecture/engineering-os/EOS_A10A_ENGINEERING_INFORMATION_INTELLIGENCE_FOUNDATION.md",
  "supabase/migrations/20260930130000_eos_a10a_engineering_information_intelligence.sql",
  "packages/engineering-os/src/information-intelligence",
  "apps/web/src/app/api/engineering/information",
  "apps/web/src/app/(platform)/engineering/information",
  "apps/web/src/app/(platform)/engineering/settings/information",
  "docs/architecture/engineering-os/EOS_A10B_ENGINEERING_WORK_CONTEXT_INFORMATION_FLOW.md",
  "supabase/migrations/20260930140000_eos_a10b_engineering_work_context.sql",
  "packages/engineering-os/src/work-context",
  "apps/web/src/app/api/engineering/work",
  "apps/web/src/app/(platform)/engineering/work",
  "apps/web/src/app/(platform)/engineering/settings/work-context",
  "docs/architecture/engineering-os/EOS_A10C_INFORMATION_REQUIREMENTS_EXCHANGE_HANDOVER.md",
  "supabase/migrations/20260930150000_eos_a10c_information_requirements_handover.sql",
  "packages/engineering-os/src/information-requirements",
  "apps/web/src/app/api/engineering/information-requirements",
  "apps/web/src/app/(platform)/engineering/information-requirements",
  "apps/web/src/app/(platform)/engineering/settings/information-requirements",
  "docs/architecture/engineering-os/EOS_A11A_ENGINEERING_WORK_GENERATOR.md",
  "supabase/migrations/20260930160000_eos_a11a_engineering_work_generator.sql",
  "packages/engineering-os/src/work-generator",
  "docs/architecture/engineering-os/EOS_A11B_ENGINEERING_ARTIFACT_AUTOMATION.md",
  "supabase/migrations/20260930170000_eos_a11b_engineering_artifact_automation.sql",
  "packages/engineering-os/src/artifact-automation",
  "docs/architecture/engineering-os/EOS_A11C_ENGINEERING_TOOL_ORCHESTRATION.md",
  "supabase/migrations/20260930180000_eos_a11c_engineering_tool_orchestration.sql",
  "packages/engineering-os/src/tool-orchestration",
  "docs/architecture/engineering-os/EOS_A11D_AUTOMATED_ENGINEERING_REVIEW_PRE_ISSUE.md",
  "supabase/migrations/20260930190000_eos_a11d_pre_issue_engineering_review.sql",
  "packages/engineering-os/src/pre-issue-review",
  "docs/architecture/engineering-os/EOS_A11E_CHANGE_IMPACT_OPTION_CONSTRUCTION_WORKBENCH.md",
  "supabase/migrations/20260930200000_eos_a11e_change_impact_option_construction.sql",
  "packages/engineering-os/src/change-workbench",
  "docs/architecture/engineering-os/EOS_A12A_UNIFIED_ENGINEERING_WORKBENCH.md",
  "supabase/migrations/20261001000000_eos_a12a_artifact_template_governance.sql",
  "packages/engineering-os/src/workbench",
  "apps/web/src/app/(platform)/engineering/settings/templates",
  "apps/web/src/__tests__/eos-a12a-workbench.test.ts",
  "docs/architecture/engineering-os/EOS_A12B_MY_ENGINEERING_DAY_TEAM_COORDINATION_NOTIFICATIONS.md",
  "supabase/migrations/20261001120000_eos_a12b_engineering_attention.sql",
  "packages/engineering-os/src/attention",
  "apps/web/src/__tests__/eos-a12b-workbench.test.ts",
  "docs/architecture/engineering-os/EOS_A13A_ENTERPRISE_CONNECTOR_MICROSOFT_365_SHAREPOINT.md",
  "supabase/migrations/20261001180000_eos_a13a_m365_sharepoint_connector.sql",
  "packages/engineering-os/src/connectors/m365",
  "docs/architecture/engineering-os/EOS_A13B_ENGINEERING_EDMS_CONSTRUCTION_CONNECTORS.md",
  "supabase/migrations/20261001190000_eos_a13b_engineering_edms_construction_connectors.sql",
  "packages/engineering-os/src/connectors/engineering",
  "apps/web/src/app/(platform)/engineering/settings/integrations",
  "docs/architecture/engineering-os/EOS_A13C_PLATFORM_CONSOLIDATION_BINARY_STORAGE_PREPARATION.md",
  "docs/architecture/engineering-os/EOS_ARTIFACT_BINARY_STORAGE_MIGRATION_RUNBOOK.md",
  "supabase/migrations/20261001200000_eos_a13c_platform_consolidation_binary_storage.sql",
  "packages/engineering-os/src/connectors/core",
  "docs/architecture/engineering-os/EOS_A14A_SECURITY_PRIVACY_STORAGE_PILOT_READINESS.md",
  "docs/architecture/engineering-os/EOS_CONTROLLED_PILOT_RUNBOOK.md",
  "supabase/migrations/20261001210000_eos_a14a_artifact_object_storage.sql",
  "packages/engineering-os/src/pilot/a14a-profile.ts",
  "packages/engineering-os/src/pilot/a14b-reliability.ts",
  "docs/architecture/engineering-os/EOS_A14B_RELIABILITY_PERFORMANCE_RECOVERY_PILOT_OPERATIONS.md",
  "docs/architecture/engineering-os/EOS_DISASTER_RECOVERY_RUNBOOK.md",
  "packages/engineering-os/src/pilot/a15a-demonstrator.ts",
  "packages/engineering-os/src/pilot/eos-a15a-demonstrator.test.ts",
  "docs/architecture/engineering-os/EOS_A15A_END_TO_END_ENGINEERING_DEMONSTRATOR.md",
  "docs/architecture/engineering-os/EOS_A15A_DEMONSTRATOR_EVIDENCE.md",
  "docs/architecture/engineering-os/EOS_A15A_DEMONSTRATION_RUNBOOK.md",
  "docs/architecture/engineering-os/EOS_A15A_ENGINEERING_VALUE_EVIDENCE.md",
  "docs/architecture/engineering-os/EOS_PILOT_GATE_CLOSEOUT.md",
  "docs/architecture/engineering-os/EOS_PILOT_GATE_CLOSEOUT_DEPENDENCY.md",
  "docs/architecture/engineering-os/EOS_CONTROLLED_PILOT_RUNBOOK.md",
  "packages/engineering-os-certification/scripts/run-dependency-sca.ts",
  "packages/engineering-os/src/lifecycle-intelligence/cross-lifecycle-value.ts",
  "packages/engineering-os/src/lifecycle-intelligence/cross-lifecycle-value.test.ts",
  "docs/architecture/engineering-os/EOS_A15A_V1_COST_CONSTRUCTABILITY_CARBON.md",
  "packages/engineering-os/src/attention/service.ts",
  "packages/engineering-os/src/attention/authorized-project-action.test.ts",
  "packages/engineering-os/src/commerce/service-guard.test.ts",
  "apps/web/src/app/api/engineering/work/route.ts",
  "apps/web/src/__tests__/eos-assess-change-auth.test.ts",
  "packages/engineering-os/src/change-workbench/work-plan-scope.ts",
  "packages/engineering-os/src/change-workbench/assess-change-authorization.test.ts",
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
