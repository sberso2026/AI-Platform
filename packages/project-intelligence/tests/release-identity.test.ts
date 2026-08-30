import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ENGINEERING_OS_AGGREGATE_MANIFEST,
  PROJECT_INTELLIGENCE_V1_COMMIT,
  PROJECT_INTELLIGENCE_V1_TAG,
  defaultEngineeringModuleRegistry,
  formatApplicationGaTag,
} from "@rtb/engineering-os";
import { PROJECT_INTELLIGENCE_FEATURES } from "../src/features/registry";
import {
  PROJECT_INTELLIGENCE_PRODUCT_SLUG,
  PROJECT_INTELLIGENCE_RELEASE_SEMVER_LEVEL,
  PROJECT_INTELLIGENCE_RELEASE_TAG,
  PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG,
  PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION,
  PROJECT_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  PROJECT_INTELLIGENCE_VERSION,
  assertProjectIntelligenceVersionConsistency,
  getProjectIntelligenceHistoricalCertification,
  getProjectIntelligenceVersionDeclaration,
} from "../src/version";

const ROOT = resolve(import.meta.dirname, "../../..");
const HISTORICAL_V1_COMMIT = "34975b1cf660580d46287f24e746b8915903f768";

function git(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

describe("Project Intelligence release identity", () => {
  it("preserves historical V1 certification contract separately from current release", () => {
    const historical = getProjectIntelligenceHistoricalCertification();
    expect(historical.version).toBe("1.0.0");
    expect(historical.tag).toBe("project-intelligence-v1.0.0");
    expect(historical.certifiedCommit).toBe(HISTORICAL_V1_COMMIT);
    expect(PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION).toBe("1.0.0");
    expect(PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG).toBe(PROJECT_INTELLIGENCE_V1_TAG);
    expect(PROJECT_INTELLIGENCE_V1_CERTIFIED_COMMIT).toBe(PROJECT_INTELLIGENCE_V1_COMMIT);
  });

  it("declares current MINOR release 1.1.0 without using the historical tag name", () => {
    expect(PROJECT_INTELLIGENCE_VERSION).toBe("1.1.0");
    expect(PROJECT_INTELLIGENCE_RELEASE_TAG).toBe("project-intelligence-v1.1.0");
    expect(PROJECT_INTELLIGENCE_RELEASE_SEMVER_LEVEL).toBe("minor");
    expect(PROJECT_INTELLIGENCE_RELEASE_TAG).toBe(
      formatApplicationGaTag(PROJECT_INTELLIGENCE_PRODUCT_SLUG, PROJECT_INTELLIGENCE_VERSION),
    );
    expect(PROJECT_INTELLIGENCE_RELEASE_TAG).not.toBe(PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG);
    expect(PROJECT_INTELLIGENCE_VERSION).not.toBe(PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION);

    const declaration = getProjectIntelligenceVersionDeclaration();
    expect(declaration.version).toBe("1.1.0");
    expect(declaration.releaseTag).toBe("project-intelligence-v1.1.0");
    expect(declaration.freeze).toBe(true);
    expect(declaration.historicalCertification.tag).toBe("project-intelligence-v1.0.0");
  });

  it("keeps package, module, and V1 feature-contract versions consistent", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, "packages/project-intelligence/package.json"), "utf8"),
    ) as { version: string };
    const mod = defaultEngineeringModuleRegistry.get("project_intelligence");
    expect(pkg.version).toBe(PROJECT_INTELLIGENCE_VERSION);
    expect(mod?.version).toBe(PROJECT_INTELLIGENCE_VERSION);
    expect(PROJECT_INTELLIGENCE_FEATURES.every((f) => f.version === "1.0.0")).toBe(true);
    expect(() =>
      assertProjectIntelligenceVersionConsistency({
        packageVersion: pkg.version,
        moduleVersion: mod!.version,
        featureVersions: PROJECT_INTELLIGENCE_FEATURES.map((f) => f.version),
      }),
    ).not.toThrow();

    const installed = ENGINEERING_OS_AGGREGATE_MANIFEST.installedModules.find(
      (m) => m.moduleKey === "project_intelligence",
    );
    expect(installed?.version).toBe("1.1.0");
    expect(installed?.publicContractVersion).toBe("1.0.0");
  });

  it("does not move the historical GA tag and does not create the declared current tag", () => {
    expect(git("git rev-list -n 1 project-intelligence-v1.0.0")).toBe(HISTORICAL_V1_COMMIT);
    expect(() => git("git rev-parse --verify refs/tags/project-intelligence-v1.1.0")).toThrow();
  });
});
