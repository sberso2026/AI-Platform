/**
 * Artifact handling — Platform Files refs only; no second blob store.
 */

export type PlatformFileArtifactRef = {
  platformFileRef: string;
  role: "input" | "output" | "log" | "evidence";
  contentType?: string;
  /** Never inline proprietary model payloads. */
  inlinePayloadForbidden: true;
};

export type JobArtifactBinding = {
  jobId: string;
  artifactId: string;
  ref: PlatformFileArtifactRef;
  createdAt: string;
};

export function createPlatformFileArtifactRef(input: {
  platformFileRef: string;
  role: PlatformFileArtifactRef["role"];
  contentType?: string;
}): PlatformFileArtifactRef {
  if (!input.platformFileRef.trim()) {
    throw new Error("platform_file_ref_required");
  }
  return {
    platformFileRef: input.platformFileRef.trim(),
    role: input.role,
    contentType: input.contentType,
    inlinePayloadForbidden: true,
  };
}

export function bindJobArtifact(input: {
  jobId: string;
  artifactId: string;
  platformFileRef: string;
  role: PlatformFileArtifactRef["role"];
  contentType?: string;
}): JobArtifactBinding {
  return {
    jobId: input.jobId,
    artifactId: input.artifactId,
    ref: createPlatformFileArtifactRef(input),
    createdAt: new Date().toISOString(),
  };
}
