/**
 * Phase 13E — ETABSSolverAdapter
 *
 * Conforms to Digital Twin `EngineeringSolverAdapter` public contract shape.
 * Hosted in interoperability package because DT V1 is frozen (CalculiX-only).
 * Fail-closed when ETABS COM/API unavailable.
 * silentSolverFallbackAllowed = false — never fall back to CalculiX, SPACE GASS, or fixture success.
 */

import type {
  EngineeringSolverAdapter,
  EngineeringSolverExecuteRequest,
  EngineeringSolverExecuteResult,
  EngineeringSolverHealth,
  EngineeringSolverVersionObservation,
} from "@rtb/digital-twin";
import { mapEtabsExecutionInput } from "./etabs-input-mapper";
import { probeEtabsLicense } from "./etabs-license";
import { assessEtabsProjectPolicy } from "./etabs-project-policy";
import {
  ETABS_ADAPTER_VERSION,
  ETABS_BOUNDED_METHOD,
  ETABS_DISPLAY_NAME,
  ETABS_PROVIDER_KEY,
  probeEtabsVersion,
} from "./etabs-version";

const SILENT_SOLVER_FALLBACK_ALLOWED = false as const;
export const etabsSilentSolverFallbackAllowed = false as const;

export type ETABSSolverAdapter = EngineeringSolverAdapter & {
  solverId: typeof ETABS_PROVIDER_KEY;
  certifiedMethodKeys: readonly [];
  silentSolverFallbackAllowed: false;
  ETABSHostedExecutionCertified: false;
  ETABSControlledExecutionCertified: false;
  liveNativeCom: false;
};

