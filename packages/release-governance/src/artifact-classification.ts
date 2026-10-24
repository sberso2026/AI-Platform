/**
 * Canonical changed-file classification for release/conformance artifacts.
 *
 * Capability manifests and release/conformance metadata are release-sensitive
 * even when release status itself is not promoted. R1 omitted
 * packages/engineering-os/src/structural-concrete/capability.ts; this classifier
 * closes that gap without rewriting the historical R1 commit.
 */

export const CANONICAL_CAPABILITY_MANIFEST_PATHS = [
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-steel/d1d-closeout/manifest.ts",
] as const;

const RELEASE_SENSITIVE_PATH_PATTERNS: readonly RegExp[] = [
  /^docs\/release\//,
  /migration-manifest\.json$/,
  /packages\/engineering-os\/src\/structural-concrete\/capability\.ts$/,
  /packages\/engineering-os\/src\/structural-steel\/d1d-closeout\/manifest\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c8\/anchorage-profile\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c8\/anchorage-evaluate\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c8\/registry\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c8\/lap-authority\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c8\/closeout\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/foundation\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/beam\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/column\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/slab\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/wall\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c9\/closeout\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c10\/readiness\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c10\/benchmarks\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/eu-c10\/review-packs\.ts$/,
  /packages\/engineering-os\/src\/structural-concrete\/d1e-closeout\/matrix\.ts$/,
  /packages\/types\/src\/structural-systems\.ts$/,
  /packages\/types\/src\/structural-systems-r1\.ts$/,
  /packages\/types\/src\/structural-systems-r2\.ts$/,
  /packages\/types\/src\/structural-systems-r3\.ts$/,
  /packages\/types\/src\/structural-systems-r4\.ts$/,
  /packages\/types\/src\/structural-systems-r5\.ts$/,
  /packages\/types\/src\/structural-systems-r6\.ts$/,
  /packages\/types\/src\/structural-systems-d1g-r1\.ts$/,
  /packages\/types\/src\/structural-systems-d1g-r2\.ts$/,
  /packages\/types\/src\/structural-systems-d1g-r3\.ts$/,
  /packages\/types\/src\/structural-systems-d1g-r4\.ts$/,
  /packages\/types\/src\/structural-systems-d1g-r5\.ts$/,
  /packages\/types\/src\/structural-inspection-d1h-0\.ts$/,
  /packages\/types\/src\/structural-digital-twin-d1i-0\.ts$/,
  /packages\/types\/src\/structural-optimization-d1j-0\.ts$/,
  /packages\/types\/src\/structural-interfaces-d1k-0\.ts$/,
  /packages\/types\/src\/structural-certification-d1l-0\.ts$/,
  /packages\/types\/src\/structural-cad-bim-d1m-0\.ts$/,
  /packages\/types\/src\/structural-orchestration-d1n-0\.ts$/,
  /packages\/types\/src\/civil-architecture-d2-0\.ts$/,
  /packages\/types\/src\/geotechnical-architecture-d3-0\.ts$/,
  /packages\/types\/src\/mechanical-architecture-d4-0\.ts$/,
  /packages\/types\/src\/piping-architecture-d5-0\.ts$/,
  /packages\/engineering-os\/src\/civil\//,
  /packages\/engineering-os\/src\/geotechnical\//,
  /packages\/engineering-os\/src\/mechanical\//,
  /packages\/engineering-os\/src\/piping\//,
  /packages\/engineering-os\/src\/structural-systems\//,
];

const SECURITY_SENSITIVE_PATH_PATTERNS: readonly RegExp[] = [
  /security-definer/i,
  /rtb-sec-rls/i,
  /service-guard/i,
  /secret-scan/i,
  /RLS/i,
  /docs\/security\//,
  /packages\/engineering-os\/src\/structural-systems\/space-gass-transport\.ts$/,
];

export type ArtifactSensitivity = "RELEASE_SENSITIVE" | "SECURITY_SENSITIVE" | "NOT_SENSITIVE";

export function normalizeRepoPath(file: string): string {
  return file.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function classifyPathSensitivity(file: string): ArtifactSensitivity {
  const path = normalizeRepoPath(file);
  const security = SECURITY_SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path));
  const release = RELEASE_SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path));
  if (security && release) return "SECURITY_SENSITIVE";
  if (security) return "SECURITY_SENSITIVE";
  if (release) return "RELEASE_SENSITIVE";
  return "NOT_SENSITIVE";
}

