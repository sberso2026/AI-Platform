import { describe, expect, it, vi } from "vitest";
import {
  createSPACEGASSLiveProvider,
  createSPACEGASSSolverAdapter,
  federateSpaceGassLiveModel,
  probeSpaceGassLiveHealth,
  provenanceLabelForFederationSource,
  resolveSpaceGassApiBaseUrl,
  resolveSpaceGassLiveEnvironmentMode,
  SPACEGASS_PROVENANCE,
  SPACEGASSLiveProviderReady,
  spaceGassControlledExecutionCertified,
  spaceGassHostedExecutionCertified,
  silentSolverFallbackAllowed,
} from "../src/index";

describe("Phase 13D SPACEGASSLiveProvider", () => {
  it("resolves default API base with /api/v1", () => {
    expect(resolveSpaceGassApiBaseUrl({})).toBe(
      "http://localhost:34560/api/v1",
    );
    expect(
      resolveSpaceGassApiBaseUrl({ SPACEGASS_API_URL: "http://host:9" }),
    ).toBe("http://host:9/api/v1");
    expect(
      resolveSpaceGassApiBaseUrl({
        SPACEGASS_API_URL: "http://host:9/api/v1",
      }),
    ).toBe("http://host:9/api/v1");
  });

  it("maps environment modes honestly", () => {
    expect(
      resolveSpaceGassLiveEnvironmentMode({ GITHUB_ACTIONS: "true" }),
    ).toBe("hosted_ci");
    expect(
      resolveSpaceGassLiveEnvironmentMode({ SPACEGASS_CONTROLLED_HOST: "1" }),
    ).toBe("controlled_execution_host");
    expect(resolveSpaceGassLiveEnvironmentMode({})).toBe(
      "local_engineering_workstation",
    );
  });

  it("fail-closes health when API unreachable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    const health = await probeSpaceGassLiveHealth({
      env: {},
      fetchImpl,
      timeoutMs: 200,
    });
    expect(health.reachable).toBe(false);
    expect(health.status).toBe("unavailable");
    expect(health.SPACEGASSLiveProviderReady).toBe(false);
    expect(health.liveSessionProven).toBe(false);
    expect(health.correctiveFindings.length).toBeGreaterThan(0);
  });

  it("maps license_unavailable and version_mismatch from live responses", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/service/info")) {
        return new Response(JSON.stringify({ spaceGassVersion: "14.50.155" }), {
          status: 200,
        });
      }
      if (url.includes("/license/status")) {
        return new Response(
          JSON.stringify({ isLicensed: false, errorMessage: "no license" }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 404 });
    }) as unknown as typeof fetch;

    const health = await probeSpaceGassLiveHealth({
      env: {},
      fetchImpl,
      timeoutMs: 500,
    });
    expect(health.reachable).toBe(true);
    expect(health.status).toBe("license_unavailable");
    expect(health.SPACEGASSLiveProviderReady).toBe(false);

    const fetchOld = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/service/info")) {
        return new Response(JSON.stringify({ spaceGassVersion: "12.0.0" }), {
          status: 200,
        });
      }
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;
    const mismatch = await probeSpaceGassLiveHealth({
      env: {},
      fetchImpl: fetchOld,
      timeoutMs: 500,
    });
    expect(mismatch.status).toBe("version_mismatch");
  });

  it("never labels fixture export as LIVE MODEL", () => {
    expect(provenanceLabelForFederationSource("export_fixture")).toBe(
      SPACEGASS_PROVENANCE.federatedExport,
    );
    expect(provenanceLabelForFederationSource("live_api")).toBe(
      SPACEGASS_PROVENANCE.liveModel,
    );
  });

  it("fail-closes live federation when unreachable (no fixture fallback)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("connect ETIMEDOUT");
    }) as unknown as typeof fetch;
    const provider = createSPACEGASSLiveProvider({
      env: {},
      fetchImpl,
      timeoutMs: 200,
    });
    const result = await federateSpaceGassLiveModel(
      {
        tenantId: "00000000-0000-4000-8000-000000000001",
        workspaceId: "00000000-0000-4000-8000-000000000002",
        sampleFileName: "Portal Frame.SG",
      },
      { provider, fetchImpl, timeoutMs: 200 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.silentFallbackUsed).toBe(false);
      expect(result.errorCode).toBe("live_api_unavailable");
    }
  });

  it("package LiveReady / hosted / controlled flags remain false; no silent fallback", async () => {
    expect(SPACEGASSLiveProviderReady).toBe(false);
    expect(spaceGassHostedExecutionCertified).toBe(false);
    expect(spaceGassControlledExecutionCertified).toBe(false);
    expect(silentSolverFallbackAllowed).toBe(false);

    const adapter = createSPACEGASSSolverAdapter({
      env: { SPACEGASS_API_URL: "http://127.0.0.1:1" },
    });
    const exec = await adapter.execute({
      requestId: "live_neg",
      adapterId: adapter.adapterId,
      solverId: "spacegass",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/sg",
      inputArtifactRefs: [],
      timeoutMs: 500,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: {
        projectId: "p1",
        projectApprovedProviders: "spacegass",
        modelRefId: "m1",
        liveSampleFileName: "Portal Frame.SG",
      },
    });
    expect(exec.status).toBe("failed");
    expect(exec.silentFallbackUsed).toBe(false);
    expect(exec.errorCode).toBe("solver_unavailable");
  });
});
