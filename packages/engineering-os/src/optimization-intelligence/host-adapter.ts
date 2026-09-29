import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { OptimizationExecutionPort, OptimizationExecutionRequest, OptimizationExecutionResult } from "./execution-port";
import { isSpaceGassAdapterId, SPACE_GASS_CERTIFICATION_UNITS } from "./spacegass-certification-model";

type HostAuthInput = {
  jobId: string;
  tenantId: string;
  workspaceId: string;
  providerId: string;
  providerVersion?: string;
  toolRegistrationRef: string;
  methodQualificationRef: string;
  providerQualificationRef: string;
  applicationQualificationRef: string;
  sourceModelRef: string;
  inputArtifactRefs?: string[];
  requestedBy: string;
  idempotencyKey?: string;
  correlationId?: string;
  providerAvailable?: boolean;
  providerLicenseAvailable?: boolean;
  timeoutMs?: number;
};

type HostAuthResult =
  | { ok: true; job: { jobId: string } }
  | { ok: false; job: { jobId: string; rejectionReason?: string }; status: string };

type SpaceGassProbe = {
  versionOk: boolean;
  versionText: string;
  adapterVersion: string;
  licenseAvailable: boolean;
  executableConfigured: boolean;
};

/**
 * Load createAndAuthorizeExecutionJob from the existing execution-host package at runtime.
 * Dynamic specifier keeps engineering-os rootDir typecheck local (no second host implementation).
 */
async function loadCreateAndAuthorize(): Promise<((input: HostAuthInput) => HostAuthResult) | null> {
  const specifier = new URL("../../../engineering-execution-host/src/domain/execution-job.ts", import.meta.url).href;
  try {
    const mod = (await import(specifier)) as {
      createAndAuthorizeExecutionJob?: (input: HostAuthInput) => HostAuthResult;
    };
    return mod.createAndAuthorizeExecutionJob ?? null;
  } catch {
    return null;
  }
}

async function probeSpaceGass(env: NodeJS.ProcessEnv = process.env): Promise<SpaceGassProbe> {
  const versionUrl = new URL(
    "../../../engineering-model-interoperability/src/domain/spacegass/spacegass-version.ts",
    import.meta.url,
  ).href;
  const licenseUrl = new URL(
    "../../../engineering-model-interoperability/src/domain/spacegass/spacegass-license.ts",
    import.meta.url,
  ).href;
  const adapterUrl = new URL(
    "../../../engineering-model-interoperability/src/domain/spacegass/spacegass-solver-adapter.ts",
    import.meta.url,
  ).href;
  try {
    const [versionMod, licenseMod, adapterMod] = await Promise.all([
      import(versionUrl) as Promise<{
        probeSpaceGassVersion?: (env?: NodeJS.ProcessEnv) => { ok: boolean; versionText: string };
        SPACEGASS_ADAPTER_VERSION?: string;
      }>,
      import(licenseUrl) as Promise<{
        probeSpaceGassLicense?: (env?: NodeJS.ProcessEnv) => { status: string };
      }>,
      import(adapterUrl) as Promise<{ SPACEGASS_ADAPTER_VERSION?: string }>,
    ]);
    const version = versionMod.probeSpaceGassVersion?.(env) ?? { ok: false, versionText: "unavailable" };
    const license = licenseMod.probeSpaceGassLicense?.(env) ?? { status: "not_configured" };
    return {
      versionOk: version.ok,
      versionText: version.versionText,
      adapterVersion: versionMod.SPACEGASS_ADAPTER_VERSION ?? adapterMod.SPACEGASS_ADAPTER_VERSION ?? "0.3.0-spacegass",
      licenseAvailable: license.status === "available",
      executableConfigured: Boolean(env.SPACEGASS_EXECUTABLE?.trim() || env.SPACEGASS_EXE?.trim()),
    };
  } catch {
    return {
      versionOk: false,
      versionText: "unavailable",
      adapterVersion: "0.3.0-spacegass",
      licenseAvailable: false,
      executableConfigured: false,
    };
  }
}

