/**
 * Phase 12I — CalculiX (ccx) EngineeringSolverAdapter.
 *
 * Spawns sandboxed `ccx` with cwd = artifactDir, timeout, no shell injection,
 * path confinement. Version probe via `ccx -v` (or `ccx --version`).
 */

import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";
import type {
  EngineeringSolverAdapter,
  EngineeringSolverExecuteRequest,
  EngineeringSolverExecuteResult,
  EngineeringSolverHealth,
  EngineeringSolverVersionObservation,
} from "./engineering-solver-adapter";
import {
  LINEAR_ELASTIC_STATIC_METHOD_KEY,
  mapCalculixDatToLinearElasticOutput,
  mapLinearElasticStaticInput,
  type LinearElasticStaticInput,
} from "./solver-mappers";
import {
  CALCULIX_LINEAR_ELASTIC_DEFAULTS,
  SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
} from "./solver-defaults-manifest";

export const CALCULIX_SOLVER_ID = "calculix" as const;
export const CALCULIX_ADAPTER_ID = "calculix-ccx-adapter" as const;
export const CALCULIX_ADAPTER_VERSION = "1.0.0" as const;
export const CALCULIX_TOOL_REGISTRY_REF = "platform-intelligence:ai_tools:calculix-ccx" as const;

const activeChildren = new Map<string, ReturnType<typeof spawn>>();

function assertPathInside(rootDir: string, candidate: string): string {
  const root = resolve(rootDir);
  const full = resolve(candidate);
  if (full !== root && !full.startsWith(root + sep)) {
    throw new Error("path_confinement_violation");
  }
  return full;
}

function runProcess(input: {
  command: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
  requestId?: string;
}): Promise<{
  exitCode: number | null;
  timedOut: boolean;
  cancelled: boolean;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolvePromise) => {
    const child = spawn(input.command, input.args, {
      cwd: input.cwd,
      shell: false,
      windowsHide: true,
      env: {
        PATH: process.env.PATH,
        SYSTEMROOT: process.env.SYSTEMROOT,
        LANG: process.env.LANG ?? "C",
      },
    });
    if (input.requestId) {
      activeChildren.set(input.requestId, child);
    }
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let cancelled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, input.timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 64_000) stdout = stdout.slice(-64_000);
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 64_000) stderr = stderr.slice(-64_000);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      if (input.requestId) activeChildren.delete(input.requestId);
      resolvePromise({
        exitCode: null,
        timedOut: false,
        cancelled: false,
        stdout,
        stderr: `${stderr}\n${err.message}`,
      });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (input.requestId) activeChildren.delete(input.requestId);
      if (signal === "SIGTERM" || signal === "SIGINT") cancelled = true;
      resolvePromise({
        exitCode: code,
        timedOut,
        cancelled,
        stdout,
        stderr,
      });
    });
  });
}

export function resolveCalculixBinary(): string {
  return process.env.CALCULIX_CCX_PATH?.trim() || "ccx";
}

export function buildAxialBarInp(input: LinearElasticStaticInput): string {
  // Minimal two-node truss / bar idealization for linear elastic static.
  const E = input.youngsModulusPa;
  const nu = input.poissonsRatio;
  const A = input.sectionAreaM2;
  const L = input.lengthM;
  const P = input.loadN;
  return `*HEADING
Digital Twin Phase 12I axial bar linear elastic static benchmark
** Version probe companion: ccx -v
*NODE, NSET=Nall
1,0.0,0.0,0.0
2,${L},0.0,0.0
*ELEMENT, TYPE=T3D2, ELSET=Eall
1,1,2
*SOLID SECTION, ELSET=Eall, MATERIAL=Steel
${A}
*MATERIAL, NAME=Steel
*ELASTIC
${E}, ${nu}
*BOUNDARY
1,1,3
*STEP
*STATIC
*CLOAD
2,1,${P}
*NODE FILE, OUTPUT=2D
U
*EL FILE, OUTPUT=2D
S
*NODE PRINT, NSET=Nall
U
*END STEP
`;
}

export class CalculiXSolverAdapter implements EngineeringSolverAdapter {
  readonly adapterId = CALCULIX_ADAPTER_ID;
  readonly solverId = CALCULIX_SOLVER_ID;
  readonly displayName = "CalculiX (ccx)";
  readonly adapterVersion = CALCULIX_ADAPTER_VERSION;
  readonly licenseFamily = "open_source_gpl" as const;
  status: EngineeringSolverAdapter["status"] = "registered";
  readonly certifiedMethodKeys = [LINEAR_ELASTIC_STATIC_METHOD_KEY] as const;
  readonly toolRegistryRef = CALCULIX_TOOL_REGISTRY_REF;

