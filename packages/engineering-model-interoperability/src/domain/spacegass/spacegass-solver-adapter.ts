/**
 * Phase 13C — SPACEGASSSolverAdapter
 *
 * Conforms to Digital Twin `EngineeringSolverAdapter` public contract shape.
 * Hosted in interoperability package because DT V1 is frozen (CalculiX-only).
 * Fail-closed when SPACE GASS runtime/license unavailable.
 * silentSolverFallbackAllowed = false — never fall back to CalculiX or fixture success.
 */

import type {
  EngineeringSolverAdapter,
  EngineeringSolverExecuteRequest,
  EngineeringSolverExecuteResult,
  EngineeringSolverHealth,
  EngineeringSolverVersionObservation,
} from "@rtb/digital-twin";
import { mapSpaceGassExecutionInput } from "./spacegass-input-mapper";
import { probeSpaceGassLicense } from "./spacegass-license";
import { assessSpaceGassProjectPolicy } from "./spacegass-project-policy";
import {
  SPACEGASS_ADAPTER_VERSION,
  SPACEGASS_BOUNDED_METHOD,
  SPACEGASS_DISPLAY_NAME,
  SPACEGASS_PROVIDER_KEY,
  probeSpaceGassVersion,
} from "./spacegass-version";

export const SILENT_SOLVER_FALLBACK_ALLOWED = false as const;
export const spaceGassSilentSolverFallbackAllowed = false as const;

export type SPACEGASSSolverAdapter = EngineeringSolverAdapter & {
  solverId: typeof SPACEGASS_PROVIDER_KEY;
  certifiedMethodKeys: readonly [typeof SPACEGASS_BOUNDED_METHOD];
  silentSolverFallbackAllowed: false;
  spaceGassHostedExecutionCertified: false;
};

