import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABSControlledExecutionCertified,
  ETABSHostedExecutionCertified,
  PUBLIC_CONTRACT_VERSION,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SPACEGASSLiveExecutionCertified,
  SPACEGASSLiveProviderReady,
  spaceGassControlledExecutionCertified,
  spaceGassHostedExecutionCertified,
} from "../src/index";

const repoRoot = resolve(__dirname, "../../..");
const architectureDoc = resolve(
  repoRoot,
  "docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md",
);
const adrDoc = resolve(
  repoRoot,
  "docs/architecture/adr/ADR_CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION.md",
);

const INTEROP_V1_COMMIT = "4e55f32f8b5727ae900915b20492bbdf1d60f6b9";
const INTEROP_V1_TAG = "engineering-model-interoperability-v1.0.0";

const FROZEN_SURFACES = [
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_V1_PUBLIC_CONTRACTS.md",
  "packages/engineering-model-interoperability/manifest/engineering-model-interoperability-module-manifest.json",
  "packages/engineering-model-interoperability/src/version.ts",
  "packages/engineering-model-interoperability/src/contracts/draft-contracts.ts",
  "packages/digital-twin/package.json",
  "packages/engineering-execution-host/package.json",
] as const;

function git(cmd: string): string {
  return execSync(cmd, { cwd: repoRoot, encoding: "utf8" }).trim();
}

describe("Post-GA client-owned commercial solver architecture policy", () => {
  it("documents federation vs open vs client-controlled commercial execution", () => {
    expect(existsSync(architectureDoc)).toBe(true);
    expect(existsSync(adrDoc)).toBe(true);

    const body = readFileSync(architectureDoc, "utf8");
    const adr = readFileSync(adrDoc, "utf8");

    for (const required of [
      "Federation without execution",
      "RTB-certified open execution",
      "Client-controlled commercial execution",
      "clientLicensedSolverExecutionArchitectureSupported = true",
      "commercialSolverLicenseOwnedByRTBRequired = false",
      "clientRetainsCommercialSolverLicenseOwnership = true",
      "commercialSolverExecutionRequiresExplicitAuthorization = true",
      "commercialSolverExecutionRequiresFourLayerQualification = true",
      "federationRequiresSolverExecution = false",
      "silentSolverFallbackAllowed = false",
      "licenseBypassAllowed = false",
      "automaticEngineeringApprovalEnabled = false",
      "ETABSControlledExecutionCertified",
      "spaceGassControlledExecutionCertified",
      "Controlled Engineering Execution Host",
      "Four-layer qualification",
    ]) {
      expect(body.includes(required), `missing: ${required}`).toBe(true);
    }

    expect(adr.includes("Client-Owned Commercial Solver Execution")).toBe(true);
    expect(adr.includes("federationRequiresSolverExecution = false")).toBe(true);
    expect(adr.includes("commercialSolverLicenseOwnedByRTBRequired = false")).toBe(
      true,
    );
  });

  it("keeps Interoperability V1 tag and frozen surfaces unchanged", () => {
    expect(git(`git rev-list -n 1 ${INTEROP_V1_TAG}`)).toBe(INTEROP_V1_COMMIT);

    for (const path of FROZEN_SURFACES) {
      const diff = git(`git diff ${INTEROP_V1_COMMIT} -- ${path}`);
      expect(diff, `frozen surface drifted: ${path}`).toBe("");
    }
  });

  it("preserves truthful V1 execution and no-fallback flags", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe("1.0.0");
    expect(ENGINEERING_MODEL_INTEROPERABILITY_STATUS).toBe("ga");
    expect(PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
    expect(ETABSControlledExecutionCertified).toBe(false);
    expect(ETABSHostedExecutionCertified).toBe(false);
    expect(spaceGassControlledExecutionCertified).toBe(false);
    expect(spaceGassHostedExecutionCertified).toBe(false);
    expect(SPACEGASSLiveProviderReady).toBe(false);
    expect(SPACEGASSLiveExecutionCertified).toBe(false);
    expect(SILENT_SOLVER_FALLBACK_ALLOWED).toBe(false);
  });

  it("introduces no license secrets or live-execution claims in policy docs", () => {
    const combined = [
      readFileSync(architectureDoc, "utf8"),
      readFileSync(adrDoc, "utf8"),
    ].join("\n");

    expect(/license[_-]?key\s*[:=]/i.test(combined)).toBe(false);
    expect(/BEGIN (RSA |OPENSSH )?PRIVATE KEY/.test(combined)).toBe(false);
    expect(/ETABSControlledExecutionCertified\s*=\s*true/.test(combined)).toBe(
      false,
    );
    expect(
      /spaceGassControlledExecutionCertified\s*=\s*true/.test(combined),
    ).toBe(false);
    expect(/SPACEGASSLiveExecutionCertified\s*=\s*true/.test(combined)).toBe(
      false,
    );
    expect(combined.includes("silentSolverFallbackAllowed = true")).toBe(false);
  });
});
