import { describe, expect, it } from "vitest";
import {
  CANONICAL_CAPABILITY_MANIFEST_PATHS,
  classifyChangedFiles,
  classifyPathSensitivity,
  R1_COMMIT_CHANGED_FILES,
  R4_ANCHORAGE_AUTHORITY_CHANGED_FILES,
  R5_LAP_AUTHORITY_CHANGED_FILES,
  R6_C8_CLOSEOUT_CHANGED_FILES,
  R9_C9_FOUNDATION_CHANGED_FILES,
  R9_C9_BEAM_CHANGED_FILES,
  R9_C9_COLUMN_CHANGED_FILES,
  R9_C9_SLAB_CHANGED_FILES,
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

  it("classifies the R4 anchorage profile and rule file as release-sensitive", () => {
    const classified = classifyChangedFiles(R4_ANCHORAGE_AUTHORITY_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c8/anchorage-profile.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classifyPathSensitivity("packages/engineering-os/src/structural-concrete/eu-c8/anchorage-evaluate.ts")).toBe(
      "RELEASE_SENSITIVE",
    );
  });

  it("classifies the R5 lap authority record as release-sensitive", () => {
    const classified = classifyChangedFiles(R5_LAP_AUTHORITY_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c8/lap-authority.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the R6 C8 closeout record as release-sensitive", () => {
    const classified = classifyChangedFiles(R6_C8_CLOSEOUT_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c8/closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/d1e-closeout/matrix.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 orchestration foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_FOUNDATION_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/foundation.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 slab orchestrator as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_SLAB_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/slab.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 column orchestrator as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_COLUMN_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/column.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 beam orchestrator as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_BEAM_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/beam.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("does not treat ordinary constitutive implementation files as release-sensitive by path alone", () => {
    expect(classifyPathSensitivity("packages/engineering-os/src/structural-concrete/eu-c1c-constitutive/evaluate.ts")).toBe(
      "NOT_SENSITIVE",
    );
  });
});
