import { execSync } from "node:child_process";

/** Paths ignored when determining whether the working tree is releasable-clean. */
export const CERTIFICATION_OUTPUT_IGNORE_PREFIXES = [
  "packages/customer-administration-certification/artifacts/",
  "packages/customer-administration-certification/test-results/",
  "packages/customer-administration-certification/.tmp/",
  "artifacts/generated/",
  "test-results/customer-administration/",
  ".tmp/customer-administration/",
];

export interface GitRevision {
  commitSha: string;
  branch: string;
  repositoryUrl: string | null;
}

export interface WorkingTreeStatus {
  clean: boolean;
  dirtyPaths: string[];
  allowDirtyOverride: boolean;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function isIgnoredCertOutput(path: string): boolean {
  const normalized = normalizePath(path);
  return CERTIFICATION_OUTPUT_IGNORE_PREFIXES.some((prefix) => normalized.includes(prefix));
}

export function resolveGitRevision(root: string): GitRevision {
  const commitSha = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  if (!commitSha) throw new Error("Unable to resolve commit SHA");
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, encoding: "utf8" }).trim();
  let repositoryUrl: string | null = null;
  try {
    repositoryUrl = execSync("git config --get remote.origin.url", { cwd: root, encoding: "utf8" }).trim() || null;
  } catch {
    repositoryUrl = null;
  }
  return { commitSha, branch, repositoryUrl };
}

export function readWorkingTreeStatus(root: string): WorkingTreeStatus {
  const allowDirtyOverride = process.env.CUSTOMER_ADMIN_ALLOW_DIRTY === "1";
  const raw = execSync("git status --porcelain", { cwd: root, encoding: "utf8" })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const dirtyPaths = raw
    .map((line) => (line.length > 3 ? line.slice(3).trim() : line))
    .filter((path) => !isIgnoredCertOutput(path));

  return {
    clean: dirtyPaths.length === 0,
    dirtyPaths,
    allowDirtyOverride,
  };
}

export function assertWorkingTreeClean(root: string, context: string): WorkingTreeStatus {
  const status = readWorkingTreeStatus(root);
  if (status.clean || status.allowDirtyOverride) return status;
  throw new Error(
    `${context}: working tree must be clean before release certification.\n` +
      `Uncommitted source changes:\n${status.dirtyPaths.join("\n")}`
  );
}

export function assertWorkingTreeCleanAfter(root: string, context: string): void {
  const status = readWorkingTreeStatus(root);
  if (status.clean) return;
  throw new Error(
    `${context}: certification modified tracked source files.\n` +
      `Dirty paths after run:\n${status.dirtyPaths.join("\n")}`
  );
}
