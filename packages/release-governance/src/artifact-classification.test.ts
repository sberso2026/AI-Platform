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
  D1H_R2_CHANGED_FILES,
  D1H_R3_CHANGED_FILES,
  D1H_R4_CHANGED_FILES,
  D1H_R5_CHANGED_FILES,
  POST_D1H_ROADMAP_CHANGED_FILES,
  POST_D1I_ROADMAP_CHANGED_FILES,
  POST_D1J_ROADMAP_CHANGED_FILES,
  D1I_0_CHANGED_FILES,
  D1J_0_CHANGED_FILES,
  D1K_0_CHANGED_FILES,
  D1K_R1_CHANGED_FILES,
  D1K_R2_CHANGED_FILES,
  D1K_R3_CHANGED_FILES,
  D1K_R4_CHANGED_FILES,
  D1K_R5_CHANGED_FILES,
  D1L_0_CHANGED_FILES,
  D1L_R1_CHANGED_FILES,
  D1L_R2_CHANGED_FILES,
  D1L_R3_CHANGED_FILES,
  D1L_R4_CHANGED_FILES,
  D1L_R5_CHANGED_FILES,
  D1L_R6_CHANGED_FILES,
  D1M_0_CHANGED_FILES,
  D1M_R1_CHANGED_FILES,
  D1M_R2_CHANGED_FILES,
  POST_D1L_ROADMAP_CHANGED_FILES,
  D1J_R1_CHANGED_FILES,
  D1J_R2_CHANGED_FILES,
  D1J_R3_CHANGED_FILES,
  D1J_R4_CHANGED_FILES,
  D1J_R5_CHANGED_FILES,
  D1I_R1_CHANGED_FILES,
  D1I_R2_CHANGED_FILES,
  D1I_R3_CHANGED_FILES,
  D1I_R4_CHANGED_FILES,
  D1I_R5_CHANGED_FILES,
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

  it("classifies the D1H-R2 finding foundation as release-sensitive and the document as not release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-finding.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_R2_STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1H-R3 condition runtime as release-sensitive and the document as not release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-condition.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_R3_CONDITION_STATE_RATING_INTERPRETATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1H-R4 temporal linkage runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-temporal.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_R4_TEMPORAL_HISTORY_ASSOCIATION_ANALYSIS_LINKAGE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1H-R5 closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1H_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/inspection-condition.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1H_R5_STRUCTURAL_INSPECTION_CONDITION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(false);
  });

  it("classifies the D1L-R2 eligibility evaluation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-eligibility.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R2_ELIGIBILITY_BLOCKER_EVALUATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M-0 CAD or BIM architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-cad-bim-d1m-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-architecture.test.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M-R1 source revision foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-source-revision.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M-R2 source-object mapping as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-object-mapping.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the post-D1L roadmap canonicalization as release-sensitive", () => {
    const classified = classifyChangedFiles(POST_D1L_ROADMAP_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/post-d1l-roadmap.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_POST_D1L_CANONICAL_ROADMAP.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-R6 certification gate closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-gate-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R6_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-R5 evidence invalidation and supersession as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-lifecycle.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R5_EVIDENCE_INVALIDATION_SUPERSESSION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-R4 certification authority decision record as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-decision.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R4_CERTIFICATION_AUTHORITY_DECISION_RECORD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-R3 standards and jurisdiction profile governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-profile-governance.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R3_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-R1 certification manifest foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-claim-manifest.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_R1_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1L-0 certification gate architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1L_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-certification-d1l-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/eos-structural-certification-architecture.test.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1L_0_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-R5 interface closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/interface-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_R5_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-R4 interface reference composition as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/interface-reference-composition.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_R4_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-R3 interface handoff governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/interface-handoff-governance.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_R3_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-R2 interface compatibility diagnostics as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/interface-compatibility.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-R1 interface identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/interface-identity-foundation.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1K-0 interface architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1K_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-interfaces-d1k-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/eos-structural-interface-architecture.test.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-0 optimization architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-optimization-d1j-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/eos-structural-optimization-architecture.test.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_0_STRUCTURAL_OPTIMIZATION_CERTIFICATION_ARCHITECTURE.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-R5 optimization closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/optimization-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_R5_STRUCTURAL_OPTIMIZATION_CERTIFICATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-R4 certification readiness gate as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/certification-readiness-gate.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_R4_CERTIFICATION_EVIDENCE_READINESS_GATE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-R3 candidate composition foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/candidate-composition.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_R3_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-R2 evaluation reference foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/objective-constraint-foundation.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_R2_OBJECTIVE_CONSTRAINT_FEASIBILITY_REFERENCE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1J-R1 problem foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1J_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/optimization-problem-foundation.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1J_R1_OPTIMIZATION_PROBLEM_BASELINE_VARIABLE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the post-D1J roadmap decision as release-sensitive where it states engineering authority", () => {
    const classified = classifyChangedFiles(POST_D1J_ROADMAP_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/post-d1j-roadmap.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(false);
  });

  it("classifies the post-D1I roadmap decision as release-sensitive where it states engineering authority", () => {
    const classified = classifyChangedFiles(POST_D1I_ROADMAP_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/roadmap-after-twin-closeout.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_POST_D1I_CANONICAL_ROADMAP.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(false);
  });

  it("classifies the post-D1H roadmap decision as release-sensitive where it states engineering authority", () => {
    const classified = classifyChangedFiles(POST_D1H_ROADMAP_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/post-d1h-roadmap.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_POST_D1H_CANONICAL_ROADMAP.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(false);
  });

  it("classifies the D1I-R5 digital twin closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1I_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-monitoring-reference.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_R5_STRUCTURAL_DIGITAL_TWIN_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1I-R4 monitoring reference interface as release-sensitive", () => {
    const classified = classifyChangedFiles(D1I_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-monitoring-reference.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_R4_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1I-R3 conflict composition as release-sensitive", () => {
    const classified = classifyChangedFiles(D1I_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-conflict-composition.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_R3_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1I-R2 temporal snapshot governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D1I_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-temporal-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_R2_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_STATE_GOVERNANCE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1I-R1 state reference foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D1I_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/twin-reference-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_R1_TWIN_IDENTITY_STATE_REFERENCE_FOUNDATION.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1I-0 digital twin architecture as release-sensitive where it states engineering authority", () => {
    const classified = classifyChangedFiles(D1I_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-digital-twin-d1i-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/eos-structural-twin-architecture.test.ts",
    );
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1I_0_STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE.md",
    );
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
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
