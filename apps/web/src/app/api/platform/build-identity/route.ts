import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

function gitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function gitBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function workingTreeDirty(): boolean {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
    return status.length > 0;
  } catch {
    return true;
  }
}

function changedFiles(): string[] {
  try {
    return execSync("git status --porcelain", { encoding: "utf8" })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function migrationChecksums(): Record<string, string> {
  const dir = resolve(process.cwd(), "../../supabase/migrations");
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