export function createSPACEGASSSolverAdapter(options?: {
  env?: NodeJS.ProcessEnv;
}): SPACEGASSSolverAdapter {
  const env = options?.env ?? process.env;

  const adapter: SPACEGASSSolverAdapter = {
    adapterId: "spacegass_solver_adapter",
    solverId: SPACEGASS_PROVIDER_KEY,
    displayName: SPACEGASS_DISPLAY_NAME,
    adapterVersion: SPACEGASS_ADAPTER_VERSION,
    licenseFamily: "commercial",
    status: "registered",
    certifiedMethodKeys: [SPACEGASS_BOUNDED_METHOD],
    toolRegistryRef: "engineering_model_interoperability.spacegass",
    silentSolverFallbackAllowed: false,
    spaceGassHostedExecutionCertified: false,

    async versionProbe(): Promise<EngineeringSolverVersionObservation> {
      const probedAt = new Date().toISOString();
      const probe = probeSpaceGassVersion(env);
      return {
        adapterId: adapter.adapterId,
        solverId: SPACEGASS_PROVIDER_KEY,
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
      const license = probeSpaceGassLicense(env);
      const healthy = version.ok && license.status === "available";
      return {
        adapterId: adapter.adapterId,
        healthy,
        status: healthy ? "healthy" : "unavailable",
        checkedAt: new Date().toISOString(),
        detail: healthy
          ? "SPACE GASS runtime+license attested"
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
        solverId: SPACEGASS_PROVIDER_KEY,
        startedAt,
        finishedAt: new Date().toISOString(),
        nativeSolverInvoked: false,
        silentFallbackUsed: false,
        ...partial,
      });

      if (SILENT_SOLVER_FALLBACK_ALLOWED) {
        throw new Error("silent_solver_fallback_must_remain_false");
      }

      if (request.solverId !== SPACEGASS_PROVIDER_KEY) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "wrong_solver",
          externalProcessSpawned: false,
          warnings: ["SPACE GASS adapter rejects non-spacegass solverId"],
        });
      }

      if (request.methodKey !== SPACEGASS_BOUNDED_METHOD) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "method_not_qualified",
          externalProcessSpawned: false,
          warnings: [
            `Only ${SPACEGASS_BOUNDED_METHOD} is qualified in Phase 13C`,
          ],
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
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "project_not_approved",
          externalProcessSpawned: false,
          warnings: [policy.detail],
        });
      }

      // Mapping must succeed before runtime probe (contract validation).
      try {
        mapSpaceGassExecutionInput({
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

      const version = probeSpaceGassVersion(env);
      if (!version.ok) {
        // Preserve probe codes: solver_unavailable | wrong_version | probe_failed
        const errorCode =
          version.errorCode === "wrong_version"
            ? "wrong_version"
            : version.errorCode === "probe_failed"
              ? "probe_failed"
              : "solver_unavailable";
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode,
          externalProcessSpawned: false,
          warnings: [version.detail ?? "SPACE GASS unavailable"],
        });
      }

      const license = probeSpaceGassLicense(env);
      if (license.status !== "available") {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: license.errorCode ?? "license_unavailable",
          externalProcessSpawned: false,
          warnings: [license.detail],
        });
      }

      // Real binary spawn path — only when runtime+license attested.
      // CI almost never has SPACE GASS; this path remains fail-closed unless
      // SPACEGASS_ALLOW_SPAWN=1 is explicitly set with a real executable.
      const exe = env.SPACEGASS_EXECUTABLE?.trim() || env.SPACEGASS_EXE?.trim();
      const allowSpawn = env.SPACEGASS_ALLOW_SPAWN?.trim() === "1";
      if (!exe || !allowSpawn) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "solver_unavailable",
          externalProcessSpawned: false,
          warnings: [
            "SPACE GASS runtime attested but spawn not enabled / executable missing. Hosted execution certified remains false. No CalculiX/fixture fallback.",
          ],
        });
      }

      // Intentionally do not implement a fake successful spawn. If operators
      // enable spawn without a working binary, child_process will fail closed.
      try {
        const { spawnSync } = await import("node:child_process");
        const result = spawnSync(exe, ["--version"], {
          timeout: Math.min(request.timeoutMs, 15_000),
          encoding: "utf8",
          env: { ...env },
        });
        if (result.error || result.status !== 0) {
          return finish({
            status: "failed",
            outputArtifactRefs: [],
            errorCode: "solver_unavailable",
            exitCode: result.status ?? undefined,
            stderrTail: (result.stderr || result.error?.message || "").slice(0, 500),
            externalProcessSpawned: true,
            warnings: ["SPACE GASS executable probe failed — fail closed"],
          });
        }
        // Even with a successful --version probe, full analysis execution is
        // out of scope without vendor API integration. Fail closed rather than
        // fabricate engineering results.
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "hosted_analysis_not_certified",
          stdoutTail: (result.stdout || "").slice(0, 500),
          externalProcessSpawned: true,
          warnings: [
            "Executable reachable but Phase 13C does not claim hosted analysis certification (spaceGassHostedExecutionCertified=false).",
          ],
        });
      } catch (e) {
        return finish({
          status: "failed",
          outputArtifactRefs: [],
          errorCode: "solver_unavailable",
          externalProcessSpawned: false,
          warnings: [e instanceof Error ? e.message : "spawn_failed"],
        });
      }
    },

    async cancel(requestId: string) {
      return { ok: false, detail: `cancel_not_supported:${requestId}` };
    },
  };

  return adapter;
}

export function getSpaceGassProviderStatus(env: NodeJS.ProcessEnv = process.env) {
  const adapter = createSPACEGASSSolverAdapter({ env });
  const version = probeSpaceGassVersion(env);
  const license = probeSpaceGassLicense(env);
  return {
    providerKey: SPACEGASS_PROVIDER_KEY,
    displayName: SPACEGASS_DISPLAY_NAME,
    adapterReady: true as const,
    SPACEGASSSolverAdapterReady: true as const,
    spaceGassHostedExecutionCertified: false as const,
    silentSolverFallbackAllowed: false as const,
    selectedMethod: SPACEGASS_BOUNDED_METHOD,
    runtimeConfigured: version.ok,
    licenseStatus: license.status,
    versionText: version.versionText,
    status: version.ok && license.status === "available" ? "degraded" : "unavailable",
    notes:
      "Adapter ready (fail-closed). Hosted execution certified=false unless a real SPACE GASS binary completes certified analysis — not available in standard CI.",
    adapterId: adapter.adapterId,
  };
}
