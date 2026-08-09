/**
 * Phase 13D — Live governed execution for linear_elastic_static via
 * POST /job/analysis/static/run-linear + poll /job/analysis/runs/{runId}.
 *
 * Fail closed when API unavailable. Never CalculiX / fixture fallback.
 * Successful completion yields RTB EXECUTED RESULT provenance (not EXISTING RESULT).
 */

import type {
  EngineeringSolverExecuteRequest,
  EngineeringSolverExecuteResult,
} from "@rtb/digital-twin";
import { probeSpaceGassLiveHealth } from "./spacegass-live-health";
import {
  createSPACEGASSLiveProvider,
  type SPACEGASSLiveProvider,
  type SPACEGASSLiveProviderOptions,
} from "./spacegass-live-provider";
import { SPACEGASS_PROVENANCE } from "./spacegass-live-types";
import { assessSpaceGassProjectPolicy } from "./spacegass-project-policy";
import {
  SPACEGASS_BOUNDED_METHOD,
  SPACEGASS_PROVIDER_KEY,
} from "./spacegass-version";

export const spaceGassSilentSolverFallbackAllowed = false as const;

export type SpaceGassLiveExecutionOptions = SPACEGASSLiveProviderOptions & {
  provider?: SPACEGASSLiveProvider;
  pollIntervalMs?: number;
  maxPolls?: number;
};

function finishBase(
  request: EngineeringSolverExecuteRequest,
  startedAt: string,
  partial: Omit<
    EngineeringSolverExecuteResult,
    | "requestId"
    | "adapterId"
    | "solverId"
    | "startedAt"
    | "finishedAt"
    | "nativeSolverInvoked"
    | "silentFallbackUsed"
  >,
): EngineeringSolverExecuteResult {
  return {
    requestId: request.requestId,
    adapterId: request.adapterId,
    solverId: SPACEGASS_PROVIDER_KEY,
    startedAt,
    finishedAt: new Date().toISOString(),
    nativeSolverInvoked: false,
    silentFallbackUsed: false,
    ...partial,
  };
}

function runIdFrom(dto: { id?: string; runId?: string }): string | undefined {
  const id = dto.runId ?? dto.id;
  return typeof id === "string" && id ? id : undefined;
}

function isTerminalSuccess(status: string | undefined): boolean {
  if (!status) return false;
  return /^(completed|complete|succeeded|success|done|finished)$/i.test(status);
}

function isTerminalFailure(status: string | undefined): boolean {
  if (!status) return false;
  return /^(failed|error|cancelled|canceled|aborted)$/i.test(status);
}

/**
 * Execute linear_elastic_static against the live SPACE GASS API.
 * Requires an openable job path in metadata (liveJobPath / liveSampleFileName).
 */
