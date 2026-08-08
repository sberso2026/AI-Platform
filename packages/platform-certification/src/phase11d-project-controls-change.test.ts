import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function present(rel: string): boolean {
  return existsSync(resolve(root, rel));
}

const PC = "packages/project-controls";
const CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase11d/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase11d-certification.ts`;
const WORKFLOW = ".github/workflows/phase-11d-project-controls-change.yml";
const BATCH_64 =
  "supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql";

const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";
const PHASE_11C_COMMIT = "e9b137902d8fe749a6ce62bc0903ab9410320e77";

describe("Phase 11D Project Controls change intelligence", () => {
  it("defines exactly 49 gates (A–AW)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(49);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AW");
    expect(new Set(ids).size).toBe(49);
  });

  it("declares the change intelligence version and Phase 11C baseline while module advances to 11E", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.5\.0-cost-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "cost_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11E"/);
    expect(version).toMatch(/PHASE_11D_VERSION = "0\.4\.0-change-intelligence"/);
    expect(version).toMatch(
      new RegExp(`PHASE_11D_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"3a27fde6bb15fd6298feafca121438dddb2087af"`),
    );
    expect(version).toMatch(/PHASE_11D_HOSTED_RUN = "31231309349"/);
    expect(version).toMatch(
      new RegExp(`PHASE_11C_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11C_COMMIT}"`),
    );
    expect(version).toMatch(/PHASE_11C_HOSTED_RUN = "31189507016"/);
    expect(version).toMatch(/PHASE_11C_VERSION = "0\.3\.0-schedule-intelligence"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.5\.0-cost-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.5\.0-cost-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11d/);
  });

  it("locks change intelligence ready while contractual authority stays forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/CHANGE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/CHANGE_CONFIDENCE_ENGINE_READY = true/);
    expect(version).toMatch(/CHANGE_REVIEW_WORKFLOW_READY = true/);
    expect(version).toMatch(/CHANGE_PERSISTENCE_READY = true/);
    expect(version).toMatch(/CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY = true/);
    expect(version).toMatch(/PROJECT_TIMELINE_READY = true/);
    expect(version).toMatch(/PROJECT_SNAPSHOT_READY = true/);
    expect(version).toMatch(/CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY = false/);
    expect(version).toMatch(/CHANGE_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/FINANCIAL_POSTING_IMPLEMENTED = false/);
    expect(version).toMatch(/AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED = false/);
    expect(version).toMatch(/CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false/);
    expect(version).toMatch(/AI_MAY_PUBLISH_CHANGE_FORBIDDEN = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
  });

  it("keeps progress and schedule intelligence intact", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROGRESS_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROGRESS_INTELLIGENCE_11B_INTACT = true/);
    expect(version).toMatch(/SCHEDULE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/CPM_SCHEDULING_IMPLEMENTED = false/);
    expect(version).toMatch(/FLOAT_COMPUTATION_IMPLEMENTED = false/);
    expect(version).toMatch(/EARNED_VALUE_IMPLEMENTED = false/);
    expect(present("supabase/migrations/20260808020000_batch_62_project_controls_progress.sql")).toBe(
      true,
    );
    expect(present("supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql")).toBe(
      true,
    );
  });

  it("moves financial ledger ownership out of platform commerce", () => {
    const version = read(VERSION);
    const lock = read(OWNERSHIP_LOCK);
    expect(version).toMatch(
      /FINANCIAL_LEDGER_OWNERSHIP =\s*\r?\n?\s*"external_finance_or_future_finance_domain"/,
    );
    expect(version).toMatch(/CHANGE_INTELLIGENCE_OWNERSHIP = "project_controls"/);
    expect(version).toMatch(
      /CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP =\s*\r?\n?\s*"reserved_not_project_controls"/,
    );
    expect(lock).toMatch(/change_controls_intelligence/);
    expect(lock).toMatch(/contractual_change_authority/);
    expect(lock).toMatch(/external_finance_or_future_finance_domain/);
    expect(lock).toMatch(/CHANGE_INTELLIGENCE_READY/);
  });

  it("ships change domain surface and batch 64 migration", () => {
    for (const file of [
      "change.ts",
      "change-confidence.ts",
      "change-engine.ts",
      "baseline-provider.ts",
      "engine.ts",
      "services.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_64)).toBe(true);
    const batch64 = read(BATCH_64);
    for (const table of [
      "project_controls_change_states",
      "project_controls_change_evidence",
      "project_controls_change_reviews",
      "project_controls_change_confidence",
      "project_controls_change_candidates",
      "project_controls_project_snapshots",
      "project_controls_project_timeline",
    ]) {
      expect(batch64, table).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
    }
    expect(batch64).toMatch(/pc_change_no_earned_value/);
    expect(batch64).toMatch(/pc_change_no_cpm/);
    expect(batch64).toMatch(/pc_change_no_financial_posting/);
    expect(batch64).toMatch(/pc_change_no_budget_mutation/);
    expect(batch64).toMatch(/pc_change_no_contractual_approval/);
    expect(batch64).toMatch(/pc_change_no_core_risk_mutation/);
    expect(batch64).toMatch(/pc_change_advisory_only/);
    expect(batch64).toMatch(/pc_change_candidate_is_not_approved/);
    expect(batch64).toMatch(/engineering\.project\.change\.assessed/);
    expect(batch64).toMatch(/engineering\.project\.snapshot\.created/);
    expect(batch64).toMatch(/change_summary/);
    expect(batch64).toMatch(/REFERENCES engineering_projects\(id\)/);
    expect(batch64).toMatch(/ENABLE ROW LEVEL SECURITY/);
  });

  it("exposes change and snapshot HTTP routes and three active contributors", () => {
    const change = read("apps/web/src/app/api/engineering/project-controls/change/route.ts");
    const snapshot = read("apps/web/src/app/api/engineering/project-controls/snapshot/route.ts");
    const profile = read("apps/web/src/app/api/engineering/project-controls/profile/route.ts");
    expect(change).toMatch(/changeIntelligenceReady:\s*true/);
    expect(change).toMatch(/contractualAuthority:\s*false/);
    expect(change).toMatch(/costEngineImplemented:\s*false/);
    expect(change).toMatch(/financialPostingImplemented:\s*false/);
    expect(change).toMatch(/earnedValueImplemented:\s*false/);
    expect(change).toMatch(/error:\s*\{\s*code/);
    expect(snapshot).toMatch(/projectSnapshotReady:\s*true/);
    expect(snapshot).toMatch(/projectTimelineReady:\s*true/);
    expect(profile).toMatch(/changeIntelligenceReady:\s*true/);
    expect(profile).toMatch(/progress_intelligence/);
    expect(profile).toMatch(/schedule_intelligence/);
    expect(profile).toMatch(/change_intelligence/);
    expect(profile).toMatch(/external_finance_or_future_finance_domain/);
  });

  it("documents the change model and the authority boundary", () => {
    const model = "docs/architecture/PROJECT_CONTROLS_CHANGE_MODEL.md";
    const authority = "docs/architecture/PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md";
    const engine = "docs/architecture/PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md";
    expect(present(model)).toBe(true);
    expect(present(authority)).toBe(true);
    expect(present(engine)).toBe(true);
    expect(read(model)).toMatch(/Change Signal/);
    expect(read(model)).toMatch(/Change Candidate/);
    expect(read(model)).toMatch(/Change Reference/);
    expect(read(model)).toMatch(/Change Assessment/);
    expect(read(model)).toMatch(/Change Impact/);
    expect(read(model)).toMatch(/candidate is not an approved change/i);
    expect(read(authority)).toMatch(/does not approve change/i);
    expect(read(authority)).toMatch(/engineering_core/);
    expect(read(authority)).toMatch(/Business OS/);
    expect(read("docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md")).toMatch(
      /external_finance_or_future_finance_domain/,
    );
    expect(read("docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md")).toMatch(
      /contractual_change_authority/,
    );
  });

  it("keeps certification harness present", () => {
    expect(present(RUNNER)).toBe(true);
    expect(present(WORKFLOW)).toBe(true);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/certify:phase11d/);
    expect(read(GATES)).toMatch(new RegExp(`"${ASSET_INTELLIGENCE_V1_COMMIT}"`));
    expect(present(`${PC}/tests/phase11d-change-intelligence.test.ts`)).toBe(true);
  });
});