export function classifyChangedFiles(files: readonly string[]): {
  releaseSensitiveFiles: string[];
  securitySensitiveFiles: string[];
  releaseSensitiveFilesChanged: boolean;
  securitySensitiveFilesChanged: boolean;
  capabilityManifestChanged: boolean;
} {
  const releaseSensitiveFiles = files.filter((file) => {
    const cls = classifyPathSensitivity(file);
    return cls === "RELEASE_SENSITIVE" || CANONICAL_CAPABILITY_MANIFEST_PATHS.includes(normalizeRepoPath(file) as (typeof CANONICAL_CAPABILITY_MANIFEST_PATHS)[number]);
  });
  const securitySensitiveFiles = files.filter((file) => classifyPathSensitivity(file) === "SECURITY_SENSITIVE");
  const capabilityManifestChanged = files.some((file) =>
    CANONICAL_CAPABILITY_MANIFEST_PATHS.includes(normalizeRepoPath(file) as (typeof CANONICAL_CAPABILITY_MANIFEST_PATHS)[number]),
  );
  if (capabilityManifestChanged && !releaseSensitiveFiles.some((file) => normalizeRepoPath(file).endsWith("capability.ts") || normalizeRepoPath(file).endsWith("manifest.ts"))) {
    throw new Error("canonical capability manifest change must be classified release-sensitive");
  }
  return {
    releaseSensitiveFiles: [...new Set(releaseSensitiveFiles.map(normalizeRepoPath))],
    securitySensitiveFiles: [...new Set(securitySensitiveFiles.map(normalizeRepoPath))],
    releaseSensitiveFilesChanged: capabilityManifestChanged || releaseSensitiveFiles.length > 0,
    securitySensitiveFilesChanged: securitySensitiveFiles.length > 0,
    capabilityManifestChanged,
  };
}

/** R4 anchorage authority commit 318cbbca. The profile and rule file was omitted from that phase's reported release-sensitive list. */
export const R4_ANCHORAGE_AUTHORITY_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C8_R4_ANCHORAGE_AUTHORITY.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/d1e-closeout/matrix.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c8-r3.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c8-r4.test.ts",
  "packages/engineering-os/src/structural-concrete/eu-c8/anchorage-profile.ts",
  "packages/engineering-os/src/structural-concrete/eu-c8/index.ts",
] as const;

/** R5 lap authority decision record. No runtime method is registered. */
export const R5_LAP_AUTHORITY_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C8_R5_LAPS_AUTHORITY.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/d1e-closeout/matrix.ts",
  "packages/engineering-os/src/structural-concrete/eu-c8/lap-authority.ts",
] as const;

/** R6 C8 closeout. No new runtime method is registered. */
export const R6_C8_CLOSEOUT_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C8_R6_CLOSEOUT.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/d1e-closeout/matrix.ts",
  "packages/engineering-os/src/structural-concrete/eu-c8/closeout.ts",
] as const;

/** R1 C9 member-orchestration foundation. No member runtime is registered. */
export const R9_C9_FOUNDATION_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R1_MEMBER_ORCHESTRATION_FOUNDATION.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/foundation.ts",
] as const;

/** R6 C9 member-orchestration closeout. No new engineering formula is registered. */
/** R1 C10 independent-validation readiness. No engineering formula is registered. */
/** R2 C10 independent benchmark evidence. No engineering formula is registered. */
/** D1F-0 structural systems architecture. No solver or design formula is registered. */
export const D1F_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_0_STRUCTURAL_SYSTEMS_ARCHITECTURE.md",
  "packages/types/src/structural-systems.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/contract.ts",
  "packages/engineering-os/src/structural-systems/fingerprint.ts",
  "packages/engineering-os/src/structural-systems/formula-scan.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-0.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R1 structural-system topology runtime. No solver or design formula is registered. */
export const D1F_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R1_STRUCTURAL_SYSTEM_CONTEXT_TOPOLOGY.md",
  "packages/types/src/structural-systems-r1.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/runtime.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r1.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R2 analysis-result and member-action binding. No solver or design formula is registered. */
