/**
 * Isolated per-job execution workspace with cleanup.
 */

import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

export type ExecutionWorkspace = {
  jobId: string;
  rootDir: string;
  inputDir: string;
  outputDir: string;
  workDir: string;
  createdAt: string;
  cleanedUp: boolean;
};

export type WorkspaceManagerOptions = {
  baseDir: string;
};

function assertUnderRoot(root: string, candidate: string): string {
  const resolvedRoot = resolve(root) + sep;
  const resolvedCandidate = resolve(candidate);
  if (
    resolvedCandidate !== resolve(root) &&
    !resolvedCandidate.startsWith(resolvedRoot)
  ) {
    throw new Error("workspace_path_escape_forbidden");
  }
  return resolvedCandidate;
}

export class ExecutionWorkspaceManager {
  constructor(private readonly options: WorkspaceManagerOptions) {}

  create(jobId: string): ExecutionWorkspace {
    const rootDir = assertUnderRoot(
      this.options.baseDir,
      join(this.options.baseDir, `job_${jobId}_${randomUUID().slice(0, 8)}`),
    );
    const inputDir = join(rootDir, "input");
    const outputDir = join(rootDir, "output");
    const workDir = join(rootDir, "work");
    mkdirSync(inputDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(workDir, { recursive: true });
    writeFileSync(
      join(rootDir, "workspace.json"),
      JSON.stringify({ jobId, isolated: true }, null, 2),
      "utf8",
    );
    return {
      jobId,
      rootDir,
      inputDir,
      outputDir,
      workDir,
      createdAt: new Date().toISOString(),
      cleanedUp: false,
    };
  }

  stageInput(workspace: ExecutionWorkspace, name: string, content: string): string {
    const target = assertUnderRoot(workspace.inputDir, join(workspace.inputDir, name));
    writeFileSync(target, content, "utf8");
    return target;
  }

  readStaged(workspace: ExecutionWorkspace, name: string): string {
    const target = assertUnderRoot(workspace.inputDir, join(workspace.inputDir, name));
    return readFileSync(target, "utf8");
  }

  cleanup(workspace: ExecutionWorkspace): ExecutionWorkspace {
    if (existsSync(workspace.rootDir)) {
      rmSync(workspace.rootDir, { recursive: true, force: true });
    }
    return { ...workspace, cleanedUp: true };
  }

  assertNoCrossJobAccess(
    workspaceA: ExecutionWorkspace,
    workspaceB: ExecutionWorkspace,
  ): void {
    if (workspaceA.rootDir === workspaceB.rootDir) {
      throw new Error("cross_job_workspace_collision");
    }
    const a = resolve(workspaceA.rootDir) + sep;
    const b = resolve(workspaceB.rootDir);
    if (b.startsWith(a) || a.startsWith(resolve(workspaceB.rootDir) + sep)) {
      throw new Error("cross_job_workspace_nesting_forbidden");
    }
  }
}