  async versionProbe(): Promise<EngineeringSolverVersionObservation> {
    const binary = resolveCalculixBinary();
    const probedAt = new Date().toISOString();
    const result = await runProcess({
      command: binary,
      args: ["-v"],
      cwd: process.cwd(),
      timeoutMs: 5_000,
    });
    const text = `${result.stdout}\n${result.stderr}`.trim();
    // Some ccx builds print version and exit non-zero / ignore -v; also try bare.
    let versionText = text;
    if (!versionText || result.exitCode === null) {
      const bare = await runProcess({
        command: binary,
        args: [],
        cwd: process.cwd(),
        timeoutMs: 5_000,
      });
      versionText = `${bare.stdout}\n${bare.stderr}`.trim() || text;
      if (bare.exitCode === null && !versionText) {
        return {
          adapterId: this.adapterId,
          solverId: this.solverId,
          probedAt,
          versionText: "",
          probeCommand: `${binary} -v`,
          ok: false,
          errorCode: "solver_unavailable",
        };
      }
    }
    const normalized =
      versionText.match(/(\d+\.\d+(?:\.\d+)?)/)?.[1] ??
      (versionText.slice(0, 64) || undefined);
    const ok =
      versionText.length > 0 &&
      !/not recognized|ENOENT|command not found/i.test(versionText);
    return {
      adapterId: this.adapterId,
      solverId: this.solverId,
      probedAt,
      versionText: versionText.slice(0, 512),
      versionNormalized: normalized,
      probeCommand: `${binary} -v`,
      ok,
      errorCode: ok ? undefined : "version_probe_failed",
    };
  }

  async healthCheck(): Promise<EngineeringSolverHealth> {
    const version = await this.versionProbe();
    const healthy = version.ok;
    this.status = healthy ? "healthy" : "unavailable";
    return {
      adapterId: this.adapterId,
      healthy,
      status: this.status,
      checkedAt: new Date().toISOString(),
      detail: healthy ? "ccx_reachable" : version.errorCode,
      version,
    };
  }