export const D1F_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R2_ANALYSIS_RESULT_CONTRACT_MEMBER_ACTION_BINDING.md",
  "packages/types/src/structural-systems-r2.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/result-binding.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r2.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R3 system-to-member evaluation. No solver or new design formula is registered. */
export const D1F_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R3_SYSTEM_TO_MEMBER_EVALUATION_ORCHESTRATION.md",
  "packages/types/src/structural-systems-r3.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/system-evaluation.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r3.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R4 connection and joint interface. No connection design formula is registered. */
export const D1F_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R4_CONNECTION_JOINT_INTERFACE_FOUNDATION.md",
  "packages/types/src/structural-systems-r4.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/connection-interface.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r4.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R5 foundation and support interface. No foundation or geotechnical design formula is registered. */
export const D1F_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R5_FOUNDATION_SUPPORT_INTERFACE_FOUNDATION.md",
  "packages/types/src/structural-systems-r5.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/foundation-interface.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r5.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1F-R6 structural systems closeout. No new engineering formula is registered. */
export const D1F_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1F_R6_STRUCTURAL_SYSTEMS_CLOSEOUT.md",
  "packages/types/src/structural-systems-r6.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/closeout.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1f-r6.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1G-R1 provider-neutral solver adapter. No commercial connector or solver is registered. */
export const D1G_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1G_R1_PROVIDER_NEUTRAL_SOLVER_ADAPTER_FOUNDATION.md",
  "packages/types/src/structural-systems-d1g-r1.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/solver-adapter.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r1.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1G-R2 provider-neutral result package ingestion. No commercial connector or solver is registered. */
export const D1G_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1G_R2_PROVIDER_NEUTRAL_RESULT_PACKAGE_INGESTION.md",
  "packages/types/src/structural-systems-d1g-r2.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/result-package.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json",
  "packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.example.json",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r2.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1G-R3 first provider selection. No commercial connector runtime is registered. */
export const D1G_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1G_R3_PROVIDER_SELECTION_FIRST_CONNECTOR_ARCHITECTURE.md",
  "packages/types/src/structural-systems-d1g-r3.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/provider-selection.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r3-provider-selection.json",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r3.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** D1G-R4 SPACE GASS read-only connector. No solver execution is registered. */