export async function executeSpaceGassLiveLinearStatic(
  request: EngineeringSolverExecuteRequest,
  options?: SpaceGassLiveExecutionOptions,
): Promise<EngineeringSolverExecuteResult> {
  const startedAt = new Date().toISOString();
  const provider =
    options?.provider ?? createSPACEGASSLiveProvider(options);
  const pollIntervalMs = options?.pollIntervalMs ?? 500;
  const maxPolls = options?.maxPolls ?? 60;

  if (request.solverId !== SPACEGASS_PROVIDER_KEY) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "wrong_solver",
      externalProcessSpawned: false,
      warnings: ["Live execution rejects non-spacegass solverId"],
    });
  }
  if (request.methodKey !== SPACEGASS_BOUNDED_METHOD) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "method_not_qualified",
      externalProcessSpawned: false,
      warnings: [`Only ${SPACEGASS_BOUNDED_METHOD} is live-qualified in Phase 13D`],
    });
  }

  const approvedRaw = request.metadata?.projectApprovedProviders;
  const projectApprovedProviders = approvedRaw
    ? approvedRaw.split(",").map((s) => s.trim())
    : undefined;
  const policy = assessSpaceGassProjectPolicy({
    projectId: request.metadata?.projectId,
    projectApprovedProviders,
  });
  if (!policy.allowed) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "project_not_approved",
      externalProcessSpawned: false,
      warnings: [policy.detail],
    });
  }

  const health = await probeSpaceGassLiveHealth({ ...options, provider });
  if (!health.reachable || !health.licenseOk || !health.versionOk) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode:
        health.status === "version_mismatch"
          ? "wrong_version"
          : health.status === "license_unavailable"
            ? "license_unavailable"
            : health.status === "unauthorized"
              ? "unauthorized"
              : "solver_unavailable",
      externalProcessSpawned: false,
      warnings: [
        health.detail,
        ...health.correctiveFindings,
        "No CalculiX/fixture silent fallback.",
      ],
    });
  }

  const filePath = request.metadata?.liveJobPath?.trim();
  const sample = request.metadata?.liveSampleFileName?.trim();
  if (!filePath && !sample) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "solver_unavailable",
      externalProcessSpawned: false,
      warnings: [
        "Live execution requires metadata.liveJobPath or metadata.liveSampleFileName",
        ...health.correctiveFindings,
      ],
    });
  }

  let opened = false;
  try {
    await provider.closeJob();
    const openRes = filePath
      ? await provider.openJob(filePath)
      : await provider.openSample(sample!);
    if (!openRes.ok) {
      return finishBase(request, startedAt, {
        status: "failed",
        outputArtifactRefs: [],
        errorCode: "solver_unavailable",
        externalProcessSpawned: false,
        warnings: [openRes.detail, "job_open_failed"],
      });
    }
    opened = true;

    const runRes = await provider.runLinearStatic();
    if (!runRes.ok) {
      return finishBase(request, startedAt, {
        status: "failed",
        outputArtifactRefs: [],
        errorCode:
          runRes.status === 403 ? "license_unavailable" : "solver_unavailable",
        externalProcessSpawned: true,
        warnings: [runRes.detail],
      });
    }

    const runId = runIdFrom(runRes.data);
    if (!runId) {
      return finishBase(request, startedAt, {
        status: "failed",
        outputArtifactRefs: [],
        errorCode: "solver_unavailable",
        externalProcessSpawned: true,
        warnings: ["run_linear returned no runId"],
      });
    }

    let lastStatus = String(runRes.data.status ?? runRes.data.state ?? "");
    for (let i = 0; i < maxPolls; i++) {
      const poll = await provider.getAnalysisRun(runId);
      if (!poll.ok) {
        return finishBase(request, startedAt, {
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "solver_unavailable",
          externalProcessSpawned: true,
          warnings: [poll.detail],
        });
      }
      lastStatus = String(poll.data.status ?? poll.data.state ?? "");
      if (isTerminalSuccess(lastStatus)) {
        // Bounded result pull — evidence of RTB EXECUTED RESULT
        const reactions = await provider.queryNodeReactions();
        const artifacts = [
          {
            artifactRefId: `sg_run_${runId}`,
            filePathOrId: `spacegass:run:${runId}`,
            label: SPACEGASS_PROVENANCE.rtbExecutedResult,
            kind: "output" as const,
          },
        ];
        if (reactions.ok) {
          artifacts.push({
            artifactRefId: `sg_reactions_${runId}`,
            filePathOrId: "spacegass:query:node-reactions",
            label: "node-reactions",
            kind: "output" as const,
          });
        }
        return finishBase(request, startedAt, {
          status: "completed",
          outputArtifactRefs: artifacts,
          externalProcessSpawned: true,
          warnings: [
            `${SPACEGASS_PROVENANCE.rtbExecutedResult} via live API run ${runId}`,
          ],
        });
      }
      if (isTerminalFailure(lastStatus)) {
        return finishBase(request, startedAt, {
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "solver_unavailable",
          externalProcessSpawned: true,
          warnings: [
            `analysis_run_${lastStatus}`,
            poll.data.errorMessage ? String(poll.data.errorMessage) : "",
          ].filter(Boolean),
        });
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "solver_unavailable",
      externalProcessSpawned: true,
      warnings: [`analysis_poll_timeout lastStatus=${lastStatus}`],
    });
  } catch (e) {
    return finishBase(request, startedAt, {
      status: "failed",
      outputArtifactRefs: [],
      errorCode: "solver_unavailable",
      externalProcessSpawned: false,
      warnings: [e instanceof Error ? e.message : "live_execution_failed"],
    });
  } finally {
    if (opened) {
      try {
        await provider.closeJob();
      } catch {
        // ignore
      }
    }
  }
}
