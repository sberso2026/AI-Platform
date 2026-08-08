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

const DT = "packages/digital-twin";
const CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase12c/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12c-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12c-digital-twin-state.yml";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const PROJECT_CONTROLS_V1_COMMIT = "b17fe4cfe2574520ec813a7b43ba7328a585d741";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";
const PHASE_12A_COMMIT = "2c5ed03f7de12cde9bfb71a9d430f5e342291303";
const PHASE_12B_COMMIT = "5e1bb22486a9fdd6385fb980daf0150a330eca9b";

describe("Phase 12C Digital Twin state", () => {
  it("defines exactly 51 gates (Aâ€“AY)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(51);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AY");
    expect(new Set(ids).size).toBe(51);
  });

  it("declares the state version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.3\.0-state"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "state"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12C"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.3\.0-state"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.3\.0-state"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12c/);
  });

  it("enables state capabilities while forbidding runtime", () => {
    const version = read(VERSION);
    for (const enabled of [
      /TWIN_STATE_READY = true/,
      /TWIN_VERSIONING_READY = true/,
      /REPRESENTATION_VERSIONING_READY = true/,
      /TWIN_SNAPSHOT_READY = true/,
      /TWIN_TIMELINE_READY = true/,
      /TWIN_IDENTITY_READY = true/,
      /HOSTED_PERSISTENCE_READY = true/,
      /PHASE_12D_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
      /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = false/,
      /LIVE_TELEMETRY_IMPLEMENTED = false/,
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.3\.0-state-draft"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATE_REVIEW_SLUG = "digital_twin\.state_review"/);
  });

  it("pins Phase 12A and 12B certified baselines", () => {
    const version = read(VERSION);
    expect(version).toContain(PHASE_12A_COMMIT);
    expect(version).toContain(PHASE_12B_COMMIT);
    expect(version).toMatch(/PHASE_12B_HOSTED_RUN = "31255221472"/);
    expect(version).toMatch(/PHASE_12B_VERSION = "0\.2\.0-core"/);
  });

  it("locks ownership for state slice", () => {
    const lock = read(OWNERSHIP_LOCK);
    expect(lock).toMatch(/digital_twin_state_must_be_implemented_in_phase_12c/);
    expect(lock).toMatch(/digital_twin_runtime_forbidden_in_phase_12c/);
    expect(lock).toMatch(/state_capabilities_not_ready/);
  });

  it("ships state domain modules", () => {
    for (const rel of [
      `${DT}/src/domain/state-engine.ts`,
      `${DT}/src/domain/representation-versioning.ts`,
      `${DT}/src/domain/snapshot.ts`,
      `${DT}/src/domain/timeline.ts`,
      `${DT}/src/domain/state-events.ts`,
      `${DT}/src/domain/public-contracts-state.ts`,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
  });

  it("includes batch_76 migration with state tables", () => {
    expect(present(BATCH_76)).toBe(true);
    const sql = read(BATCH_76);
    expect(sql).toMatch(/digital_twin_states/);
    expect(sql).toMatch(/digital_twin_state_versions/);
    expect(sql).toMatch(/digital_twin_snapshots/);
    expect(sql).not.toMatch(/telemetry_samples/);
  });

  it("does not modify batch_75 file path", () => {
    expect(present(BATCH_75)).toBe(true);
  });

  it("ships certification runner and workflow", () => {
    expect(present(RUNNER)).toBe(true);
    expect(present(WORKFLOW)).toBe(true);
    expect(read(WORKFLOW)).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(read(WORKFLOW)).toMatch(/certify:phase12c/);
  });

  it("ships state HTTP routes", () => {
    expect(present("apps/web/src/app/api/engineering/digital-twin/state/route.ts")).toBe(true);
    expect(present("apps/web/src/app/api/engineering/digital-twin/snapshot/route.ts")).toBe(true);
    expect(
      present("apps/web/src/app/api/engineering/digital-twin/representation-history/route.ts"),
    ).toBe(true);
  });

  it("keeps V1 tag commits referenced", () => {
    expect(read(VERSION)).toContain(PROJECT_CONTROLS_V1_COMMIT.slice(0, 8));
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT.slice(0, 8));
  });
});