export const D1G_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1G_R4_SPACE_GASS_READ_ONLY_CONNECTOR_IMPLEMENTATION.md",
  "packages/types/src/structural-systems-d1g-r4.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/space-gass-transport.ts",
  "packages/engineering-os/src/structural-systems/space-gass-mapping.ts",
  "packages/engineering-os/src/structural-systems/space-gass-connector.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r4.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1G_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1G_R5_SPACE_GASS_CONNECTOR_HARDENING_AND_D1G_CLOSEOUT.md",
  "docs/architecture/engineering-os/EOS_D1G_R4_SPACE_GASS_READ_ONLY_CONNECTOR_IMPLEMENTATION.md",
  "packages/types/src/structural-systems-d1g-r5.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/space-gass-transport.ts",
  "packages/engineering-os/src/structural-systems/space-gass-mapping.ts",
  "packages/engineering-os/src/structural-systems/space-gass-connector.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r4.test.ts",
  "packages/engineering-os/src/structural-systems/eos-d1g-r5.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_0_STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/types/src/structural-inspection-d1h-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-0.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_R1_STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/inspection-evidence.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r1.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_R2_STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_FOUNDATION.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/inspection-evidence.ts",
  "packages/engineering-os/src/structural-systems/inspection-finding.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r1.test.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r2.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_R3_CONDITION_STATE_RATING_INTERPRETATION.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/inspection-condition.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r3.test.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r1.test.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r2.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_R4_TEMPORAL_HISTORY_ASSOCIATION_ANALYSIS_LINKAGE.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/inspection-temporal.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r4.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1H_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1H_R5_STRUCTURAL_INSPECTION_CONDITION_CLOSEOUT.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/inspection-condition.ts",
  "packages/engineering-os/src/structural-systems/inspection-temporal.ts",
  "packages/engineering-os/src/structural-systems/inspection-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-d1h-r5.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_R5_STRUCTURAL_DIGITAL_TWIN_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/twin-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/twin-monitoring-reference.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-monitoring.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_R4_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE.md",
  "packages/engineering-os/src/structural-systems/twin-monitoring-reference.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-monitoring.test.ts",
  "packages/engineering-os/src/structural-systems/twin-reference-foundation.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_R3_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION.md",
  "packages/engineering-os/src/structural-systems/twin-conflict-composition.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-conflict.test.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-temporal.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_R2_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_STATE_GOVERNANCE.md",
  "packages/engineering-os/src/structural-systems/twin-temporal-governance.ts",
  "packages/engineering-os/src/structural-systems/twin-reference-foundation.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-temporal.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_R1_TWIN_IDENTITY_STATE_REFERENCE_FOUNDATION.md",
  "packages/engineering-os/src/structural-systems/twin-reference-foundation.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-reference.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_R5_STRUCTURAL_OPTIMIZATION_CERTIFICATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/optimization-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_R4_CERTIFICATION_EVIDENCE_READINESS_GATE.md",
  "packages/engineering-os/src/structural-systems/certification-readiness-gate.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-readiness.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_R3_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION.md",
  "packages/engineering-os/src/structural-systems/candidate-composition.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-composition.test.ts",
  "packages/engineering-os/src/structural-systems/objective-constraint-foundation.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_R2_OBJECTIVE_CONSTRAINT_FEASIBILITY_REFERENCE_FOUNDATION.md",
  "packages/engineering-os/src/structural-systems/objective-constraint-foundation.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-reference.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_R1_OPTIMIZATION_PROBLEM_BASELINE_VARIABLE_FOUNDATION.md",
  "packages/engineering-os/src/structural-systems/optimization-problem-foundation.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-foundation.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md",
  "packages/types/src/structural-cad-bim-d1m-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-architecture.test.ts",
  "packages/engineering-os/src/structural-systems/eos-post-d1l-roadmap.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-source-revision.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-source-revision.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-object-mapping.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-object-mapping.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-model-evidence.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-model-evidence.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-reference-context.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-reference-context.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-model-relationship.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-model-relationship.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R6_FILE_API_ADAPTER_BOUNDARY_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-adapter-boundary.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-adapter-boundary.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R7_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R7_CHANGE_STALENESS_SUPERSESSION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-change-governance.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-change-governance.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R8_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R8_D1K_D1L_D1N_EVIDENCE_HANDOFF_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-evidence-handoff.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-evidence-handoff.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1M_R9_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1M_R9_CAD_OR_BIM_INTELLIGENCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/cad-bim-intelligence-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-cad-bim-intelligence-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_FOUNDATIONS_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_FOUNDATIONAL_ARCHITECTURE_DECISIONS.md",
  "packages/engineering-os/src/structural-systems/d1n-foundational-decisions.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-foundational-decisions.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D5_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D5_R2_PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/piping/system-line-service-context.ts",
  "packages/engineering-os/src/piping/eos-d5-r2-piping-system-line-service.test.ts",
  "packages/engineering-os/src/piping/eos-d5-r1-piping-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D5_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D5_R1_PIPING_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/piping/identity-foundation.ts",
  "packages/engineering-os/src/piping/eos-d5-r1-piping-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d5-0-piping-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D5_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D5_0_PIPING_ARCHITECTURE.md",
  "docs/architecture/engineering-os/EOS_D5_0_PIPING_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md",
  "packages/types/src/piping-architecture-d5-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d5-0-piping-architecture.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r12-mechanical-bounded-closeout.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R12_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R12_MECHANICAL_BOUNDED_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/mechanical-bounded-closeout.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r12-mechanical-bounded-closeout.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R11_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/d9-source-contract.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R10_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/currentness-digital-thread.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r9-review-and-validation-governance.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R9_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/review-validation-governance.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r9-review-and-validation-governance.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r8-discipline-interfaces-and-handoffs.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R8_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/discipline-interfaces-handoffs.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r8-discipline-interfaces-and-handoffs.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r7-requirements-assumptions-and-change.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R7_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/requirements-assumptions-change.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r7-requirements-assumptions-and-change.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r6-maintainability-access-and-package-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R6_MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/maintainability-access-package-context.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r6-maintainability-access-and-package-context.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r5-mechanical-requirements-and-technical-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R5_MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/mechanical-technical-context.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r5-mechanical-requirements-and-technical-context.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r4-vendor-data-and-evidence-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R4_VENDOR_DATA_AND_EVIDENCE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/vendor-data-evidence-context.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r4-vendor-data-and-evidence-context.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r3-design-conditions-and-performance-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R3_DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/design-condition-performance-context.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r3-design-conditions-and-performance-context.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r2-equipment-and-system-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R2_EQUIPMENT_AND_SYSTEM_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/equipment-system-context.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r2-equipment-and-system-context.test.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r1-mechanical-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_R1_MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/mechanical/identity-foundation.ts",
  "packages/engineering-os/src/mechanical/eos-d4-r1-mechanical-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d4-0-mechanical-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D4_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D4_0_MECHANICAL_ARCHITECTURE.md",
  "packages/types/src/mechanical-architecture-d4-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d4-0-mechanical-architecture.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r12-geotechnical-bounded-closeout.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R12_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R12_GEOTECHNICAL_BOUNDED_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/geotechnical-bounded-closeout.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r12-geotechnical-bounded-closeout.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R11_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/d9-source-contract.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R10_CHANGED_FILES = [
  "apps/web/package.json",
  "docs/architecture/engineering-os/EOS_D3_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
  "packages/engineering-os/package.json",
  "packages/engineering-os/src/geotechnical/currentness-digital-thread.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r9-review-validation-governance.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/platform-commerce/package.json",
  "packages/platform-core/package.json",
  "packages/platform-intelligence/package.json",
  "packages/platform-kernel/package.json",
  "packages/platform-kernel/src/event-bus/event-bus.ts",
  "packages/platform-kernel/src/event-bus/event-bus.zod.test.ts",
  "packages/plugin-sdk/package.json",
  "packages/plugin-sdk/src/index.ts",
  "packages/plugin-sdk/src/manifest.zod.test.ts",
  "packages/plugin-sdk/tsconfig.json",
  "packages/project-intelligence/package.json",
  "packages/project-intelligence/src/documents/types.zod.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
  "pnpm-lock.yaml",
] as const;

