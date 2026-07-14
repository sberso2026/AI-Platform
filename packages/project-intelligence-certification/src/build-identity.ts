import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createHash as createFileHash } from "node:crypto";
import { resolve } from "node:path";

export interface BuildIdentity {
  packageName: "@rtb/project-intelligence-certification";
  commitSha: string;
  buildTimestamp: string;
  token: string;
  branch: string;
  workingTreeClean: boolean;
  repository: string | null;
  nodeVersion: string;
  pnpmVersion: string | null;
  runnerOs: string;
  migrationChecksums: Record<string, string>;
}

function git(root: string, args: string[]): string | null {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

function migrationChecksums(root: string): Record<string, string> {
  const files = [
    "20260712000000_batch_34_project_intelligence_mappings.sql",
    "20260712120000_batch_35_pi_mapping_identity_immutable.sql",
    "20260712180000_batch_36_project_intelligence_documents.sql",
    "20260712200000_batch_37_project_intelligence_document_runtime.sql",
    "20260712201000_batch_37b_project_intelligence_document_search.sql",
    "20260712202000_batch_37c_enqueue_tenant_guard.sql",
    "20260712203000_batch_37d_set_embedding_vector.sql",
    "20260712204000_batch_37e_ensure_core_document.sql",
    "20260713120000_batch_38_project_intelligence_meeting_foundation.sql",
    "20260714120000_batch_39_project_intelligence_meeting_processing.sql",
  ];
  const result: Record<string, string> = {};
  for (const file of files) {
    const migration = resolve(root, "supabase/migrations", file);
    if (!existsSync(migration)) continue;
    const hash = createFileHash("sha256");
    hash.update(readFileSync(migration));
    result[file] = hash.digest("hex");
  }
  return result;
}

export function createBuildIdentity(
  commitSha = process.env.GITHUB_SHA ?? "local",
  buildTimestamp = new Date().toISOString(),
  root = resolve(process.cwd(), "../.."),
): BuildIdentity {
  const token = createHash("sha256").update(`project-intelligence:${commitSha}:${buildTimestamp}`).digest("hex");
  let pnpmVersion: string | null = null;
  try {
    pnpmVersion = execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim();
  } catch {
    // This is recorded as null and rejected by the certification runner.
  }
  return {
    packageName: "@rtb/project-intelligence-certification",
    commitSha: commitSha === "local" ? git(root, ["rev-parse", "HEAD"]) ?? "unknown" : commitSha,
    buildTimestamp,
    token,
    branch: git(root, ["branch", "--show-current"]) ?? "unknown",
    workingTreeClean: git(root, ["status", "--porcelain"]) === "",
    repository: git(root, ["config", "--get", "remote.origin.url"]),
    nodeVersion: process.version,
    pnpmVersion,
    runnerOs: process.env.RUNNER_OS ?? process.platform,
    migrationChecksums: migrationChecksums(root),
  };
}
