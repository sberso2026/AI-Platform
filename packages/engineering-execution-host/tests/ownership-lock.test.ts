import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertControlledEngineeringExecutionHostOwnershipLock,
  assertExecutionHostPrereleaseContracts,
  bindJobArtifact,
  certifySandboxBaseline,
  createAndAuthorizeExecutionJob,
  createDurableExecutionHostMemoryStore,
  createExecutionHostRepository,
  EngineeringExecutionHostRegistry,
  ExecutionWorkspaceManager,
  getControlVsExecutionPlaneDeclaration,
  getEtabsHostReservation,
  probeSpaceGassHost,
  SPACEGASSLiveExecutionCertified,
  silentSolverFallbackAllowed,
} from "../src/index";

describe("Phase 13D.1 Controlled Engineering Execution Host", () => {
  it("locks ownership and required readiness flags", () => {
    const lock = assertControlledEngineeringExecutionHostOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.SPACEGASSLiveExecutionCertified).toBe(false);
    expect(lock.silentSolverFallbackAllowed).toBe(false);
    expect(lock.ETABSAdapterImplemented).toBe(false);
    expect(lock.releaseEligible).toBe(true);
    expect(lock.phase13DReCertificationReady).toBe(true);
    expect(SPACEGASSLiveExecutionCertified).toBe(false);
    expect(silentSolverFallbackAllowed).toBe(false);
    expect(assertExecutionHostPrereleaseContracts().ga).toBe(false);
  });

  it("registers hosts, updates health, and revokes without method registration", async () => {
    const repo = createExecutionHostRepository({
      adapter: "memory",
      memoryStore: createDurableExecutionHostMemoryStore(),
    });
    const registry = new EngineeringExecutionHostRegistry(repo);
    const host = await registry.registerHost({
      tenantId: "t1",
      workspaceId: "w1",
      hostClass: "dedicated_windows_vm",
    });
    expect(host.hostId).toBeTruthy();
    const health = await registry.updateHealth("t1", "w1", host.hostId, {
      heartbeatOk: true,
      capacityOk: true,
      providerReadinessOk: true,
      workspaceReadinessOk: true,
      artifactTransportOk: true,
      activeJobCount: 0,
    });
    expect(health?.status).toBe("healthy");
    await registry.registerProvider("t1", "w1", host.hostId, {
      providerId: "spacegass",
      providerVersion: "14.5",
      installationStatus: "installed",
      licenseStatus: "unknown",
      healthStatus: "unavailable",
      revoked: false,
    });
    const revoked = await registry.revokeHost("t1", "w1", host.hostId);
    expect(revoked?.status).toBe("revoked");
  });

  it("rejects unauthorized jobs and forbids provider fallback", () => {
    const rejected = createAndAuthorizeExecutionJob({
      jobId: "j1",
      tenantId: "t1",
      workspaceId: "w1",
      providerId: "spacegass",
      toolRegistrationRef: "",
      methodQualificationRef: "m",
      providerQualificationRef: "p",
      applicationQualificationRef: "a",
      sourceModelRef: "s",
      requestedBy: "user",
    });
    expect(rejected.ok).toBe(false);
    expect(rejected.status).toBe("rejected");

    expect(() =>
      createAndAuthorizeExecutionJob({
        jobId: "j2",
        tenantId: "t1",
        workspaceId: "w1",
        providerId: "spacegass",
        toolRegistrationRef: "tool",
        methodQualificationRef: "m",
        providerQualificationRef: "p",
        applicationQualificationRef: "a",
        sourceModelRef: "s",
        requestedBy: "user",
        allowFallbackProvider: true,
      }),
    ).toThrow(/provider_fallback_forbidden/);

    const unavailable = createAndAuthorizeExecutionJob({
      jobId: "j3",
      tenantId: "t1",
      workspaceId: "w1",
      providerId: "spacegass",
      toolRegistrationRef: "tool",
      methodQualificationRef: "m",
      providerQualificationRef: "p",
      applicationQualificationRef: "a",
      sourceModelRef: "s",
      requestedBy: "user",
      providerAvailable: false,
    });
    expect(unavailable.ok).toBe(false);
    expect(unavailable.status).toBe("provider_unavailable");
  });

  it("isolates workspaces and certifies sandbox baseline", () => {
    const base = mkdtempSync(join(tmpdir(), "eeh-ws-"));
    const mgr = new ExecutionWorkspaceManager({ baseDir: base });
    const a = mgr.create("jobA");
    const b = mgr.create("jobB");
    mgr.assertNoCrossJobAccess(a, b);
    mgr.stageInput(a, "in.txt", "hello");
    expect(mgr.readStaged(a, "in.txt")).toBe("hello");
    const sandbox = certifySandboxBaseline({
      rootDir: a.rootDir,
      candidatePath: join(a.inputDir, "in.txt"),
      timeoutMs: 60_000,
      command: "spacegass-api-health",
      jobTenantId: "t1",
      hostTenantId: "t1",
    });
    expect(sandbox.ok).toBe(true);
    const cleaned = mgr.cleanup(a);
    expect(cleaned.cleanedUp).toBe(true);
  });

  it("reserves ETABS and keeps plane separation honest", () => {
    const etabs = getEtabsHostReservation();
    expect(etabs.ETABSAdapterImplemented).toBe(false);
    expect(etabs.ETABSExecutionCertified).toBe(false);
    const plane = getControlVsExecutionPlaneDeclaration();
    expect(plane.solverQualificationOwnedByHost).toBe(false);
    expect(plane.silentSolverFallbackAllowed).toBe(false);
    const artifact = bindJobArtifact({
      jobId: "j1",
      artifactId: "a1",
      platformFileRef: "pf_123",
      role: "output",
    });
    expect(artifact.ref.inlinePayloadForbidden).toBe(true);
  });

  it("runs SPACE GASS availability probe without requiring live PASS", async () => {
    const report = await probeSpaceGassHost({ timeoutMs: 1500 });
    expect(report.providerId).toBe("spacegass");
    expect(report.detectOnly).toBe(true);
    expect(report.SPACEGASSLiveExecutionCertified).toBe(false);
    expect(report.executionCertified).toBe(false);
    // Probe may report unavailable — that is acceptable for 13D.1.
    expect(["healthy", "degraded", "unavailable", "unknown"]).toContain(
      report.healthStatus,
    );
  }, 20_000);
});