export const D3_R9_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/review-validation-governance.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r9-review-validation-governance.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r8-discipline-interfaces-handoffs.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R8_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/discipline-interfaces-handoffs.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r8-discipline-interfaces-handoffs.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r7-requirements-assumptions-change.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R7_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/requirements-assumptions-change.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r7-requirements-assumptions-change.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r6-foundation-excavation-slope-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R6_FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/foundation-excavation-slope-context.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r6-foundation-excavation-slope-context.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r5-geotechnical-parameter-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R5_GEOTECHNICAL_PARAMETER_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/geotechnical-parameter-context.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r5-geotechnical-parameter-context.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r4-field-lab-test-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R4_FIELD_AND_LAB_TEST_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/field-lab-test-context.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r4-field-lab-test-context.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r3-stratigraphy-groundwater-material.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R3_STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/stratigraphy-groundwater-material.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r3-stratigraphy-groundwater-material.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r2-site-investigation-evidence.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R2_SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/site-investigation-evidence.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r2-site-investigation-evidence.test.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r1-geotechnical-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_R1_GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/geotechnical/identity-foundation.ts",
  "packages/engineering-os/src/geotechnical/eos-d3-r1-geotechnical-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d3-0-geotechnical-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D3_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D3_0_GEOTECHNICAL_ARCHITECTURE.md",
  "packages/types/src/geotechnical-architecture-d3-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d3-0-geotechnical-architecture.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r12-civil-bounded-closeout.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R12_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R12_CIVIL_BOUNDED_CLOSEOUT.md",
  "packages/engineering-os/src/civil/civil-bounded-closeout.ts",
  "packages/engineering-os/src/civil/eos-d2-r12-civil-bounded-closeout.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R11_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/d9-source-contract.ts",
  "packages/engineering-os/src/civil/eos-d2-r11-d9-source-contract.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R10_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md",
  "packages/engineering-os/src/civil/currentness-digital-thread.ts",
  "packages/engineering-os/src/civil/eos-d2-r10-currentness-digital-thread.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r9-review-validation-governance.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R9_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/civil/review-validation-governance.ts",
  "packages/engineering-os/src/civil/eos-d2-r9-review-validation-governance.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r8-discipline-interfaces-handoffs.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R8_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md",
  "packages/engineering-os/src/civil/discipline-interfaces-handoffs.ts",
  "packages/engineering-os/src/civil/eos-d2-r8-discipline-interfaces-handoffs.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r7-requirements-assumptions-change.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R7_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md",
  "packages/engineering-os/src/civil/requirements-assumptions-change.ts",
  "packages/engineering-os/src/civil/eos-d2-r7-requirements-assumptions-change.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r6-utility-corridor-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R6_CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/utility-corridor-context.ts",
  "packages/engineering-os/src/civil/eos-d2-r6-utility-corridor-context.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r5-drainage-stormwater-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R5_DRAINAGE_AND_STORMWATER_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/drainage-stormwater-context.ts",
  "packages/engineering-os/src/civil/eos-d2-r5-drainage-stormwater-context.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r4-roads-access-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R4_ROADS_AND_ACCESS_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/roads-access-context.ts",
  "packages/engineering-os/src/civil/eos-d2-r4-roads-access-context.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r3-grading-earthworks-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R3_GRADING_AND_EARTHWORKS_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/grading-earthworks-context.ts",
  "packages/engineering-os/src/civil/eos-d2-r3-grading-earthworks-context.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r2-spatial-surface-context.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R2_SURVEY_SPATIAL_AND_SURFACE_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/civil/spatial-surface-context.ts",
  "packages/engineering-os/src/civil/eos-d2-r2-spatial-surface-context.test.ts",
  "packages/engineering-os/src/civil/eos-d2-r1-civil-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_R1_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/civil/identity-foundation.ts",
  "packages/engineering-os/src/civil/eos-d2-r1-civil-identity.test.ts",
  "packages/engineering-os/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d2-0-civil-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D2_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D2_0_CIVIL_ARCHITECTURE.md",
  "packages/types/src/civil-architecture-d2-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d2-0-civil-architecture.test.ts",
  "packages/engineering-os/src/structural-systems/eos-d1-structural-pack-sequencing.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1_STRUCTURAL_PACK_SEQUENCING_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_PACK_COMPLETION_CRITERIA_AND_ROADMAP_SEQUENCING.md",
  "packages/engineering-os/src/structural-systems/structural-pack-sequencing.ts",
  "packages/engineering-os/src/structural-systems/eos-d1-structural-pack-sequencing.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R9_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R9_CONCEPT_TO_DETAILED_ORCHESTRATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/orchestration-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r9-orchestration-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R8_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R8_D1M_D1K_D1L_HANDOFF_INTEGRATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/handoff-integration.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r8-handoff-integration.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R7_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R7_CURRENTNESS_STALENESS_AND_REASSESSMENT_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/currentness-reassessment.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r7-currentness-reassessment.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R6_ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/alternative-branch.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r6-alternative-design-branch.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R5_HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/human-decision-record.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r5-human-decision-review.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R4_STAGE_TRANSITION_REQUEST_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/stage-transition-request.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r4-stage-transition-request.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R3_PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/prerequisite-assessment.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r3-prerequisite-assessment.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R2_DESIGN_PROGRESSION_CONTEXT_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/design-progression-context.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r2-design-progression-context.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_R1_ORCHESTRATION_IDENTITY_AND_STATE_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/orchestration-context.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-r1-orchestration-context.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1N_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1N_0_CONCEPT_TO_DETAILED_ORCHESTRATION_ARCHITECTURE.md",
  "packages/types/src/structural-orchestration-d1n-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-d1n-0-orchestration-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const POST_D1L_ROADMAP_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_POST_D1L_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/post-d1l-roadmap.ts",
  "packages/engineering-os/src/structural-systems/eos-post-d1l-roadmap.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R6_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R6_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-gate-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R5_EVIDENCE_INVALIDATION_SUPERSESSION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-lifecycle.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-lifecycle.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R4_CERTIFICATION_AUTHORITY_DECISION_RECORD_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-decision.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-decision.test.ts",
  "packages/engineering-os/src/structural-systems/certification-eligibility.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R3_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-profile-governance.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-profile-governance.test.ts",
  "packages/engineering-os/src/structural-systems/certification-eligibility.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R2_ELIGIBILITY_BLOCKER_EVALUATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-eligibility.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-eligibility.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_R1_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/certification-claim-manifest.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-manifest.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1L_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1L_0_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE.md",
  "packages/types/src/structural-certification-d1l-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-certification-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_R5_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_R5_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/interface-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_R4_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_R4_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/interface-reference-composition.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-composition.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_R3_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_R3_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/interface-handoff-governance.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-lifecycle.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/interface-compatibility.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-compatibility.test.ts",
  "packages/engineering-os/src/structural-demand/units.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md",
  "packages/engineering-os/src/structural-systems/interface-identity-foundation.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-foundation.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1K_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md",
  "packages/types/src/structural-interfaces-d1k-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-interface-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1J_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1J_0_STRUCTURAL_OPTIMIZATION_CERTIFICATION_ARCHITECTURE.md",
  "packages/types/src/structural-optimization-d1j-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-optimization-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const D1I_0_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1I_0_STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE.md",
  "docs/architecture/engineering-os/EOS_POST_D1H_CANONICAL_ROADMAP.md",
  "packages/types/src/structural-digital-twin-d1i-0.ts",
  "packages/types/src/index.ts",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-systems/eos-structural-twin-architecture.test.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const POST_D1J_ROADMAP_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/post-d1j-roadmap.ts",
  "packages/engineering-os/src/structural-systems/eos-post-d1j-roadmap.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const POST_D1I_ROADMAP_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_POST_D1I_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/roadmap-after-twin-closeout.ts",
  "packages/engineering-os/src/structural-systems/eos-roadmap-after-twin-closeout.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

