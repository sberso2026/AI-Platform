/**
 * Phase 12G/12I — Deterministic fixture provider + CalculiX external adapter orchestrator.
 *
 * Reuses TwinSimulationExecutionOrchestrator (no fork).
 * Real/external/calculix providers NEVER silently fall back to fixture.
 * Fixture remains test-only. Native solver remains forbidden.
 */

import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertMethodExecutable, type TwinSimulationMethod } from "./simulation-method";
import {
  assertProviderExecutable,
  isRealExternalProvider,
  type TwinSimulationProvider,
} from "./simulation-provider";
import {
  assertScenarioCannotOverwriteObserved,
  type TwinSimulationDefinition,
  type TwinSimulationScenario,
} from "./simulation-definition";
import { freezeInputSet, type TwinSimulationInputSet } from "./simulation-input-set";
import {
  createTwinSimulationResult,
  createTwinSimulationReview,
  createTwinSimulationValidationState,
  submitSimulationReview,
  type SimulationRunStatus,
  type TwinSimulationResult,
  type TwinSimulationReview,
  type TwinSimulationValidationState,
} from "./simulation-result";
import {
  assertEligibleForExecution,
  assessSimulationQualificationEligibility,
  type EligibilityAssessment,
  type EligibilityInput,
} from "./simulation-qualification-eligibility";
import { rejectUnauthorizedSolverActivation } from "./simulation-external-solver-stubs";
import {
  assertNoSilentSolverFallback,
  isRealExternalSolverProviderType,
} from "./solvers/engineering-solver-adapter";
import { createCalculiXSolverAdapter } from "./solvers/calculix-adapter";
import { SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION } from "./solvers/solver-defaults-manifest";
import { LINEAR_ELASTIC_STATIC_METHOD_KEY } from "./solvers/solver-mappers";
import {
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  SILENT_SOLVER_FALLBACK_ALLOWED,
} from "../version";

export type TwinSimulationExecutionRequest = {
  requestId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionId: string;
  scenarioId: string;
  inputSetId: string;
  methodId: string;
  providerId: string;
  timeoutMs: number;
  authorizedBy?: string;
  createdAt: string;
};

export function createTwinSimulationExecutionRequest(input: {
  requestId?: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionId: string;
  scenarioId: string;
  inputSetId: string;
  methodId: string;
  providerId: string;
  timeoutMs?: number;
  authorizedBy?: string;
}): TwinSimulationExecutionRequest {
  return {
    requestId: input.requestId ?? randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    definitionId: input.definitionId,
    scenarioId: input.scenarioId,
    inputSetId: input.inputSetId,
    methodId: input.methodId,
    providerId: input.providerId,
    timeoutMs: input.timeoutMs ?? 5_000,
    authorizedBy: input.authorizedBy,
    createdAt: new Date().toISOString(),
  };
}

export type TwinSimulationRun = {
  runId: string;
  requestId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionId: string;
  scenarioId: string;
  inputSetId: string;
  methodId: string;
  providerId: string;
  status: SimulationRunStatus;
  startedAt?: string;
  finishedAt?: string;
  errorCode?: string;
  resultId?: string;
  publishesObservedState: false;
  nativeSolverInvoked: false;
  externalSolverInvoked: boolean;
  silentFallbackUsed: false;
  createdAt: string;
};

export type DeterministicFixtureOutcome =
  | {
      ok: true;
      summary: Record<string, unknown>;
      artifactFileId: string;
    }
  | {
      ok: false;
      errorCode: string;
    };

/**
 * In-package deterministic fixture — NOT an engineering solver.
 * Must never be used as silent fallback for real/external/calculix providers.
 */
export function runDeterministicFixtureProvider(input: {
  contentHash: string;
  timeoutMs: number;
  forceTimeout?: boolean;
  methodRevoked?: boolean;
  providerRevoked?: boolean;
  invalidUnits?: boolean;
  missingPins?: boolean;
  /** When true, calling fixture is a forbidden silent fallback. */
  realSolverRequested?: boolean;
}): DeterministicFixtureOutcome {
  if (input.realSolverRequested) {
    throw new Error("silent_solver_fallback_forbidden");
  }
  if (SILENT_SOLVER_FALLBACK_ALLOWED) {
    throw new Error("silent_solver_fallback_must_remain_false");
  }
  if (NATIVE_ENGINEERING_SOLVER_IMPLEMENTED) {
    return { ok: false, errorCode: "native_solver_forbidden" };
  }
  if (input.forceTimeout) {
    return { ok: false, errorCode: "provider_timeout" };
  }
  if (input.methodRevoked) {
    return { ok: false, errorCode: "method_revoked" };
  }
  if (input.providerRevoked) {
    return { ok: false, errorCode: "provider_revoked" };
  }
  if (input.invalidUnits) {
    return { ok: false, errorCode: "invalid_units" };
  }
  if (input.missingPins) {
    return { ok: false, errorCode: "missing_pins" };
  }
  if (input.timeoutMs <= 0) {
    return { ok: false, errorCode: "provider_timeout" };
  }
  const digest = createHash("sha256")
    .update(`fixture:${input.contentHash}`)
    .digest("hex")
    .slice(0, 16);
  return {
    ok: true,
    summary: {
      provider: "deterministic_fixture",
      claimsNativeSolver: false,
      digest,
      bounded: true,
    },
    artifactFileId: `platform-files:sim-fixture-${digest}`,
  };
}

