import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { resolveTestBaseUrl } from "./lib/env.js";

export interface BuildIdentityPayload {
  commitSha: string;
  branch: string;
  dirty: boolean;
  changedFiles: string[];
  packageVersion: string;
  buildTimestamp: string;
  buildIdentityToken: string;
  migrationChecksums: Record<string, string>;
  supabaseProjectRef: string | null;
}

export interface BuildIdentityResult {
  ok: boolean;
  payload?: BuildIdentityPayload;
  expectedSha?: string;
  error?: string;
}

export function resolveLocalCommitSha(root: string): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export async function verifyBuildIdentity(
  root: string,
  baseUrlOverride?: string
): Promise<BuildIdentityResult> {
  const expectedSha = resolveLocalCommitSha(root);
  if (expectedSha === "unknown") {
    return { ok: false, expectedSha, error: "Local git SHA is unknown" };
  }

  const base = (baseUrlOverride ?? resolveTestBaseUrl()).replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${base}/api/platform/build-identity`, {
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    return {
      ok: false,
      expectedSha,
      error: `build-identity fetch failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      expectedSha,
      error: `build-identity returned ${response.status}`,
    };
  }

  const payload = (await response.json()) as BuildIdentityPayload;
  if (!payload.commitSha || payload.commitSha === "unknown") {
    return {
      ok: false,
      expectedSha,
      payload,
      error: "Server commitSha is unknown",
    };
  }

  if (payload.commitSha !== expectedSha) {
    return {
      ok: false,
      expectedSha,
      payload,
      error: `SHA mismatch: server=${payload.commitSha} local=${expectedSha}`,
    };
  }

  return { ok: true, expectedSha, payload };
}
