import { describe, expect, it } from "vitest";
import {
  CANONICAL_CAPABILITY_MANIFEST_PATHS,
  classifyChangedFiles,
  classifyPathSensitivity,
  R1_COMMIT_CHANGED_FILES,
} from "./artifact-classification";

describe("release-sensitive artifact classification", () => {
  it("classifies the canonical concrete capability manifest as release-sensitive", () => {
    expect(CANONICAL_CAPABILITY_MANIFEST_PATHS).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classifyPathSensitivity("packages/engineering-os/src/structural-concrete/capability.ts")).toBe(
      "RELEASE_SENSITIVE",
    );
  });

  it("closes the R1 classifier gap: capability.ts in 5fca4aa8..9d208dce is release-sensitive", () => {
    const classified = classifyChangedFiles(R1_COMMIT_CHANGED_FILES);
    expect(classified.capabilityManifestChanged).toBe(true);
    expect(classified.releaseSensitiveFilesChanged).toBe(true);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
  });

  it("does not treat ordinary constitutive implementation files as release-sensitive by path alone", () => {
    expect(classifyPathSensitivity("packages/engineering-os/src/structural-concrete/eu-c1c-constitutive/evaluate.ts")).toBe(
      "NOT_SENSITIVE",
    );
  });
});