export type SimulationOrchestratorContext = {
  definition: TwinSimulationDefinition;
  scenario: TwinSimulationScenario;
  inputSet: TwinSimulationInputSet;
  method: TwinSimulationMethod;
  provider: TwinSimulationProvider;
  forceTimeout?: boolean;
  /** When true (default for assurance / real solver path), require eligibility. */
  assuranceRequired?: boolean;
  eligibility?: EligibilityInput;
  applicationKey?: string;
  /** Optional override artifact sandbox for CalculiX. */
  artifactDir?: string;
  /** Allow sync tests to skip async CalculiX spawn (still no fixture fallback). */
  skipRealSolverSpawn?: boolean;
};

export type SimulationOrchestratorResult = {
  run: TwinSimulationRun;
  inputSet: TwinSimulationInputSet;
  result?: TwinSimulationResult;
  validation?: TwinSimulationValidationState;
  review?: TwinSimulationReview;
  eligibility?: EligibilityAssessment;
  publishedObservedState: false;
  silentFallbackUsed: false;
};

function mapSolverStatusToRunStatus(
  status: string,
): SimulationRunStatus {
  if (status === "completed" || status === "completed_with_warnings") return "succeeded";
  if (status === "timeout") return "timed_out";
  if (status === "cancelled") return "cancelled";
  return "failed";
}