  async execute(request: EngineeringSolverExecuteRequest): Promise<EngineeringSolverExecuteResult> {
    const startedAt = new Date().toISOString();
    const finish = (
      partial: Omit<
        EngineeringSolverExecuteResult,
        | "requestId"
        | "adapterId"
        | "solverId"
        | "startedAt"
        | "nativeSolverInvoked"
        | "silentFallbackUsed"
      >,
    ): EngineeringSolverExecuteResult => ({
      requestId: request.requestId,
      adapterId: this.adapterId,
      solverId: this.solverId,
      startedAt,
      nativeSolverInvoked: false,
      silentFallbackUsed: false,
      ...partial,
    });

    if (request.adapterId !== this.adapterId && request.solverId !== this.solverId) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "adapter_mismatch",
        externalProcessSpawned: false,
      });
    }
    if (request.methodKey !== LINEAR_ELASTIC_STATIC_METHOD_KEY) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "unsupported_method",
        externalProcessSpawned: false,
      });
    }
    if (request.defaultsManifestVersion !== SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "unknown_defaults_manifest_version",
        externalProcessSpawned: false,
      });
    }
    if (request.unitSystem !== "SI" || request.unitCode !== "N_m") {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "unit_mismatch",
        externalProcessSpawned: false,
      });
    }

    const health = await this.healthCheck();
    if (!health.healthy) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "solver_unavailable",
        externalProcessSpawned: false,
      });
    }

    const requiredVersion = request.metadata?.requiredVersion;
    if (
      requiredVersion &&
      health.version?.versionNormalized &&
      health.version.versionNormalized !== requiredVersion
    ) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "wrong_solver_version",
        externalProcessSpawned: false,
      });
    }

    let artifactDir: string;
    try {
      artifactDir = assertPathInside(request.artifactDir, request.artifactDir);
      mkdirSync(artifactDir, { recursive: true });
    } catch {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: "path_confinement_violation",
        externalProcessSpawned: false,
      });
    }

    const defaults = CALCULIX_LINEAR_ELASTIC_DEFAULTS;
    const mapped = mapLinearElasticStaticInput({
      methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      unitSystem: "SI",
      unitCode: "N_m",
      youngsModulusPa: defaults.youngsModulusPa,
      poissonsRatio: defaults.poissonsRatio,
      sectionAreaM2: defaults.sectionAreaM2,
      lengthM: defaults.lengthM,
      loadN: defaults.loadN,
      boundaryCondition: defaults.boundaryCondition,
    });
    if (!mapped.ok) {
      return finish({
        status: "failed",
        finishedAt: new Date().toISOString(),
        outputArtifactRefs: [],
        errorCode: mapped.errorCode,
        externalProcessSpawned: false,
      });
    }

    const jobName = "dt12i_axial";
    const inpPath = assertPathInside(artifactDir, join(artifactDir, `${jobName}.inp`));
    const inpBody = buildAxialBarInp(mapped.normalized);
    writeFileSync(inpPath, inpBody, "utf8");
    const inpHash = createHash("sha256").update(inpBody).digest("hex");

    const binary = resolveCalculixBinary();
    // ccx expects job name without extension; cwd confines relative outputs.
    const proc = await runProcess({
      command: binary,
      args: [jobName],
      cwd: artifactDir,
      timeoutMs: request.timeoutMs,
      requestId: request.requestId,
    });

    const finishedAt = new Date().toISOString();
    if (proc.timedOut) {
      return finish({
        status: "timeout",
        finishedAt,
        exitCode: proc.exitCode ?? undefined,
        stdoutTail: proc.stdout.slice(-2000),
        stderrTail: proc.stderr.slice(-2000),
        outputArtifactRefs: [
          {
            artifactRefId: randomUUID(),
            filePathOrId: `platform-files:calculix-inp-${inpHash.slice(0, 16)}`,
            contentHash: inpHash,
            label: basename(inpPath),
            kind: "input",
          },
        ],
        errorCode: "provider_timeout",
        externalProcessSpawned: true,
      });
    }
    if (proc.cancelled) {
      return finish({
        status: "cancelled",
        finishedAt,
        exitCode: proc.exitCode ?? undefined,
        stdoutTail: proc.stdout.slice(-2000),
        stderrTail: proc.stderr.slice(-2000),
        outputArtifactRefs: [],
        errorCode: "cancelled",
        externalProcessSpawned: true,
      });
    }
    if (proc.exitCode === null) {
      return finish({
        status: "failed",
        finishedAt,
        stdoutTail: proc.stdout.slice(-2000),
        stderrTail: proc.stderr.slice(-2000),
        outputArtifactRefs: [],
        errorCode: "solver_unavailable",
        externalProcessSpawned: false,
      });
    }

    const datPath = join(artifactDir, `${jobName}.dat`);
    const frdPath = join(artifactDir, `${jobName}.frd`);
    const outputRefs = [
      {
        artifactRefId: randomUUID(),
        filePathOrId: `platform-files:calculix-inp-${inpHash.slice(0, 16)}`,
        contentHash: inpHash,
        label: `${jobName}.inp`,
        kind: "input" as const,
      },
    ];
    let mappedSummary: Record<string, unknown> | undefined;
    if (existsSync(datPath)) {
      const datText = readFileSync(datPath, "utf8");
      const datHash = createHash("sha256").update(datText).digest("hex");
      outputRefs.push({
        artifactRefId: randomUUID(),
        filePathOrId: `platform-files:calculix-dat-${datHash.slice(0, 16)}`,
        contentHash: datHash,
        label: `${jobName}.dat`,
        kind: "output",
      });
      const mappedOut = mapCalculixDatToLinearElasticOutput(datText);
      mappedSummary = { ...mappedOut };
    }
    if (existsSync(frdPath)) {
      const frdHash = createHash("sha256")
        .update(readFileSync(frdPath))
        .digest("hex");
      outputRefs.push({
        artifactRefId: randomUUID(),
        filePathOrId: `platform-files:calculix-frd-${frdHash.slice(0, 16)}`,
        contentHash: frdHash,
        label: `${jobName}.frd`,
        kind: "output",
      });
    }

    if (proc.exitCode !== 0) {
      return finish({
        status: "failed",
        finishedAt,
        exitCode: proc.exitCode,
        stdoutTail: proc.stdout.slice(-2000),
        stderrTail: proc.stderr.slice(-2000),
        outputArtifactRefs: outputRefs,
        mappedSummary,
        errorCode: "solver_failed",
        externalProcessSpawned: true,
      });
    }

    const warnings: string[] = [];
    if (/warning/i.test(proc.stdout + proc.stderr)) {
      warnings.push("solver_reported_warnings");
    }

    return finish({
      status: warnings.length ? "completed_with_warnings" : "completed",
      finishedAt,
      exitCode: proc.exitCode,
      stdoutTail: proc.stdout.slice(-2000),
      stderrTail: proc.stderr.slice(-2000),
      outputArtifactRefs: outputRefs,
      mappedSummary,
      warnings: warnings.length ? warnings : undefined,
      externalProcessSpawned: true,
    });
  }

  async cancel(requestId: string): Promise<{ ok: boolean; detail?: string }> {
    const child = activeChildren.get(requestId);
    if (!child) return { ok: false, detail: "no_active_process" };
    child.kill("SIGTERM");
    return { ok: true, detail: "sigterm_sent" };
  }
}

export function createCalculiXSolverAdapter(): CalculiXSolverAdapter {
  return new CalculiXSolverAdapter();
}
