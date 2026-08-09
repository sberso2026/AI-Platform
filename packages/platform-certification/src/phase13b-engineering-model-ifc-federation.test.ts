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
const GATES = `${CERT}/src/phase13b/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13b-certification.ts`;
const WORKFLOW = ".github/workflows/phase-13b-engineering-model-ifc-federation.yml";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";

describe("Phase 13B Engineering Model IFC Federation", () => {
  it("defines exactly 72 gates (A–BT)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(72);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BT");
    expect(new Set(ids).size).toBe(72);
  });

  it("declares ifc-federation version without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.2\.0-ifc-federation"/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/"version": "0\.2\.0-ifc-federation"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.2\.0-ifc-federation"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
  });

  it("locks runtime IFC flags honestly", () => {
    const version = read(VERSION);
    expect(version).toMatch(/ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY = true/);
    expect(version).toMatch(/IFC_FEDERATION_READY = true/);
    expect(version).toMatch(/PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = true/);
    expect(version).toMatch(/SOLVER_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/MODEL_MUTATION_IMPLEMENTED = false/);
    expect(version).toMatch(/FULL_BIM_VIEWER_IMPLEMENTED = false/);
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/PHASE_13C_READY = true/);
    expect(version).toMatch(
      /PHASE_13A_CERTIFIED_COMMIT =\s*"5d238f24a3c61b95011c6c2a0ab2f1bf81540267"/,
    );
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.2\.0-ifc-federation"/);
    expect(version).toMatch(
      /DIGITAL_TWIN_V1_COMMIT =\s*"a94425ed009ca087c2f44c9d3757c0c82bd936b1"/,
    );
  });

  it("ships batch_86, HTTP routes, docs, workflow, and playwright", () => {
    for (const rel of [
      BATCH_86,
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13B.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_OWNERSHIP_MATRIX.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md",
      "docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md",
      "apps/web/src/app/api/engineering/model-interoperability/models/route.ts",
      "apps/web/src/app/api/engineering/model-interoperability/mappings/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      `${CERT}/playwright/v1-ifc-federation.spec.ts`,
      WORKFLOW,
      RUNNER,
      GATES,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(BATCH_86)).toMatch(/model_ref_id text PRIMARY KEY/);
    expect(read(BATCH_86)).not.toMatch(/CREATE EXTENSION\s+postgis/i);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/PNPM_VERSION: "9\.15\.0"/);
    expect(read(WORKFLOW)).toMatch(/CERTIFY_BROWSER/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase13b/);
  });

  it("does not start Phase 13C and keeps native adapters unimplemented", () => {
    expect(present(`${EMI}/src/domain/phase13c`)).toBe(false);
    expect(present(`${DT}/src/domain/phase13b`)).toBe(false);
    expect(present("packages/engineering-model-interoperability-runtime")).toBe(
      false,
    );
    const version = read(VERSION);
    expect(version).toMatch(/NATIVE_ETABS_ADAPTER_IMPLEMENTED = false/);
    expect(version).toMatch(/NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED = false/);
    expect(read(`${EMI}/src/discovery/provider-matrix.ts`)).toMatch(
      /productionAdapterImplemented: true/,
    );
  });
});