export class TwinSimulationExecutionOrchestrator {
  execute(
    request: TwinSimulationExecutionRequest,
    ctx: SimulationOrchestratorContext,
  ): SimulationOrchestratorResult {
    if (NATIVE_ENGINEERING_SOLVER_IMPLEMENTED) {
      throw new Error("native_engineering_solver_forbidden");
    }
    if (SILENT_SOLVER_FALLBACK_ALLOWED) {
      throw new Error("silent_solver_fallback_must_remain_false");
    }
    rejectUnauthorizedSolverActivation(request as unknown as Record<string, unknown>);

    if (!request.authorizedBy) {
      throw new Error("simulation_execution_unauthorized");
    }
    if (request.definitionId !== ctx.definition.definitionId) {
      throw new Error("definition_mismatch");
    }
    if (request.scenarioId !== ctx.scenario.scenarioId) {
      throw new Error("scenario_mismatch");
    }
    if (request.inputSetId !== ctx.inputSet.inputSetId) {
      throw new Error("input_set_mismatch");
    }
    if (request.methodId !== ctx.method.methodId || request.providerId !== ctx.provider.providerId) {
      throw new Error("method_or_provider_mismatch");
    }
    if (ctx.definition.methodId !== ctx.method.methodId) {
      throw new Error("definition_method_mismatch");
    }
    if (ctx.definition.providerId !== ctx.provider.providerId) {
      throw new Error("definition_provider_mismatch");
    }
    if (ctx.definition.claimsRepresentationFidelityL4OrL5) {
      throw new Error("representation_l4_l5_claim_forbidden");
    }

    assertScenarioCannotOverwriteObserved(ctx.scenario);
    assertMethodExecutable(ctx.method);
    assertProviderExecutable(ctx.provider);

    const realExternal = isRealExternalProvider(ctx.provider);
    assertNoSilentSolverFallback({
      providerType: ctx.provider.providerType,
      providerKey: ctx.provider.providerKey,
      silentFallbackUsed: false,
      usedFixtureInsteadOfReal: false,
    });

    let eligibility: EligibilityAssessment | undefined;
    const assuranceRequired = ctx.assuranceRequired === true || realExternal;
    if (assuranceRequired) {
      if (!ctx.eligibility) {
        throw new Error("assurance_mode_requires_qualification_eligibility_context");
      }
      eligibility = assessSimulationQualificationEligibility({
        ...ctx.eligibility,
        methodId: request.methodId,
        providerId: request.providerId,
        applicationKey:
          ctx.applicationKey ??
          ctx.eligibility.applicationKey ??
          (realExternal ? "calculix_linear_elastic_static" : "fixture_assurance"),
        assuranceRequired: true,
      });
      assertEligibleForExecution(eligibility);
    }

    if (ctx.inputSet.representationVersionPins.length === 0) {
      throw new Error("representation_pins_required");
    }
    if (ctx.inputSet.publishedStateVersionPins.length === 0) {
      throw new Error("state_pins_required");
    }
    if (!ctx.inputSet.simulationUsesPublishedStateOnly) {
      throw new Error("must_use_published_state_only");
    }

    const frozen = freezeInputSet(ctx.inputSet);
    const now = new Date().toISOString();
    const runId = randomUUID();

    let run: TwinSimulationRun = {
      runId,
      requestId: request.requestId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
      definitionId: request.definitionId,
      scenarioId: request.scenarioId,
      inputSetId: frozen.inputSetId,
      methodId: request.methodId,
      providerId: request.providerId,
      status: "running",
      startedAt: now,
      publishesObservedState: false,
      nativeSolverInvoked: false,
      externalSolverInvoked: realExternal,
      silentFallbackUsed: false,
      createdAt: now,
    };

    if (realExternal) {
      if (ctx.skipRealSolverSpawn) {
        run = {
          ...run,
          status: "failed",
          finishedAt: new Date().toISOString(),
          errorCode: "real_solver_spawn_required",
        };
        return {
          run,
          inputSet: frozen,
          eligibility,
          publishedObservedState: false,
          silentFallbackUsed: false,
        };
      }
      throw new Error("use_executeAsync_for_real_external_solver");
    }

    const fixture = runDeterministicFixtureProvider({
      contentHash: frozen.contentHash,
      timeoutMs: request.timeoutMs,
      forceTimeout: ctx.forceTimeout,
      methodRevoked: ctx.method.status === "revoked",
      providerRevoked: ctx.provider.status === "revoked",
      invalidUnits: Boolean(
        frozen.parameters &&
          "hasQuantitativeValue" in frozen.parameters &&
          frozen.parameters.hasQuantitativeValue === true &&
          (!frozen.unitSystem || !frozen.unitCode),
      ),
      missingPins:
        frozen.representationVersionPins.length === 0 ||
        frozen.publishedStateVersionPins.length === 0,
      realSolverRequested: false,
    });

    if (!fixture.ok) {
      run = {
        ...run,
        status: fixture.errorCode === "provider_timeout" ? "timed_out" : "failed",
        finishedAt: new Date().toISOString(),
        errorCode: fixture.errorCode,
      };
      return {
        run,
        inputSet: frozen,
        eligibility,
        publishedObservedState: false,
        silentFallbackUsed: false,
      };
    }

    const result = createTwinSimulationResult({
      resultId: randomUUID(),
      runId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
      scenarioId: request.scenarioId,
      inputSetId: frozen.inputSetId,
      methodId: request.methodId,
      providerId: request.providerId,
      contentHash: frozen.contentHash,
      executionSucceeded: true,
      summary: fixture.summary,
      artifactRefs: [
        {
          artifactRefId: randomUUID(),
          fileId: fixture.artifactFileId,
          label: "deterministic_fixture_result",
          storesSolverArtifact: false,
        },
      ],
      createdBy: request.authorizedBy,
    });

    const validation = createTwinSimulationValidationState({
      validationId: randomUUID(),
      resultId: result.resultId,
      runId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
    });

    const review = submitSimulationReview(
      createTwinSimulationReview({
        reviewId: randomUUID(),
        tenantId: request.tenantId,
        workspaceId: request.workspaceId,
        twinId: request.twinId,
        resultId: result.resultId,
        validationId: validation.validationId,
      }),
    );

    run = {
      ...run,
      status: "succeeded",
      finishedAt: new Date().toISOString(),
      resultId: result.resultId,
    };

    return {
      run,
      inputSet: frozen,
      result,
      validation,
      review,
      eligibility,
      publishedObservedState: false,
      silentFallbackUsed: false,
    };
  }

