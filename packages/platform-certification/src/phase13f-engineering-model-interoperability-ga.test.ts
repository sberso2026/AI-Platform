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
const GATES = `${CERT}/src/phase13f/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13f-certification.ts`;
const WORKFLOW =
  ".github/workflows/phase-13f-engineering-model-interoperability-ga.yml";

describe("Phase 13F Engineering Model Interoperability V1.0 GA", () => {
  it("defines exactly 72 gates (A–BT)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map(
      (m) => m[1],
    );
    expect(ids.length).toBe(72);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BT");
    expect(new Set(ids).size).toBe(72);
  });

  it("declares 1.0.0 GA without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"1\.0\.0"/,
    );
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_STATUS\s*=\s*"ga"/,
    );
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_PHASE\s*=\s*"13F"/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
  });

  it("locks GA honesty flags", () => {
    const version = read(VERSION);
    expect(version).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED = true/,
    );
    expect(version).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN = true/,
    );
    expect(version).toMatch(/PHASE_13D_STATUS = "blocked_external_dependency"/);
    expect(version).toMatch(/SPACEGASS_LIVE_PROVIDER_READY = false/);
    expect(version).toMatch(/SPACEGASS_LIVE_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/ETABS_HOSTED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/ETABS_CONTROLLED_EXECUTION_CERTIFIED = false/);
    expect(version).toMatch(/SILENT_SOLVER_FALLBACK_ALLOWED = false/);
    expect(version).toMatch(/ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/);
    expect(version).toMatch(/AUTOMATIC_MAPPING_APPROVAL_ENABLED = false/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "1\.0\.0"/);
    expect(version).toMatch(
      /PHASE_13E_CERTIFIED_COMMIT =\s*"0d01d970b444f878b63cc655a283279cf0683123"/,
    );
    expect(version).toMatch(
      /DIGITAL_TWIN_V1_COMMIT =\s*"a94425ed009ca087c2f44c9d3757c0c82bd936b1"/,
    );
  });

  it("ships GA docs, workflow, playwright, manifest, entitlements; keeps DT untouched", () => {
    for (const rel of [
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_V1_PUBLIC_CONTRACTS.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_V1_CAPABILITY_MATRIX.md",
      "docs/commercial/ENGINEERING_MODEL_INTEROPERABILITY_V1_PACKAGING.md",
      "docs/operations/ENGINEERING_MODEL_INTEROPERABILITY_V1_OPERATIONS.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13F.md",
      `${EMI}/manifest/engineering-model-interoperability-module-manifest.json`,
      `${CERT}/playwright/v1-ga.spec.ts`,
      WORKFLOW,
      RUNNER,
      GATES,
      "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      "apps/web/src/app/(platform)/engineering/apps/model-interoperability/layout.tsx",
      "packages/platform-commerce/src/domain/commerce-access-policy.ts",
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase13f/);
    expect(
      read(
        "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
      ),
    ).toMatch(/engineering-model-interoperability-v1-ready/);
    expect(
      read("packages/platform-commerce/src/domain/commerce-access-policy.ts"),
    ).toMatch(/\/engineering\/apps\/model-interoperability/);
    expect(present(`${DT}/src/domain/phase13f`)).toBe(false);
  });
});
