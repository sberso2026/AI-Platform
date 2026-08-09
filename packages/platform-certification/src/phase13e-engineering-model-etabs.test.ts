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

const EMI = "packages/engineering-model-interoperability";
const CERT = "packages/engineering-model-interoperability-certification";
const DT = "packages/digital-twin";
const VERSION = `${EMI}/src/version.ts`;
const DT_VERSION = `${DT}/src/version.ts`;
const GATES = `${CERT}/src/phase13e/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13e-certification.ts`;
const WORKFLOW = ".github/workflows/phase-13e-engineering-model-etabs.yml";
const BATCH_89 =
  "supabase/migrations/20260808280000_batch_89_engineering_model_interoperability_etabs.sql";
const BATCH_88 =
  "supabase/migrations/20260808270000_batch_88_engineering_execution_hosts.sql";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";

/** Phase 13E public contract version pin: 0.4.0-etabs-federation */
describe("Phase 13E Engineering Model ETABS", () => {
  it("defines exactly 72 gates (A–BT)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(72);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BT");
    expect(new Set(ids).size).toBe(72);
  });

  it("declares etabs-federation version without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.4\.0-etabs-federation"/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(
      /"version": "0\.4\.0-etabs-federation"/,
    );
    expect(read(`${CERT}/package.json`)).toMatch(
      /"version": "0\.4\.0-etabs-federation"/,
    );
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
  });

  it("locks ETABS flags honestly", () => {
    const version = read(VERSION);
    expect(version).toMatch(/ETABS_MODEL_FEDERATION_READY = true/);
    expect(version).toMatch(/ETABS_RESULT_FEDERATION_READY = true/);
    expect(version).toMatch(/ETABSAdapterImplemented = true/);
    expect(version).toMatch(/ETABS_SOLVER_ADAPTER_READY = true/);
    expect(version).toMatch(/ETABS_HOSTED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/ETABS_CONTROLLED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SPACEGASS_LIVE_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SPACE_GASS_HOSTED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SILENT_SOLVER_FALLBACK_ALLOWED = false/);
    expect(version).toMatch(/ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/);
    expect(version).toMatch(/SAP2000_ADAPTER_IMPLEMENTED = false/);
    expect(version).toMatch(/SAFE_ADAPTER_IMPLEMENTED = false/);
    expect(version).toMatch(/CSIBRIDGE_ADAPTER_IMPLEMENTED = false/);
    expect(version).toMatch(/IFC_FEDERATION_READY = true/);
    expect(version).toMatch(/SPACEGASS_FEDERATION_READY = true/);
    expect(version).toMatch(/CONTROLLED_ENGINEERING_EXECUTION_HOST_READY = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.4\.0-etabs-federation"/);
    expect(version).toMatch(
      /PHASE_13C_CERTIFIED_COMMIT =\s*"a1c73721326927b507bb7c2f456d6188dd00e8b9"/,
    );
    expect(version).toMatch(
      /PHASE_13D1_CERTIFIED_COMMIT =\s*"0bbe0c7bc686615231167f9d56cad2481c627026"/,
    );
    expect(version).toMatch(
      /DIGITAL_TWIN_V1_COMMIT =\s*"a94425ed009ca087c2f44c9d3757c0c82bd936b1"/,
    );
    expect(version).toMatch(/PHASE_13F_READY = true/);
  });

  it("ships batch_89, routes, docs, workflow, playwright; keeps prior batches", () => {
    for (const rel of [
      BATCH_89,
      BATCH_88,
      BATCH_86,
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13E.md",
      "docs/architecture/ENGINEERING_INTEROPERABILITY_ETABS_IMPLEMENTATION_RECONCILIATION.md",
      "apps/web/src/app/api/engineering/model-interoperability/etabs/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      `${CERT}/playwright/v1-etabs.spec.ts`,
      WORKFLOW,
      RUNNER,
      GATES,
      `${EMI}/src/domain/etabs/etabs-solver-adapter.ts`,
      `${EMI}/fixtures/etabs/sample-project.etabs.json`,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(BATCH_89)).toMatch(/qualification_id text PRIMARY KEY/);
    expect(read(BATCH_89)).not.toMatch(/CREATE EXTENSION\s+postgis/i);
    expect(read(BATCH_86)).toMatch(/model_ref_id text PRIMARY KEY/);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase13e/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-etabs-ready/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-ifc-federation-ready/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-spacegass-ready/);
  });

  it("does not start Phase 13F and does not modify DT package for ETABS", () => {
    expect(present(`${EMI}/src/domain/phase13f`)).toBe(false);
    expect(present(`${DT}/src/domain/phase13e`)).toBe(false);
    expect(present("packages/ETABSExecutionFramework")).toBe(false);
    expect(read(`${EMI}/src/domain/etabs/etabs-solver-adapter.ts`)).toMatch(
      /EngineeringSolverAdapter/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/@rtb\/digital-twin/);
    expect(read(`${EMI}/package.json`)).toMatch(
      /@rtb\/engineering-execution-host/,
    );
  });
});
