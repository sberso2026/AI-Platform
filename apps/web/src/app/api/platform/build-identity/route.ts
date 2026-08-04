import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { platform, release } from "node:os";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const REPO_ROOT = resolve(process.cwd(), "../..");

const CERTIFICATION_OUTPUT_IGNORE_PREFIXES = [
  "packages/customer-administration-certification/artifacts/",
  "packages/customer-administration-certification/test-results/",
  "packages/customer-administration-certification/.tmp/",
  "artifacts/generated/",
  "test-results/customer-administration/",
  ".tmp/customer-administration/",
];

function gitSha(): string {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.GITHUB_SHA?.trim() ||
    process.env.NEXT_PUBLIC_BUILD_SHA?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function gitBranch(): string {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_REF?.trim() || process.env.GITHUB_REF_NAME?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function gitRepositoryUrl(): string | null {
  try {
    return (
      execSync("git config --get remote.origin.url", {
        cwd: REPO_ROOT,
        encoding: "utf8",
      }).trim() || null
    );
  } catch {
    return null;
  }
}

function isIgnoredCertOutput(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  return CERTIFICATION_OUTPUT_IGNORE_PREFIXES.some((prefix) => normalized.includes(prefix));
}

function changedFiles(): string[] {
  try {
    return execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => (line.length > 3 ? line.slice(3).trim() : line.trim()))
      .filter((path) => !isIgnoredCertOutput(path));
  } catch {
    return [];
  }
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

function pnpmVersion(): string | null {
  try {
    return execSync("pnpm --version", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

/**
 * Public build identity probe.
 * Never includes secrets. Compatible with existing cert consumers + 6C-3E.0 smoke.
 */
export async function GET() {
  const sha = gitSha();
  const buildTimestamp = new Date().toISOString();
  const packageVersion = process.env.npm_package_version ?? "0.1.0";
  const token = createHash("sha256")
    .update(`${sha}:${buildTimestamp}:${packageVersion}`)
    .digest("hex");
  const dirtyFiles = changedFiles();
  const dirty = dirtyFiles.length > 0;

  return NextResponse.json({
    ok: true,
    service: "rtb-ai-os",
    phase: "6C-3E.0",
    commitSha: sha,
    branch: gitBranch(),
    dirty,
    workingTreeClean: !dirty,
    changedFiles: dirty ? dirtyFiles : [],
    repositoryUrl: gitRepositoryUrl(),
    packageVersion,
    buildTimestamp,
    buildIdentityToken: token,
    migrationChecksums: migrationChecksums(),
    supabaseProjectRef:
      process.env.SUPABASE_PROJECT_REF ??
      process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ??
      null,
    certificationTarget: process.env.CUSTOMER_ADMIN_CERTIFICATION_TARGET ?? null,
    nodeVersion: process.version,
    pnpmVersion: pnpmVersion(),
    runnerOs: `${platform()} ${release()}`,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID?.trim() || null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    region: process.env.VERCEL_REGION ?? null,
  });
}
