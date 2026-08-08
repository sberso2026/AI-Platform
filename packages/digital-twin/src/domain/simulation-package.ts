/**
 * Phase 12H — TwinSimulationPackage + manifest + integrity + completeness.
 */

import { createHash } from "node:crypto";
import type { SimulationArtifactClass } from "./simulation-method-qualification";

export const PACKAGE_STATUSES = [
  "draft",
  "assembled",
  "sealed",
  "superseded",
  "archived",
] as const;

export type PackageStatus = (typeof PACKAGE_STATUSES)[number];

export type SimulationPackageArtifactRef = {
  artifactId: string;
  artifactClass: SimulationArtifactClass;
  /** Platform Files reference only — no binary payload. */
  fileId: string;
  contentHash: string;
  label?: string;
};

export type SimulationPackageManifest = {
  manifestSchema: "simulation-package-manifest.json";
  packageId: string;
  packageVersionId: string;
  version: number;
  methodId: string;
  providerId: string;
  applicationKey?: string;
  twinId: string;
  runId?: string;
  resultId?: string;
  artifactRefs: SimulationPackageArtifactRef[];
  requiredArtifactClasses: SimulationArtifactClass[];
  createdAt: string;
  claimsNativeSolver: false;
  storesBinaryPayload: false;
};

export type TwinSimulationPackage = {
  packageId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  packageKey: string;
  status: PackageStatus;
  methodId: string;
  providerId: string;
  applicationKey?: string;
  currentVersion: number;
  manifest: SimulationPackageManifest;
  reviewSlug: "digital_twin.simulation_package_review";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type SimulationPackageVersion = {
  packageVersionId: string;
  packageId: string;
  version: number;
  manifest: SimulationPackageManifest;
  sealedAt?: string;
  createdAt: string;
};

export type SimulationPackageIntegrityRecord = {
  integrityId: string;
  packageId: string;
  packageVersionId: string;
  expectedManifestHash: string;
  observedManifestHash: string;
  hashMismatch: boolean;
  checkedAt: string;
};

export function createSimulationPackageManifest(input: {
  packageId: string;
  packageVersionId: string;
  version: number;
  methodId: string;
  providerId: string;
  twinId: string;
  applicationKey?: string;
  runId?: string;
  resultId?: string;
  artifactRefs: SimulationPackageArtifactRef[];
  requiredArtifactClasses: SimulationArtifactClass[];
}): SimulationPackageManifest {
  for (const a of input.artifactRefs) {
    if (!a.fileId.startsWith("platform-files:") && !a.fileId.includes("/")) {
      // allow any fileId string that is a reference — forbid embedded payloads
    }
    if ("binary" in (a as object) || "payload" in (a as object)) {
      throw new Error("package_artifact_must_be_file_ref_only");
    }
  }
  return {
    manifestSchema: "simulation-package-manifest.json",
    packageId: input.packageId,
    packageVersionId: input.packageVersionId,
    version: input.version,
    methodId: input.methodId,
    providerId: input.providerId,
    applicationKey: input.applicationKey,
    twinId: input.twinId,
    runId: input.runId,
    resultId: input.resultId,
    artifactRefs: input.artifactRefs,
    requiredArtifactClasses: input.requiredArtifactClasses,
    createdAt: new Date().toISOString(),
    claimsNativeSolver: false,
    storesBinaryPayload: false,
  };
}

export function hashSimulationPackageManifest(manifest: SimulationPackageManifest): string {
  return createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
}

export function createTwinSimulationPackage(input: {
  packageId: string;
  packageVersionId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  packageKey: string;
  methodId: string;
  providerId: string;
  applicationKey?: string;
  artifactRefs?: SimulationPackageArtifactRef[];
  requiredArtifactClasses: SimulationArtifactClass[];
  runId?: string;
  resultId?: string;
  createdBy?: string;
}): TwinSimulationPackage {
  const now = new Date().toISOString();
  const manifest = createSimulationPackageManifest({
    packageId: input.packageId,
    packageVersionId: input.packageVersionId,
    version: 1,
    methodId: input.methodId,
    providerId: input.providerId,
    twinId: input.twinId,
    applicationKey: input.applicationKey,
    runId: input.runId,
    resultId: input.resultId,
    artifactRefs: input.artifactRefs ?? [],
    requiredArtifactClasses: input.requiredArtifactClasses,
  });
  return {
    packageId: input.packageId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    packageKey: input.packageKey,
    status: "draft",
    methodId: input.methodId,
    providerId: input.providerId,
    applicationKey: input.applicationKey,
    currentVersion: 1,
    manifest,
    reviewSlug: "digital_twin.simulation_package_review",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function assessPackageCompleteness(pkg: TwinSimulationPackage): {
  complete: boolean;
  missing: SimulationArtifactClass[];
  methodSpecific: true;
} {
  const present = new Set(pkg.manifest.artifactRefs.map((a) => a.artifactClass));
  const missing = pkg.manifest.requiredArtifactClasses.filter((c) => !present.has(c));
  return { complete: missing.length === 0, missing, methodSpecific: true };
}

export function verifyPackageIntegrity(input: {
  integrityId: string;
  packageId: string;
  packageVersionId: string;
  expectedManifestHash: string;
  manifest: SimulationPackageManifest;
}): SimulationPackageIntegrityRecord {
  const observed = hashSimulationPackageManifest(input.manifest);
  return {
    integrityId: input.integrityId,
    packageId: input.packageId,
    packageVersionId: input.packageVersionId,
    expectedManifestHash: input.expectedManifestHash,
    observedManifestHash: observed,
    hashMismatch: observed !== input.expectedManifestHash,
    checkedAt: new Date().toISOString(),
  };
}

export function sealSimulationPackage(pkg: TwinSimulationPackage): TwinSimulationPackage {
  const completeness = assessPackageCompleteness(pkg);
  if (!completeness.complete) {
    throw new Error(`package_incomplete:${completeness.missing.join(",")}`);
  }
  if (pkg.manifest.claimsNativeSolver || pkg.manifest.storesBinaryPayload) {
    throw new Error("package_forbidden_claims");
  }
  return {
    ...pkg,
    status: "sealed",
    updatedAt: new Date().toISOString(),
  };
}
