import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 14A Engineering OS GA readiness architecture lock", () => {
  it("keeps frozen V1 module tags at certified commits", () => {
    const { execSync } = require("node:child_process") as typeof import("node:child_process");
    const tag = (name: string) =>
      execSync(`git rev-list -n 1 ${name}`, { cwd: root, encoding: "utf8" }).trim();
    expect(tag("project-intelligence-v1.0.0")).toBe(
      "34975b1cf660580d46287f24e746b8915903f768",
    );
    expect(tag("inspection-intelligence-v1.0.0")).toBe(
      "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09",
    );
    expect(tag("asset-intelligence-v1.0.0")).toBe(
      "925e2ed74025cac6a145c346c17c53320efb8757",
    );
    expect(tag("project-controls-v1.0.0")).toBe(
      "b17fe4cfe2574520ec813a7b43ba7328a585d741",
    );
    expect(tag("digital-twin-v1.0.0")).toBe(
      "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
    );
    expect(tag("engineering-model-interoperability-v1.0.0")).toBe(
      "4e55f32f8b5727ae900915b20492bbdf1d60f6b9",
    );
  });

  it("declares EOS 0.9.0-ga-readiness without claiming EOS V1 GA", () => {
    const version = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(version).toContain('ENGINEERING_OS_VERSION = "0.9.0-ga-readiness"');
    expect(version).toContain("productionEngineeringOSReady = false");
    expect(version).toContain("engineeringOSV1GaCertified = false");
    expect(version).toContain("phase14BReady = true");
    expect(version).toContain(
      "clientLicensedSolverExecutionArchitectureSupported = true",
    );
  });

  it("requires core Phase 14A architecture documents", () => {
    for (const rel of [
      "docs/architecture/ENGINEERING_OS_PHASE_14A_EXISTING_SYSTEM_INVENTORY.md",
      "docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md",
      "docs/architecture/ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md",
      "docs/architecture/ENGINEERING_OS_CANONICAL_OWNERSHIP_NORMALIZATION.md",
      "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md",
      "docs/architecture/ENGINEERING_OS_V1_READINESS_MATRIX.md",
      "docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md",
      ".github/workflows/phase-14a-engineering-os-ga-readiness.yml",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