  /**
   * Async path for real external solvers (CalculiX). Never falls back to fixture.
   */
  async executeAsync(
    request: TwinSimulationExecutionRequest,
    ctx: SimulationOrchestratorContext,
  ): Promise<SimulationOrchestratorResult> {
    if (!isRealExternalProvider(ctx.provider)) {
      return this.execute(request, ctx);
    }

    // Re-run sync guards without spawning by using a shallow pre-check path.
    if (NATIVE_ENGINEERING_SOLVER_IMPLEMENTED) {
      throw new Error("native_engineering_solver_forbidden");
    }
    if (SILENT_SOLVER_FALLBACK_ALLOWED) {
      throw new Error("silent_solver_fallback_must_remain_false");
    }
    rejectUnauthorizedSolverActivation(request as unknown as Record<string, unknown>);
    if (!request.authorizedBy) throw new Error("simulation_execution_unauthorized");
    assertScenarioCannotOverwriteObserved(ctx.scenario);
    assertMethodExecutable(ctx.method);
    assertProviderExecutable(ctx.provider);

    if (isRealExternalSolverProviderType(ctx.provider.providerType, ctx.provider.providerKey)) {
      assertNoSilentSolverFallback({
        providerType: ctx.provider.providerType,
        providerKey: ctx.provider.providerKey,
        silentFallbackUsed: false,
        usedFixtureInsteadOfReal: false,
      });
    }

    if (!ctx.eligibility) {
      throw new Error("assurance_mode_requires_qualification_eligibility_context");
    }
    const eligibility = assessSimulationQualificationEligibility({
      ...ctx.eligibility,
      methodId: request.methodId,
      providerId: request.providerId,
      applicationKey:
        ctx.applicationKey ??
        ctx.eligibility.applicationKey ??
        "calculix_linear_elastic_static",
      assuranceRequired: true,
    });
    assertEligibleForExecution(eligibility);

    if (ctx.inputSet.representationVersionPins.length === 0) {
      throw new Error("representation_pins_required");
    }
    if (ctx.inputSet.publishedStateVersionPins.length === 0) {
      throw new Error("state_pins_required");
    }
    if (!ctx.inputSet.simulationUsesPublishedStateOnly) {
      throw new Error("must_use_published_state_only");
    }

    const frozen = freezeInputSet(ctx.inputSet);
    const now = new Date().toISOString();
    const runId = randomUUID();
    let run: TwinSimulationRun = {
      runId,
      requestId: request.requestId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
      definitionId: request.definitionId,
      scenarioId: request.scenarioId,
      inputSetId: frozen.inputSetId,
      methodId: request.methodId,
      providerId: request.providerId,
      status: "running",
      startedAt: now,
      publishesObservedState: false,
      nativeSolverInvoked: false,
      externalSolverInvoked: true,
      silentFallbackUsed: false,
      createdAt: now,
    };

    const adapter = createCalculiXSolverAdapter();
    const artifactDir =
      ctx.artifactDir ?? mkdtempSync(join(tmpdir(), "dt12i-orch-"));
    const solverResult = await adapter.execute({
      requestId: request.requestId,
      adapterId: adapter.adapterId,
      solverId: "calculix",
      methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      artifactDir,
      inputArtifactRefs: [],
      timeoutMs: request.timeoutMs,
      unitSystem: "SI",
      unitCode: "N_m",
      defaultsManifestVersion: SOLVER_EXECUTION_DEFAULTS_MANIFEST_VERSION,
    });

    if (
      solverResult.status !== "completed" &&
      solverResult.status !== "completed_with_warnings"
    ) {
      run = {
        ...run,
        status: mapSolverStatusToRunStatus(solverResult.status),
        finishedAt: solverResult.finishedAt,
        errorCode: solverResult.errorCode ?? solverResult.status,
      };
      return {
        run,
        inputSet: frozen,
        eligibility,
        publishedObservedState: false,
        silentFallbackUsed: false,
      };
    }

    const result = createTwinSimulationResult({
      resultId: randomUUID(),
      runId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
      scenarioId: request.scenarioId,
      inputSetId: frozen.inputSetId,
      methodId: request.methodId,
      providerId: request.providerId,
      contentHash: frozen.contentHash,
      executionSucceeded: true,
      summary: {
        provider: "calculix",
        providerType: ctx.provider.providerType,
        adapterVersion: adapter.adapterVersion,
        solverStatus: solverResult.status,
        mapped: solverResult.mappedSummary ?? {},
        claimsNativeSolver: false,
        silentFallbackUsed: false,
      },
      artifactRefs: solverResult.outputArtifactRefs.map((a) => ({
        artifactRefId: a.artifactRefId,
        fileId: a.filePathOrId,
        label: a.label,
        storesSolverArtifact: false as const,
      })),
      createdBy: request.authorizedBy,
    });

    const validation = createTwinSimulationValidationState({
      validationId: randomUUID(),
      resultId: result.resultId,
      runId,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      twinId: request.twinId,
    });

    const review = submitSimulationReview(
      createTwinSimulationReview({
        reviewId: randomUUID(),
        tenantId: request.tenantId,
        workspaceId: request.workspaceId,
        twinId: request.twinId,
        resultId: result.resultId,
        validationId: validation.validationId,
      }),
    );

    run = {
      ...run,
      status: "succeeded",
      finishedAt: new Date().toISOString(),
      resultId: result.resultId,
    };

    return {
      run,
      inputSet: frozen,
      result,
      validation,
      review,
      eligibility,
      publishedObservedState: false,
      silentFallbackUsed: false,
    };
  }
}

export function createTwinSimulationExecutionOrchestrator(): TwinSimulationExecutionOrchestrator {
  return new TwinSimulationExecutionOrchestrator();
}
