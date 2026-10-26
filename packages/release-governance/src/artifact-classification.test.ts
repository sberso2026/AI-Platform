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
  D1M_R3_CHANGED_FILES,
  D1M_R4_CHANGED_FILES,
  D1M_R5_CHANGED_FILES,
  D1M_R6_CHANGED_FILES,
  D1M_R7_CHANGED_FILES,
  D1M_R8_CHANGED_FILES,
  D1M_R9_CHANGED_FILES,
  D1N_FOUNDATIONS_CHANGED_FILES,
  D1N_0_CHANGED_FILES,
  D1N_R1_CHANGED_FILES,
  D1N_R2_CHANGED_FILES,
  D1N_R3_CHANGED_FILES,
  D1N_R4_CHANGED_FILES,
  D1N_R5_CHANGED_FILES,
  D1N_R6_CHANGED_FILES,
  D1N_R7_CHANGED_FILES,
  D1N_R8_CHANGED_FILES,
  D1N_R9_CHANGED_FILES,
  D1_STRUCTURAL_PACK_SEQUENCING_CHANGED_FILES,
  D2_0_CHANGED_FILES,
  D2_R1_CHANGED_FILES,
  D2_R2_CHANGED_FILES,
  D2_R3_CHANGED_FILES,
  D2_R4_CHANGED_FILES,
  D2_R5_CHANGED_FILES,
  D2_R6_CHANGED_FILES,
  D2_R7_CHANGED_FILES,
  D2_R8_CHANGED_FILES,
  D2_R9_CHANGED_FILES,
  D2_R10_CHANGED_FILES,
  D2_R11_CHANGED_FILES,
  D2_R12_CHANGED_FILES,
  D3_0_CHANGED_FILES,
  D3_R1_CHANGED_FILES,
  D3_R2_CHANGED_FILES,
  D3_R3_CHANGED_FILES,
  D3_R4_CHANGED_FILES,
  D3_R5_CHANGED_FILES,
  D3_R6_CHANGED_FILES,
  D3_R7_CHANGED_FILES,
  D3_R8_CHANGED_FILES,
  D3_R9_CHANGED_FILES,
  D3_R10_CHANGED_FILES,
  D3_R11_CHANGED_FILES,
  D3_R12_CHANGED_FILES,
  D4_0_CHANGED_FILES,
  D4_R1_CHANGED_FILES,
  D4_R2_CHANGED_FILES,
  D4_R3_CHANGED_FILES,
  D4_R4_CHANGED_FILES,
  D4_R5_CHANGED_FILES,
  D4_R6_CHANGED_FILES,
  D5_0_CHANGED_FILES,
  D5_R1_CHANGED_FILES,
  D5_R2_CHANGED_FILES,
  D5_R3_CHANGED_FILES,
  D5_R4_CHANGED_FILES,
  D5_R5_CHANGED_FILES,
  D5_R6_CHANGED_FILES,
  D5_R7_CHANGED_FILES,
  D5_R8_CHANGED_FILES,
  D5_R9_CHANGED_FILES,
  D5_R10_CHANGED_FILES,
  D5_R11_CHANGED_FILES,
  D5_R12_CHANGED_FILES,
  D6_0_CHANGED_FILES,
  D6_R1_CHANGED_FILES,
  D6_R2_CHANGED_FILES,
  D6_R3_CHANGED_FILES,
  D6_R4_CHANGED_FILES,
  D6_R5_CHANGED_FILES,
  D6_R6_CHANGED_FILES,
  D6_R7_CHANGED_FILES,
  D6_R8_CHANGED_FILES,
  D6_R9_CHANGED_FILES,
  D6_R10_CHANGED_FILES,
  D1_QUALIFIED_REVIEW_CHANGED_FILES,
  D1G_VALIDATION_ROUTE_CHANGED_FILES,
  D1_DEBT_CANONICALIZATION_CHANGED_FILES,
  D9_R8_CHANGED_FILES,
  D9_R7_CHANGED_FILES,
  D9_R6_CHANGED_FILES,
  D9_R5_CHANGED_FILES,
  D9_R4_CHANGED_FILES,
  D9_R3_CHANGED_FILES,
  D9_R2_CHANGED_FILES,
  D9_R1_CHANGED_FILES,
  D9_0_CHANGED_FILES,
  D8_R12_CHANGED_FILES,
  D8_R11_CHANGED_FILES,
  D8_R10_CHANGED_FILES,
  D8_R9_CHANGED_FILES,
  D8_R8_CHANGED_FILES,
  D8_R7_CHANGED_FILES,
  D8_R6_CHANGED_FILES,
  D8_R5_CHANGED_FILES,
  D8_R4_CHANGED_FILES,
  D8_R3_CHANGED_FILES,
  D8_R2_CHANGED_FILES,
  D8_R1_CHANGED_FILES,
  D8_0_CHANGED_FILES,
  D7_R12_CHANGED_FILES,
  D7_R11_CHANGED_FILES,
  D7_R10_CHANGED_FILES,
  D7_R9_CHANGED_FILES,
  D7_R8_CHANGED_FILES,
  D7_R7_CHANGED_FILES,
  D7_R6_CHANGED_FILES,
  D7_R5_CHANGED_FILES,
  D7_R4_CHANGED_FILES,
  D7_R3_CHANGED_FILES,
  D7_R2_CHANGED_FILES,
  D7_R1_CHANGED_FILES,
  D7_0_CHANGED_FILES,
  D6_R12_CHANGED_FILES,
  D6_R11_CHANGED_FILES,
  D4_R12_CHANGED_FILES,
  D4_R11_CHANGED_FILES,
  D4_R10_CHANGED_FILES,
  D4_R9_CHANGED_FILES,
  D4_R8_CHANGED_FILES,
  D4_R7_CHANGED_FILES,
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

  it("classifies the D1M-R3 geometry and semantic evidence as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-model-evidence.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M-R4 reference context as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-reference-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M-R5 relationship evidence as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-model-relationship.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M R6 adapter boundary as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-adapter-boundary.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R6_FILE_API_ADAPTER_BOUNDARY_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M R7 change governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-change-governance.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R7_CHANGE_STALENESS_SUPERSESSION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M R8 evidence handoff as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-evidence-handoff.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R8_D1K_D1L_D1N_EVIDENCE_HANDOFF_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1M R9 intelligence closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1M_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/cad-bim-intelligence-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1M_R9_CAD_OR_BIM_INTELLIGENCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N foundational decisions as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_FOUNDATIONS_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/structural-systems/d1n-foundational-decisions.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_FOUNDATIONAL_ARCHITECTURE_DECISIONS.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1 qualified structural review action package as release-sensitive", () => {
    const classified = classifyChangedFiles(D1_QUALIFIED_REVIEW_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/d1-qualified-structural-review.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEW_ACTION_PACKAGE.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1G validation route canonicalization as release-sensitive", () => {
    const classified = classifyChangedFiles(D1G_VALIDATION_ROUTE_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/d1g-validation-route-canonicalization.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_D1G_VALIDATION_ROUTE_CANONICALIZATION.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1 structural debt canonicalization as release-sensitive", () => {
    const classified = classifyChangedFiles(D1_DEBT_CANONICALIZATION_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/d1-structural-debt-canonicalization.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("docs/architecture/engineering-os/EOS_D1_STRUCTURAL_DEBT_CANONICALIZATION.md");
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R8 bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/cross-discipline-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R8_CROSS_DISCIPLINE_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R7 review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R7_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R6 currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R6_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R5 recommendation support as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/recommendation-support.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R5_RECOMMENDATION_SUPPORT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R4 conflict governance and escalation as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/conflict-governance-escalation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R4_CONFLICT_GOVERNANCE_AND_ESCALATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R3 conflict candidate detection as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/conflict-candidate-detection.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R3_CONFLICT_CANDIDATE_DETECTION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R2 cross-discipline observation as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/cross-discipline-observation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/source-contract-read-model.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R2_CROSS_DISCIPLINE_OBSERVATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-R1 source contract read model as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/cross-discipline/source-contract-read-model.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/engineering-os/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_R1_SOURCE_CONTRACT_READ_MODEL_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D9-0 cross-discipline intelligence architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D9_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/cross-discipline-intelligence-architecture-d9-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain("packages/types/src/index.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D9_0_CROSS_DISCIPLINE_INTELLIGENCE_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R12 instrumentation and control bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/instrumentation-control-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R12_INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R11 D9 source contract runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/d9-source-contract.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R10 currentness and digital-thread runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R9 review and validation governance runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R8 discipline interfaces and handoffs runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/discipline-interfaces-handoffs.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R7 requirements, assumptions, and change runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/requirements-assumptions-change.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R6 safety, interlock, and shutdown context as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/safety-interlock-shutdown-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R6_SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R5 control-system architecture context as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/control-system-architecture-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R5_CONTROL_SYSTEM_ARCHITECTURE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R4 signal, I/O, and control-loop context as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/signal-io-control-loop-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R4_SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R3 instrument and device context as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/instrument-device-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R3_INSTRUMENT_AND_DEVICE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R2 process measurement and tag context as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/process-measurement-tag-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R2_PROCESS_MEASUREMENT_AND_TAG_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-R1 Instrumentation and Control identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/instrumentation-control/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_R1_INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D8-0 Instrumentation and Control architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D8_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/instrumentation-control-architecture-d8-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D8_0_INSTRUMENTATION_CONTROL_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R12 Electrical bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/electrical-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R12_ELECTRICAL_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R11 Electrical D9 source contract as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/d9-source-contract.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R10 Electrical currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R9 Electrical review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R8 Electrical discipline interfaces and handoffs as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/discipline-interfaces-handoffs.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R7 Electrical requirements assumptions and change as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/requirements-assumptions-change.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R6 Electrical protection grounding and hazardous area context as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/protection-grounding-hazardous-area-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R6_PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R5 Electrical calculation evidence as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/calculation-evidence.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R5_ELECTRICAL_CALCULATION_EVIDENCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R4 Electrical feeder cable and rating context as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/feeder-cable-rating-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R4_FEEDER_CABLE_AND_RATING_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R3 Electrical load consumer equipment context as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/load-consumer-equipment-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R3_LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R2 Electrical system source distribution context as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/system-source-distribution-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R2_ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-R1 Electrical identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/electrical/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_R1_ELECTRICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D7-0 Electrical architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D7_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/electrical-architecture-d7-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D7_0_ELECTRICAL_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R12 Process bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/process-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R12_PROCESS_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R11 Process D9 source contract as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/d9-source-contract.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R10 Process currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R9 Process review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R8 Process discipline interfaces and handoffs as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/discipline-interfaces-handoffs.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R7 Process requirements assumptions and change as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/requirements-assumptions-change.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R6 Process safety and relief context as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/process-safety-relief-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R6_PROCESS_SAFETY_AND_RELIEF_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R5 Process equipment duty and utility context as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/equipment-duty-utility-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R5_EQUIPMENT_DUTY_AND_UTILITY_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R4 Process evidence and balances as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/process-evidence-balances.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R4_PROCESS_EVIDENCE_AND_BALANCES_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R3 Process operating and design basis as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/operating-design-basis-conditions.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R3_OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R2 Process system stream and service context as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/system-stream-service-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R2_PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-R1 Process identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/process/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_R1_PROCESS_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D6-0 Process architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D6_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/process-architecture-d6-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D6_0_PROCESS_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R12 Piping bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/piping-bounded-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R12_PIPING_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R11 Piping source contract runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/d9-source-contract.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R10 Piping currentness and digital thread runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/currentness-digital-thread.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R9 Piping review and validation governance runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/review-validation-governance.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R8 Piping discipline interfaces and handoffs runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/discipline-interfaces-handoffs.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R7 Piping requirements assumptions and change runtime as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/requirements-assumptions-change.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R6 Piping stress support and test evidence context as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/stress-support-test-evidence-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R6_STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R5 Piping routing arrangement and fabrication context as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/routing-arrangement-fabrication-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R5_ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R4 Piping component connection and valve context as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/component-connection-valve-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R4_COMPONENT_CONNECTION_AND_VALVE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R3 Piping design condition specification context as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/piping/design-condition-specification-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R3_DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R2 Piping system line service context as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/piping/system-line-service-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R2_PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-R1 Piping identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/piping/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_R1_PIPING_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D5-0 Piping architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D5_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/piping-architecture-d5-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D5_0_PIPING_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R12 Mechanical bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/mechanical-bounded-closeout.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R12_MECHANICAL_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R11 D9 source contract as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/d9-source-contract.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R10 currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/currentness-digital-thread.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R9 review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/review-validation-governance.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R8 discipline interfaces and handoffs as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/discipline-interfaces-handoffs.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R7 requirements assumptions and change as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/requirements-assumptions-change.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R6 maintainability access and package context as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/maintainability-access-package-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R6_MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R5 mechanical requirements and technical context as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/mechanical-technical-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R5_MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R4 vendor data and evidence context as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/vendor-data-evidence-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R4_VENDOR_DATA_AND_EVIDENCE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R3 design conditions and performance context as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain(
      "packages/engineering-os/src/mechanical/design-condition-performance-context.ts",
    );
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R3_DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R2 equipment and system context as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/mechanical/equipment-system-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R2_EQUIPMENT_AND_SYSTEM_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-R1 Mechanical identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/mechanical/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_R1_MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D4-0 Mechanical architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D4_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/mechanical-architecture-d4-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D4_0_MECHANICAL_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R12 Geotechnical bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/geotechnical-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R12_GEOTECHNICAL_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R11 D9 source contract as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/d9-source-contract.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R10 currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R9 review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R8 discipline interfaces and handoffs as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/discipline-interfaces-handoffs.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R7 requirements assumptions and change context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/requirements-assumptions-change.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R6 foundation excavation and slope context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/foundation-excavation-slope-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R6_FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R5 Geotechnical parameter context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/geotechnical-parameter-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R5_GEOTECHNICAL_PARAMETER_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R4 field and laboratory test context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/field-lab-test-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R4_FIELD_AND_LAB_TEST_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R3 stratigraphy groundwater and material context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/stratigraphy-groundwater-material.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R3_STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R2 site investigation evidence context as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/site-investigation-evidence.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R2_SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-R1 Geotechnical identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/geotechnical/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_R1_GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D3-0 Geotechnical architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D3_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/geotechnical-architecture-d3-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D3_0_GEOTECHNICAL_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R12 Civil bounded closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R12_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/civil-bounded-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R12_CIVIL_BOUNDED_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R11 D9 source contract as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R11_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/d9-source-contract.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R10 currentness and digital thread as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R10_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/currentness-digital-thread.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R9 review and validation governance as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/review-validation-governance.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R8 discipline interfaces and handoffs as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/discipline-interfaces-handoffs.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R7 requirements assumptions and change context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/requirements-assumptions-change.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R6 civil utility and corridor context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/utility-corridor-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R6_CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R5 drainage and stormwater context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/drainage-stormwater-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R5_DRAINAGE_AND_STORMWATER_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R4 roads and access context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/roads-access-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R4_ROADS_AND_ACCESS_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R3 grading and earthworks context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/grading-earthworks-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R3_GRADING_AND_EARTHWORKS_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R2 survey spatial and surface context as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/spatial-surface-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R2_SURVEY_SPATIAL_AND_SURFACE_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-R1 Civil identity foundation as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/civil/identity-foundation.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_R1_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D2-0 Civil architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D2_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/civil-architecture-d2-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D2_0_CIVIL_ARCHITECTURE.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1 structural pack sequencing decision as release-sensitive", () => {
    const classified = classifyChangedFiles(D1_STRUCTURAL_PACK_SEQUENCING_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/structural-pack-sequencing.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_PACK_COMPLETION_CRITERIA_AND_ROADMAP_SEQUENCING.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R9 orchestration closeout as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R9_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/orchestration-closeout.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R9_CONCEPT_TO_DETAILED_ORCHESTRATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R8 handoff integration as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R8_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/handoff-integration.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R8_D1M_D1K_D1L_HANDOFF_INTEGRATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R7 currentness reassessment as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R7_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/currentness-reassessment.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R7_CURRENTNESS_STALENESS_AND_REASSESSMENT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R6 alternative branch as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R6_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/alternative-branch.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R6_ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R5 human decision record as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R5_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/human-decision-record.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R5_HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R4 stage-transition request as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R4_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/stage-transition-request.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R4_STAGE_TRANSITION_REQUEST_GOVERNANCE_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R3 prerequisite assessment as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R3_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/prerequisite-assessment.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R3_PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R2 design progression context as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R2_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/design-progression-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R2_DESIGN_PROGRESSION_CONTEXT_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-R1 orchestration context as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_R1_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-systems/orchestration-context.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_R1_ORCHESTRATION_IDENTITY_AND_STATE_FOUNDATION_CLOSEOUT.md",
    );
    expect(classified.securitySensitiveFiles).toEqual([]);
    expect(classified.capabilityManifestChanged).toBe(true);
  });

  it("classifies the D1N-0 orchestration architecture as release-sensitive", () => {
    const classified = classifyChangedFiles(D1N_0_CHANGED_FILES);
    expect(classified.releaseSensitiveFiles).toContain("packages/types/src/structural-orchestration-d1n-0.ts");
    expect(classified.releaseSensitiveFiles).toContain("packages/engineering-os/src/structural-concrete/capability.ts");
    expect(classified.releaseSensitiveFiles).not.toContain(
      "docs/architecture/engineering-os/EOS_D1N_0_CONCEPT_TO_DETAILED_ORCHESTRATION_ARCHITECTURE.md",
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
