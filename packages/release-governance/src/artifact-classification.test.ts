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
  R9_C9_WALL_CHANGED_FILES,
  R9_C9_CLOSEOUT_CHANGED_FILES,
  R10_C10_R1_CHANGED_FILES,
  R10_C10_R2_CHANGED_FILES,
  R10_C10_R3A_CHANGED_FILES,
  D1F_0_CHANGED_FILES,
  D1F_R1_CHANGED_FILES,
  D1F_R2_CHANGED_FILES,
  D1F_R3_CHANGED_FILES,
  D1F_R4_CHANGED_FILES,
  D1F_R5_CHANGED_FILES,
  D1F_R6_CHANGED_FILES,
  D1G_R1_CHANGED_FILES,
  D1G_R2_CHANGED_FILES,
  D1G_R3_CHANGED_FILES,
  D1G_R4_CHANGED_FILES,
  D1G_R5_CHANGED_FILES,
  D1H_0_CHANGED_FILES,
  D1H_R1_CHANGED_FILES,
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

  it("classifies C10 readiness metadata as release-sensitive", () => {
    const classified = classifyChangedFiles(R10_C10_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c10/readiness.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1E_EU_C10_R1_INDEPENDENT_VALIDATION_READINESS.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies C10 benchmark evidence as release-sensitive", () => {
    const classified = classifyChangedFiles(R10_C10_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c10/readiness.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1E_EU_C10_R2_METHOD_MEMBER_BENCHMARKS.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies D1F structural systems architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1F_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/contract.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_0_STRUCTURAL_SYSTEMS_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1F-R1 topology runtime as release-sensitive and leaves the document unclassified", () => {
    const classified = classifyChangedFiles(D1F_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r1.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/runtime.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R1_STRUCTURAL_SYSTEM_CONTEXT_TOPOLOGY.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1F-R2 analysis-result runtime as release-sensitive and leaves the document unclassified", () => {
    const classified = classifyChangedFiles(D1F_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r2.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/result-binding.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R2_ANALYSIS_RESULT_CONTRACT_MEMBER_ACTION_BINDING.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1F-R3 evaluation orchestration as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1F_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r3.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/system-evaluation.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R3_SYSTEM_TO_MEMBER_EVALUATION_ORCHESTRATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1F-R4 connection interface as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1F_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r4.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/connection-interface.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R4_CONNECTION_JOINT_INTERFACE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1F-R5 foundation interface as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1F_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r5.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/foundation-interface.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R5_FOUNDATION_SUPPORT_INTERFACE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1F-R6 closeout as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1F_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-r6.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1F_R6_STRUCTURAL_SYSTEMS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1G-R1 adapter files as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1G_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-d1g-r1.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/solver-adapter.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1G_R1_PROVIDER_NEUTRAL_SOLVER_ADAPTER_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1G-R2 result package files as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1G_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-d1g-r2.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/result-package.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1G_R2_PROVIDER_NEUTRAL_RESULT_PACKAGE_INGESTION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies D1G-R3 provider selection files as release-sensitive and the architecture note as not", () => {
    const classified = classifyChangedFiles(D1G_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-d1g-r3.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/provider-selection.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1G_R3_PROVIDER_SELECTION_FIRST_CONNECTOR_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1G-R4 local transport as security-sensitive and the mapping as release-sensitive", () => {
    const classified = classifyChangedFiles(D1G_R4_CHANGED_FILES);
    expect(classified.securitySensitiveFiles).toContain("packages/engineering-os/src/structural-systems/space-gass-transport.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/space-gass-connector.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-d1g-r4.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/structural-systems/space-gass-transport.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1G_R4_SPACE_GASS_READ_ONLY_CONNECTOR_IMPLEMENTATION.md",
    );
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1G-R5 closeout transport as security-sensitive and the connector as release-sensitive", () => {
    const classified = classifyChangedFiles(D1G_R5_CHANGED_FILES);
    expect(classified.securitySensitiveFiles).toContain("packages/engineering-os/src/structural-systems/space-gass-transport.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/space-gass-connector.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-systems-d1g-r5.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/structural-systems/space-gass-transport.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1G_R5_SPACE_GASS_CONNECTOR_HARDENING_AND_D1G_CLOSEOUT.md",
    );
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1H-0 architecture contracts as release-sensitive and the documents as not release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-inspection-d1h-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_0_STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1H-R1 evidence foundation as release-sensitive and the document as not release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-evidence.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_R1_STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies C10 review packs as release-sensitive", () => {
    const classified = classifyChangedFiles(R10_C10_R3A_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c10/review-packs.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1E_EU_C10_R3A_ENGINEER_REVIEW_PACK_PREPARATION.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/eu-c10/review-packs/REVIEW_TEMPLATE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_CLOSEOUT_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/capability.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1E_EU_C9_R6_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
  });

  it("classifies the C9 wall-section orchestrator as release-sensitive", () => {
    const classified = classifyChangedFiles(R9_C9_WALL_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-concrete/eu-c9/wall.ts",
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