export const POST_D1H_ROADMAP_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_POST_D1H_CANONICAL_ROADMAP.md",
  "docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md",
  "packages/engineering-os/src/structural-systems/post-d1h-roadmap.ts",
  "packages/engineering-os/src/structural-systems/eos-post-d1h-roadmap.test.ts",
  "packages/engineering-os/src/structural-systems/index.ts",
  "packages/release-governance/src/artifact-classification.ts",
  "packages/release-governance/src/artifact-classification.test.ts",
] as const;

/** R3A C10 engineer review-pack preparation. No engineering formula is registered. */
export const R10_C10_R3A_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C10_R3A_ENGINEER_REVIEW_PACK_PREPARATION.md",
  "docs/architecture/engineering-os/eu-c10/review-packs/REVIEW_TEMPLATE.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c10/readiness.ts",
  "packages/engineering-os/src/structural-concrete/eu-c10/review-packs.ts",
] as const;

export const R10_C10_R2_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C10_R2_METHOD_MEMBER_BENCHMARKS.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts",
  "packages/engineering-os/src/structural-concrete/eu-c10/readiness.ts",
] as const;

export const R10_C10_R1_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C10_R1_INDEPENDENT_VALIDATION_READINESS.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c10/readiness.ts",
] as const;

export const R9_C9_CLOSEOUT_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R6_CLOSEOUT.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/closeout.ts",
] as const;

