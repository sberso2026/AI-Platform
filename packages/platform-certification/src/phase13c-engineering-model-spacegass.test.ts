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
const GATES = `${CERT}/src/phase13c/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13c-certification.ts`;
const WORKFLOW = ".github/workflows/phase-13c-engineering-model-spacegass.yml";
const BATCH_87 =
  "supabase/migrations/20260808260000_batch_87_engineering_model_interoperability_spacegass.sql";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";

/** Phase 13C public contract version pin: 0.3.0-spacegass */
describe("Phase 13C Engineering Model SPACE GASS", () => {
  it("defines exactly 75 gates (A–BW)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(75);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BW");
    expect(new Set(ids).size).toBe(75);
  });

  it("declares spacegass version without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.3\.0-spacegass"/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/"version": "0\.3\.0-spacegass"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.3\.0-spacegass"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
  });

  it("locks SPACE GASS flags honestly", () => {
    const version = read(VERSION);
    expect(version).toMatch(/SPACEGASS_FEDERATION_READY = true/);
    expect(version).toMatch(/SPACEGASS_SOLVER_ADAPTER_READY = true/);
    expect(version).toMatch(/SPACE_GASS_HOSTED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SILENT_SOLVER_FALLBACK_ALLOWED = false/);
    expect(version).toMatch(/ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED = true/);
    expect(version).toMatch(/SOLVER_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED = true/);
    expect(version).toMatch(/NATIVE_ETABS_ADAPTER_IMPLEMENTED = false/);
    expect(version).toMatch(/ETABSAdapterImplemented = false/);
    expect(version).toMatch(/ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/);
    expect(version).toMatch(/MODEL_MUTATION_IMPLEMENTED = false/);
    expect(version).toMatch(/IFC_FEDERATION_READY = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.3\.0-spacegass"/);
    expect(version).toMatch(
      /PHASE_13B_CERTIFIED_COMMIT =\s*"1540f806ada0cf70179c3cfdffe4157f29620778"/,
    );
    expect(version).toMatch(
      /DIGITAL_TWIN_V1_COMMIT =\s*"a94425ed009ca087c2f44c9d3757c0c82bd936b1"/,
    );
  });

  it("ships batch_87, routes, docs, workflow, playwright; keeps batch_86", () => {
    for (const rel of [
      BATCH_87,
      BATCH_86,
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13C.md",
      "docs/architecture/ENGINEERING_INTEROPERABILITY_SPACEGASS_IMPLEMENTATION_RECONCILIATION.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SPACEGASS_IMPLEMENTATION.md",
      "apps/web/src/app/api/engineering/model-interoperability/spacegass/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      `${CERT}/playwright/v1-spacegass.spec.ts`,
      WORKFLOW,
      RUNNER,
      GATES,
      `${EMI}/src/domain/spacegass/spacegass-solver-adapter.ts`,
      `${EMI}/fixtures/spacegass/sample-project.spacegass.json`,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(BATCH_87)).toMatch(/qualification_id text PRIMARY KEY/);
    expect(read(BATCH_87)).not.toMatch(/CREATE EXTENSION\s+postgis/i);
    expect(read(BATCH_86)).toMatch(/model_ref_id text PRIMARY KEY/);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase13c/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-spacegass-ready/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-ifc-federation-ready/);
  });

  it("does not start Phase 13D and does not modify DT package sources for SPACE GASS", () => {
    expect(present(`${EMI}/src/domain/phase13d`)).toBe(false);
    expect(present(`${DT}/src/domain/phase13c`)).toBe(false);
    expect(present("packages/SPACEGASSExecutionFramework")).toBe(false);
    expect(read(`${EMI}/src/domain/spacegass/spacegass-solver-adapter.ts`)).toMatch(
      /EngineeringSolverAdapter/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/@rtb\/digital-twin/);
  });
});
