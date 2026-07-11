import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

const REPO_ROOT = resolve(process.cwd(), "../..");

function gitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function gitBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function changedFiles(): string[] {
  try {
    return execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((line) => {
        const path = line.length > 3 ? line.slice(3).trim() : line.trim();
        return (
          !path.includes("/artifacts/") &&
          !path.includes("\\artifacts\\") &&
          !path.includes("test-results") &&
          !path.endsWith(".png")
        );
      });
  } catch {
    return [];
  }
}

function workingTreeDirty(): boolean {
  return changedFiles().length > 0;
}

function migrationChecksums(): Record<string, string> {
  const dir = resolve(REPO_ROOT, "supabase/migrations");
  const out: Record<string, string> = {};
  if (!existsSync(dir)) return out;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql"))) {
    const content = readFileSync(resolve(dir, file), "utf8");
    out[file] = createHash("sha256").update(content).digest("hex").slice(0, 16);
  }
  return out;
}

export async function GET() {
  const sha = gitSha();
  const buildTimestamp = new Date().toISOString();
  const token = createHash("sha256")
    .update(`${sha}:${buildTimestamp}:${process.env.npm_package_version ?? "0.1.0"}`)
    .digest("hex");

  return NextResponse.json({
    commitSha: sha,
    branch: gitBranch(),
    dirty: workingTreeDirty(),
    changedFiles: workingTreeDirty() ? changedFiles() : [],
    packageVersion: process.env.npm_package_version ?? "0.1.0",
    buildTimestamp,
    buildIdentityToken: token,
    migrationChecksums: migrationChecksums(),
    supabaseProjectRef:
      process.env.SUPABASE_PROJECT_REF ??
      process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ??
      null,
  });
}