/** R5 bounded wall-section orchestrator. No new engineering formula is registered. */
export const R9_C9_WALL_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R5_WALL_ORCHESTRATION.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/wall.ts",
] as const;

/** R4 bounded solid-slab orchestrator. No new engineering formula is registered. */
export const R9_C9_SLAB_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R4_SOLID_SLAB_ORCHESTRATION.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/slab.ts",
] as const;

/** R3 bounded column orchestrator. No new engineering formula is registered. */
export const R9_C9_COLUMN_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R3_COLUMN_ORCHESTRATION.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/column.ts",
] as const;

/** R2 bounded beam orchestrator. No new engineering formula is registered. */
export const R9_C9_BEAM_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C9_R2_BEAM_ORCHESTRATION.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eu-c9/beam.ts",
] as const;

/** R1 commit range 5fca4aa8..9d208dce — used to prove the historical classifier gap is now closed. */
export const R1_COMMIT_CHANGED_FILES = [
  "docs/architecture/engineering-os/EOS_D1E_EU_C1_MATERIAL_RULES.md",
  "packages/engineering-os/src/structural-concrete/capability.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-closeout.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c1.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c1a.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c1c-evidence.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c1c-r1.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-eu-c1c.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-us1.test.ts",
  "packages/engineering-os/src/structural-concrete/eos-d1e-us2.test.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/authority.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/evaluate.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/evidence.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/golden.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/index.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/invalidation.ts",
  "packages/engineering-os/src/structural-concrete/eu-c1c-r1/units.ts",
  "packages/engineering-os/src/structural-concrete/index.ts",
  "packages/types/src/index.ts",
  "packages/types/src/structural-concrete-eu-c1c-r1.ts",
  "packages/types/src/structural-concrete.ts",
] as const;
