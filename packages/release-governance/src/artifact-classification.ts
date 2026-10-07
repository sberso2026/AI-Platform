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
];

const SECURITY_SENSITIVE_PATH_PATTERNS: readonly RegExp[] = [
  /security-definer/i,
  /rtb-sec-rls/i,
  /service-guard/i,
  /secret-scan/i,
  /RLS/i,
  /docs\/security\//,
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
