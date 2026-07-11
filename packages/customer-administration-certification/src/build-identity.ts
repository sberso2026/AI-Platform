import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { resolveTestBaseUrl } from "./lib/env.js";

export interface BuildIdentityPayload {
  commitSha: string;
  branch: string;
  dirty: boolean;
  workingTreeClean: boolean;
  changedFiles: string[];
  packageVersion: string;
  buildTimestamp: string;
  buildIdentityToken: string;
  migrationChecksums: Record<string, string>;
  supabaseProjectRef: string | null;
  repositoryUrl: string | null;
  certificationTarget: string | null;
  nodeVersion: string;
  pnpmVersion: string | null;
  runnerOs: string;
}

export function resolveLocalCommitSha(root: string): string {
  return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
}

export async function verifyBuildIdentity(
  root: string,
  baseUrlOverride?: string,
  options?: { allowDirtyOverride?: boolean; requireCleanForRelease?: boolean }
): Promise<{ ok: boolean; payload?: BuildIdentityPayload; error?: string }> {
  const expected = resolveLocalCommitSha(root);
  const base = (baseUrlOverride ?? resolveTestBaseUrl()).replace(/\/$/, "");
  const res = await fetch(`${base}/api/platform/build-identity`);
  if (!res.ok) return { ok: false, error: `status ${res.status}` };
  const payload = (await res.json()) as BuildIdentityPayload;
  if (payload.commitSha !== expected) {
    return { ok: false, payload, error: `SHA mismatch ${payload.commitSha} vs ${expected}` };
  }
  if (!payload.workingTreeClean && options?.requireCleanForRelease) {
    return {
      ok: false,
      payload,
      error: "Server reports dirty working tree (release check requires clean tree)",
    };
  }
  if (!payload.workingTreeClean && !options?.allowDirtyOverride) {
    return { ok: false, payload, error: "Server reports dirty working tree" };
  }
  return { ok: true, payload };
}
