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
  const migration = resolve(root, "supabase/migrations/20260712000000_batch_34_project_intelligence_mappings.sql");
  if (!existsSync(migration)) return {};
  const hash = createFileHash("sha256");
  // Keep this synchronous artifact helper deterministic and avoid a process-level file cache.
  const content = readFileSync(migration);
  hash.update(content);
  return { "20260712000000_batch_34_project_intelligence_mappings.sql": hash.digest("hex") };
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