export function createETABSSolverAdapter(options?: {
  env?: NodeJS.ProcessEnv;
}): ETABSSolverAdapter {
  const env = options?.env ?? process.env;

  const adapter: ETABSSolverAdapter = {
    adapterId: "etabs_solver_adapter",
    solverId: ETABS_PROVIDER_KEY,
    displayName: ETABS_DISPLAY_NAME,
    adapterVersion: ETABS_ADAPTER_VERSION,
    licenseFamily: "commercial",
    status: "registered",
    certifiedMethodKeys: [],
    toolRegistryRef: "engineering_model_interoperability.etabs",
    silentSolverFallbackAllowed: false,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    liveNativeCom: false,

    async versionProbe(): Promise<EngineeringSolverVersionObservation> {
      const probedAt = new Date().toISOString();
      const probe = probeEtabsVersion(env);
      return {
        adapterId: adapter.adapterId,
        solverId: ETABS_PROVIDER_KEY,
        probedAt,
        versionText: probe.versionText,
        versionNormalized: probe.versionNormalized,
        probeCommand: `env:${probe.probeSource}`,
        ok: probe.ok,
        errorCode: probe.errorCode,
      };
    },

    async healthCheck(): Promise<EngineeringSolverHealth> {
      const version = await adapter.versionProbe();
      const license = probeEtabsLicense(env);
      const healthy = version.ok && license.status === "available";
      return {
        adapterId: adapter.adapterId,
        healthy,
        status: healthy ? "healthy" : "unavailable",
        checkedAt: new Date().toISOString(),
        detail: healthy
          ? "ETABS runtime+license attested (COM live not certified)"
          : license.detail || version.errorCode || "unavailable",
        version,
      };
    },

    async execute(
      request: EngineeringSolverExecuteRequest,
    ): Promise<EngineeringSolverExecuteResult> {
      const startedAt = new Date().toISOString();
      const finish = (
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
      ): EngineeringSolverExecuteResult => ({
        requestId: request.requestId,
        adapterId: adapter.adapterId,
        solverId: ETABS_PROVIDER_KEY,
        startedAt,
        finishedAt: new Date().toISOString(),
        nativeSolverInvoked: false,
        silentFallbackUsed: false,
        ...partial,
      });

      if (SILENT_SOLVER_FALLBACK_ALLOWED) {
        throw new Error("silent_solver_fallback_must_remain_false");
      }

      if (request.solverId !== ETABS_PROVIDER_KEY) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "wrong_solver",
          externalProcessSpawned: false,
          warnings: ["ETABS adapter rejects non-etabs solverId"],
        });
      }

      // Execution methods are not qualified in 13E — fail closed for any method.
      if (request.methodKey !== ETABS_BOUNDED_METHOD) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "method_not_qualified",
          externalProcessSpawned: false,
          warnings: [
            `ETABS execution methods are reserved/unavailable in Phase 13E (requested ${request.methodKey})`,
          ],
        });
      }

      const approvedRaw = request.metadata?.projectApprovedProviders;
      const projectApprovedProviders = approvedRaw
        ? approvedRaw.split(",").map((s) => s.trim())
        : undefined;
      const policy = assessEtabsProjectPolicy({
        projectId: request.metadata?.projectId,
        projectApprovedProviders,
      });
      if (!policy.allowed) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "project_not_approved",
          externalProcessSpawned: false,
          warnings: [policy.detail],
        });
      }

      try {
        mapEtabsExecutionInput({
          requestId: request.requestId,
          modelRefId: request.metadata?.modelRefId ?? "unknown",
          artifactDir: request.artifactDir,
          unitSystem: request.unitSystem,
          unitCode: request.unitCode,
          platformFileRef: request.metadata?.platformFileRef,
          defaultsManifestVersion: request.defaultsManifestVersion,
        });
      } catch (e) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: e instanceof Error ? e.message : "input_mapping_failed",
          externalProcessSpawned: false,
        });
      }

      const version = probeEtabsVersion(env);
      if (!version.ok) {
        const errorCode =
          version.errorCode === "wrong_version"
            ? "wrong_version"
            : version.errorCode === "probe_failed"
              ? "probe_failed"
              : version.errorCode === "com_unavailable"
                ? "com_unavailable"
                : "solver_unavailable";
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode,
          externalProcessSpawned: false,
          warnings: [
            version.detail ?? "ETABS COM/API unavailable",
            "No CalculiX/SPACE GASS/fixture silent substitute.",
          ],
        });
      }

      const license = probeEtabsLicense(env);
      if (license.status !== "available") {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: license.errorCode ?? "license_unavailable",
          externalProcessSpawned: false,
          warnings: [license.detail],
        });
      }

      // Even with env attestation, live COM OAPI execution is not certified.
      // Fail closed — never invent successful analysis results.
      const allowCom = env.ETABS_ALLOW_COM?.trim() === "1";
      if (!allowCom) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "com_unavailable",
          externalProcessSpawned: false,
          warnings: [
            "ETABS runtime attested but COM spawn not enabled. ETABSHostedExecutionCertified=false. ETABSControlledExecutionCertified=false. No CalculiX/SPACE GASS/fixture fallback.",
          ],
        });
      }

      return finish({
        status: "failed",
        outputArtifactRefs: [],
        errorCode: "hosted_analysis_not_certified",
        externalProcessSpawned: false,
        warnings: [
          "COM spawn gated but Phase 13E does not claim hosted/controlled analysis certification (export federation only).",
        ],
      });
    },

    async cancel(requestId: string) {
      return { ok: false, detail: `cancel_not_supported:${requestId}` };
    },
  };

  return adapter;
}

export function getEtabsProviderStatus(env: NodeJS.ProcessEnv = process.env) {
  const adapter = createETABSSolverAdapter({ env });
  const version = probeEtabsVersion(env);
  const license = probeEtabsLicense(env);
  return {
    providerKey: ETABS_PROVIDER_KEY,
    displayName: ETABS_DISPLAY_NAME,
    adapterReady: true as const,
    ETABSSolverAdapterReady: true as const,
    ETABSModelFederationReady: true as const,
    ETABSResultFederationReady: true as const,
    ETABSHostedExecutionCertified: false as const,
    ETABSControlledExecutionCertified: false as const,
    silentSolverFallbackAllowed: false as const,
    federationPath: "export_fixture" as const,
    liveNativeCom: false as const,
    selectedMethod: ETABS_BOUNDED_METHOD,
    runtimeConfigured: version.ok,
    licenseStatus: license.status,
    versionText: version.versionText,
    status: version.ok && license.status === "available" ? "degraded" : "unavailable",
    notes:
      "Adapter ready (fail-closed). Export federation proven. Hosted/controlled execution certified=false — no live native COM in standard CI.",
    adapterId: adapter.adapterId,
  };
}