function failResult(
  request: OptimizationExecutionRequest,
  status: OptimizationExecutionResult["status"],
  errorCode: string,
  errorMessage: string,
  extra?: Partial<OptimizationExecutionResult>,
): OptimizationExecutionResult {
  return {
    executionRef: request.executionRef,
    status,
    sourceKind: "EXECUTION_HOST",
    metrics: [],
    constraintEvidenceRefs: [],
    rawArtifactRefs: [],
    toolProvenance: { toolId: request.toolId, toolVersion: request.toolVersion },
    adapterProvenance: { adapterId: request.adapterId, adapterVersion: request.adapterVersion },
    errorCode,
    errorMessage,
    warnings: extra?.warnings ?? [],
    ...extra,
  };
}

/**
 * Delegates Optimization execution authorization through the existing Engineering Execution Host.
 * SPACE GASS uses the existing interop adapter; generic.test is never treated as structural evidence.
 */
export class ExecutionHostDelegatingAdapter implements OptimizationExecutionPort {
  async execute(request: OptimizationExecutionRequest): Promise<OptimizationExecutionResult> {
    const authorize = await loadCreateAndAuthorize();
    if (!authorize) {
      return failResult(
        request,
        "provider_unavailable",
        "execution_host_unavailable",
        "Existing execution host module could not be loaded",
      );
    }

    const spacegass = isSpaceGassAdapterId(request.adapterId);
    const probe = spacegass ? await probeSpaceGass() : null;
    const auth = authorize({
      jobId: request.executionRef,
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      providerId: request.adapterId,
      providerVersion: request.adapterVersion ?? probe?.adapterVersion,
      toolRegistrationRef: request.toolId || request.adapterId,
      methodQualificationRef: "engineering.optimization.evaluate",
      providerQualificationRef: request.adapterId,
      applicationQualificationRef: "engineering-os.optimization",
      sourceModelRef: request.runInputManifest.configuration.baseline_id,
      inputArtifactRefs: request.runInputManifest.execution.model_artifact_refs,
      requestedBy: request.requestedBy,
      idempotencyKey: request.runId,
      correlationId: request.runId,
      providerAvailable: spacegass ? Boolean(probe?.versionOk) : false,
      providerLicenseAvailable: spacegass ? Boolean(probe?.licenseAvailable) : false,
      timeoutMs: 120_000,
    });

    if (!auth.ok) {
      return failResult(
        request,
        mapHostStatus(auth.status),
        auth.status,
        auth.job.rejectionReason ?? auth.status,
      );
    }

    if (!spacegass) {
      return failResult(
        request,
        "failed",
        "solver_not_invoked",
        "Non-SPACE-GASS adapters are not certified for structural execution in EOS-A5D",
      );
    }

    return executeSpaceGassThroughExistingAdapter(request, auth.job.jobId, probe);
  }
}

