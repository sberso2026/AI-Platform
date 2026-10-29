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

const EEH = "packages/engineering-execution-host";
const CERT = "packages/engineering-execution-host-certification";
const EMI = "packages/engineering-model-interoperability";
const DT = "packages/digital-twin";
const VERSION = `${EEH}/src/version.ts`;
const EMI_VERSION = `${EMI}/src/version.ts`;
const DT_VERSION = `${DT}/src/version.ts`;
const GATES = `${CERT}/src/phase13d1/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13d1-certification.ts`;
const WORKFLOW =
  ".github/workflows/phase-13d1-controlled-engineering-execution-host.yml";
const BATCH_88 =
  "supabase/migrations/20260808270000_batch_88_engineering_execution_hosts.sql";
const BATCH_87 =
  "supabase/migrations/20260808260000_batch_87_engineering_model_interoperability_spacegass.sql";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";

describe("Phase 13D.1 Controlled Engineering Execution Host", () => {
  it("defines exactly 70 gates (A–BR)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(70);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BR");
    expect(new Set(ids).size).toBe(70);
  });

  it("declares execution-host version without bumping Digital Twin or interop 13C line", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_EXECUTION_HOST_VERSION\s*=\s*"0\.1\.0-execution-host"/,
    );
    expect(read(`${EEH}/package.json`)).toMatch(/"version": "0\.1\.0-execution-host"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.1\.0-execution-host"/);
    expect(read(EMI_VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.3\.0-spacegass"/,
    );
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
  });

  it("locks honesty flags", () => {
    const version = read(VERSION);
    expect(version).toMatch(/CONTROLLED_ENGINEERING_EXECUTION_HOST_READY = true/);
    expect(version).toMatch(/SILENT_SOLVER_FALLBACK_ALLOWED = false/);
    expect(version).toMatch(/SPACEGASS_LIVE_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SPACEGASSLiveExecutionCertified = false/);
    expect(version).toMatch(/ETABSAdapterImplemented = false/);
    expect(version).toMatch(/ETABSExecutionCertified = false/);
    expect(version).toMatch(/PHASE_13D_RE_CERTIFICATION_READY = true/);
    expect(version).toMatch(/RELEASE_ELIGIBLE = true/);
    expect(version).toMatch(/DIGITAL_TWIN_V1_INTACT = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.1\.0-execution-host"/);
  });

  it("ships batch_88, routes, docs, workflow, playwright; keeps 86/87", () => {
    for (const rel of [
      BATCH_88,
      BATCH_86,
      BATCH_87,
      "docs/operations/CONTROLLED_ENGINEERING_EXECUTION_HOST_RUNBOOK.md",
      "docs/operations/SPACEGASS_CONTROLLED_HOST_PROVISIONING.md",
      "docs/architecture/CONTROLLED_ENGINEERING_EXECUTION_HOST_CONTRACTS.md",
      "docs/architecture/ENGINEERING_EXECUTION_HOST_FUTURE_ETABS_INTEGRATION.md",
      "docs/contracts/ENGINEERING_EXECUTION_HOST_PUBLIC_CONTRACTS_DRAFT.md",
      "apps/web/src/app/api/engineering/execution-hosts/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/execution-hosts/page.tsx",
      `${CERT}/playwright/v1-execution-host.spec.ts`,
      WORKFLOW,
      RUNNER,
      GATES,
      `${EEH}/src/domain/spacegass-host-probe.ts`,
      `${EMI}/src/domain/spacegass/spacegass-live-health.ts`,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(BATCH_88)).toMatch(/engineering_execution_hosts/);
    expect(read(BATCH_88)).not.toMatch(/CREATE EXTENSION\s+postgis/i);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase13d1/);
    expect(
      read("apps/web/src/app/(platform)/engineering/apps/execution-hosts/page.tsx"),
    ).toMatch(/engineering-execution-host-ready/);
  });

  it("does not start Phase 13E and does not modify DT package for host foundation", () => {
    expect(present(`${EEH}/src/domain/phase13e`)).toBe(false);
    expect(present(`${DT}/src/domain/phase13d1`)).toBe(false);
    expect(present("packages/SPACEGASSExecutionFramework")).toBe(false);
    expect(read(`${EEH}/package.json`)).toMatch(
      /@rtb\/engineering-model-interoperability/,
    );
  });
});
