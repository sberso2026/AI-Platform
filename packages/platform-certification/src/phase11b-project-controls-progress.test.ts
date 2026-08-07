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
const SPD = "packages/engineering-shared-project-domain";
const CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase11b/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase11b-certification.ts`;
const WORKFLOW = ".github/workflows/phase-11b-project-controls-progress.yml";

const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";
const PHASE_11A_COMMIT = "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700";

describe("Phase 11B Project Controls progress intelligence", () => {
  it("defines exactly 45 gates (A–AS)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(45);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AS");
    expect(new Set(ids).size).toBe(45);
    expect(read(GATES)).toMatch(/PHASE_11B_GATE_COUNT = 45|PHASE_11B_GATE_COUNT = PHASE_11B/);
  });

  it("declares the progress intelligence version and Phase 11A baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.2\.0-progress-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "progress_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11B"/);
    expect(version).toMatch(new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_COMMIT}"`));
    expect(version).toMatch(/PHASE_11A_HOSTED_RUN = "31179910364"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.2\.0-progress-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.2\.0-progress-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11b/);
  });

  it("locks shared project domain ownership and keeps product GA closed", () => {
    const version = read(VERSION);
    expect(version).toMatch(
      /CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\s*\r?\n?\s*"engineering_os_shared_project_domain"/,
    );
    expect(version).toMatch(/PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain"/);
    expect(version).toMatch(/SHARED_PROJECT_DOMAIN_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_ENGINE_READY = true/);
    expect(version).toMatch(/PROGRESS_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
    expect(version).toMatch(/PROJECT_CONTROLS_IMPLEMENTED = false/);
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/EARNED_VALUE_IMPLEMENTED = false/);
    expect(version).toMatch(/CPM_SCHEDULING_IMPLEMENTED = false/);
    expect(version).toMatch(/PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false/);
    expect(version).toMatch(/PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY = true/);
    expect(read(OWNERSHIP_LOCK)).toMatch(/assertOwnershipLock/);
  });

  it("ships the shared project domain package and progress domain surface", () => {
    expect(present(`${SPD}/package.json`)).toBe(true);
    expect(present(`${SPD}/src/version.ts`)).toBe(true);
    expect(present(`${SPD}/src/references.ts`)).toBe(true);
    expect(present(`${SPD}/src/project-reference-port.ts`)).toBe(true);
    expect(read(`${SPD}/src/version.ts`)).toMatch(
      /CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\s*\r?\n?\s*"engineering_os_shared_project_domain"/,
    );
    for (const file of [
      "reserved-providers.ts",
      "progress.ts",
      "progress-confidence.ts",
      "progress-engine.ts",
      "project-context-engine.ts",
      "review-workflow.ts",
      "events.ts",
      "persistence.ts",
      "postgres-repository.ts",
      "engine.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
  });

  it("adds additive hosted migrations for identity refs and progress persistence", () => {
    expect(
      present("supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql"),
    ).toBe(true);
    expect(
      present("supabase/migrations/20260808020000_batch_62_project_controls_progress.sql"),
    ).toBe(true);
    const batch62 = read(
      "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql",
    );
    expect(batch62).toMatch(/project_controls_progress_assessments/);
    expect(batch62).toMatch(/project_controls_project_profiles/);
    expect(batch62).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(batch62).toMatch(/pc_progress_no_earned_value/);
    expect(batch62).toMatch(/REFERENCES engineering_projects\(id\)/);
  });

  it("exposes nested-error HTTP routes with governance flags closed", () => {
    const progress = read("apps/web/src/app/api/engineering/project-controls/progress/route.ts");
    const profile = read("apps/web/src/app/api/engineering/project-controls/profile/route.ts");
    expect(progress).toMatch(/earnedValueImplemented:\s*false/);
    expect(progress).toMatch(/cpmImplemented:\s*false/);
    expect(progress).toMatch(/productionProjectControlsReady:\s*false/);
    expect(progress).toMatch(/error:\s*\{\s*code/);
    expect(profile).toMatch(/projectContextEngineReady:\s*true/);
    expect(profile).toMatch(/error:\s*\{\s*code/);
  });

  it("keeps Asset Intelligence V1 commit pinned and certification harness present", () => {
    expect(read(VERSION)).toMatch(
      new RegExp(`ASSET_INTELLIGENCE_V1_COMMIT =\\s*\\r?\\n?\\s*"${ASSET_INTELLIGENCE_V1_COMMIT}"`),
    );
    expect(present(RUNNER)).toBe(true);
    expect(present(WORKFLOW)).toBe(true);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/certify:phase11b/);
    expect(read(GATES)).toMatch(new RegExp(`"${ASSET_INTELLIGENCE_V1_COMMIT}"`));
  });
});