async function executeSpaceGassThroughExistingAdapter(
  request: OptimizationExecutionRequest,
  executionRef: string,
  probe: SpaceGassProbe | null,
): Promise<OptimizationExecutionResult> {
  const adapterUrl = new URL(
    "../../../engineering-model-interoperability/src/domain/spacegass/spacegass-solver-adapter.ts",
    import.meta.url,
  ).href;
  try {
    const mod = (await import(adapterUrl)) as {
      createSPACEGASSSolverAdapter?: (options?: { env?: NodeJS.ProcessEnv }) => {
        adapterId: string;
        adapterVersion: string;
        execute: (input: {
          requestId: string;
          adapterId: string;
          solverId: string;
          methodKey: string;
          artifactDir: string;
          inputArtifactRefs: [];
          timeoutMs: number;
          unitSystem: string;
          unitCode: string;
          defaultsManifestVersion: string;
          metadata?: Record<string, string>;
        }) => Promise<{
          status: string;
          errorCode?: string;
          warnings?: string[];
          outputArtifactRefs?: Array<{ filePathOrId?: string }>;
          mappedSummary?: Record<string, unknown>;
          externalProcessSpawned?: boolean;
          exitCode?: number;
          stdoutTail?: string;
          stderrTail?: string;
        }>;
      };
      SPACEGASS_PROVIDER_KEY?: string;
      SPACEGASS_BOUNDED_METHOD?: string;
    };
    const create = mod.createSPACEGASSSolverAdapter;
    if (!create) {
      return failResult(request, "provider_unavailable", "spacegass_adapter_unavailable", "SPACE GASS adapter factory missing");
    }
    const adapter = create({ env: process.env });
    const artifactDir = mkdtempSync(join(tmpdir(), "eos-a5d-sg-"));
    const result = await adapter.execute({
      requestId: request.runId,
      adapterId: adapter.adapterId,
      solverId: mod.SPACEGASS_PROVIDER_KEY ?? "spacegass",
      methodKey: mod.SPACEGASS_BOUNDED_METHOD ?? "linear_elastic_static",
      artifactDir,
      inputArtifactRefs: [],
      timeoutMs: 120_000,
      unitSystem: "SI",
      unitCode: SPACE_GASS_CERTIFICATION_UNITS.force,
      defaultsManifestVersion: probe?.adapterVersion ?? "0.3.0-spacegass",
      metadata: {
        modelRefId: SPACE_GASS_CERTIFICATION_UNITS.geometry,
        projectId: request.runInputManifest.study.study_id,
        projectApprovedProviders: "spacegass",
      },
    });

    if (result.status !== "succeeded" && result.status !== "completed") {
      return {
        executionRef,
        status: mapSolverError(result.errorCode),
        sourceKind: "ADAPTER",
        metrics: [],
        constraintEvidenceRefs: [],
        rawArtifactRefs: (result.outputArtifactRefs ?? []).map((ref) => String(ref.filePathOrId ?? "")).filter(Boolean),
        toolProvenance: {
          toolId: "spacegass",
          toolVersion: probe?.versionText ?? request.toolVersion,
        },
        adapterProvenance: {
          adapterId: adapter.adapterId,
          adapterVersion: adapter.adapterVersion,
        },
        errorCode: result.errorCode ?? result.status,
        errorMessage: (result.warnings ?? []).join("; ") || result.errorCode || result.status,
        warnings: result.warnings ?? [],
      };
    }

    const metrics = extractTrustedMetrics(result.mappedSummary);
    if (metrics.length === 0 || !result.externalProcessSpawned) {
      return failResult(
        request,
        "malformed_result",
        "untrusted_or_empty_spacegass_metrics",
        "SPACE GASS completed without trusted extracted metrics; refusing fabricated results",
        { executionRef, sourceKind: "ADAPTER" },
      );
    }

    return {
      executionRef,
      status: "succeeded",
      sourceKind: "ADAPTER",
      metrics,
      constraintEvidenceRefs: request.runInputManifest.constraints.map((c) => c.constraint_id),
      rawArtifactRefs: (result.outputArtifactRefs ?? []).map((ref) => String(ref.filePathOrId ?? "")).filter(Boolean),
      toolProvenance: { toolId: "spacegass", toolVersion: probe?.versionText ?? request.toolVersion },
      adapterProvenance: { adapterId: adapter.adapterId, adapterVersion: adapter.adapterVersion },
      warnings: result.warnings ?? [],
    };
  } catch (error) {
    return failResult(
      request,
      "failed",
      "spacegass_adapter_failure",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function extractTrustedMetrics(summary: Record<string, unknown> | undefined): OptimizationExecutionResult["metrics"] {
  if (!summary || typeof summary !== "object") return [];
  const raw = summary.metrics;
  if (!Array.isArray(raw)) return [];
  const metrics: OptimizationExecutionResult["metrics"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const metricKey = typeof rec.metricKey === "string" ? rec.metricKey : typeof rec.metric_key === "string" ? rec.metric_key : "";
    const value = typeof rec.value === "number" ? rec.value : Number(rec.value);
    if (!metricKey || !Number.isFinite(value)) continue;
    metrics.push({
      metricKey,
      value,
      unit: typeof rec.unit === "string" ? rec.unit : null,
    });
  }
  return metrics;
}

function mapSolverError(errorCode: string | undefined): OptimizationExecutionResult["status"] {
  if (errorCode === "license_unavailable") return "license_unavailable";
  if (errorCode === "solver_unavailable" || errorCode === "probe_failed" || errorCode === "wrong_version") {
    return "provider_unavailable";
  }
  if (errorCode === "timeout") return "timeout";
  return "failed";
}

function mapHostStatus(status: string): OptimizationExecutionResult["status"] {
  if (status === "license_unavailable") return "license_unavailable";
  if (status === "provider_unavailable") return "provider_unavailable";
  if (status === "timeout") return "timeout";
  if (status === "cancelled") return "cancelled";
  return "failed";
}
