import { describe, expect, it } from "vitest";
import {
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  PUBLIC_CONTRACT_VERSION,
  PHASE_12I_CERTIFIED_COMMIT,
  PHASE_12I_HOSTED_RUN,
  PHASE_12I_VERSION,
  SolverCapabilityRegistryReady,
  ProviderCompatibilityMatrixReady,
  CapabilityDiscoveryReady,
  SimulationPackageExtended,
  FourLayerQualificationIntact,
  RealSolverExecutionCertified,
  CalculiXAdapterIntact,
  silentSolverFallbackAllowed,
  nativeEngineeringSolverImplemented,
  PHASE_12K_READY,
  getDigitalTwinSolverCapabilitiesDeclaration,
} from "../src/version";
import {
  assertOnlyCalculiXLinearStaticQualified,
  CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
  CALCULIX_MODAL_CAPABILITY_ID,
  createEngineeringSolverCapabilityRegistry,
} from "../src/domain/solvers/engineering-solver-capability-registry";
import {
  assertCapabilityDoesNotQualifySolver,
  assertFourLayerSeparation,
  seedCalculiXLinearStaticQualification,
} from "../src/domain/solvers/solver-capability-qualification";
import { createSolverProviderCompatibilityMatrix } from "../src/domain/solvers/solver-provider-compatibility-matrix";
import {
  createEngineeringCapabilityDiscoveryService,
  rejectExecuteOnDiscover,
} from "../src/domain/solvers/engineering-capability-discovery";
import {
  createCapabilityReview,
  decideCapabilityReview,
  submitCapabilityReview,
} from "../src/domain/solvers/capability-review";
import {
  createTwinSimulationPackage,
  extendSimulationPackageWithCapability,
} from "../src/domain/simulation-package";
import { SOLVER_CAPABILITY_DOMAIN_EVENTS } from "../src/domain/simulation-events";
import { LINEAR_ELASTIC_STATIC_METHOD_KEY } from "../src/domain/solvers/solver-mappers";
import { assertOwnershipLock } from "../src/architecture/ownership-lock";

describe("Phase 12J Digital Twin solver capabilities", () => {
  it("declares solver capabilities version and status", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.11.0-digital-thread");
    expect(DIGITAL_TWIN_STATUS).toBe("digital_thread");
    expect(DIGITAL_TWIN_PHASE).toBe("12K");
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.11.0-digital-thread-draft");
  });

  it("pins Phase 12I certified baseline", () => {
    expect(PHASE_12I_CERTIFIED_COMMIT).toBe(
      "6989d310a91b04db5949954a57db060782dd8dec",
    );
    expect(PHASE_12I_HOSTED_RUN).toBe("31265781321");
    expect(PHASE_12I_VERSION).toBe("0.9.0-external-solver");
  });

  it("enables capability registry flags and preserves 12I evidence", () => {
    expect(SolverCapabilityRegistryReady).toBe(true);
    expect(ProviderCompatibilityMatrixReady).toBe(true);
    expect(CapabilityDiscoveryReady).toBe(true);
    expect(SimulationPackageExtended).toBe(true);
    expect(FourLayerQualificationIntact).toBe(true);
    expect(RealSolverExecutionCertified).toBe(true);
    expect(CalculiXAdapterIntact).toBe(true);
    expect(silentSolverFallbackAllowed).toBe(false);
    expect(nativeEngineeringSolverImplemented).toBe(false);
    expect(PHASE_12K_READY).toBe(true);
  });

  it("seeds only CalculiX linear_static as qualified", () => {
    const registry = createEngineeringSolverCapabilityRegistry();
    const result = assertOnlyCalculiXLinearStaticQualified(registry);
    expect(result.qualifiedCount).toBe(1);
    expect(registry.getCapability(CALCULIX_LINEAR_STATIC_CAPABILITY_ID)?.qualificationStatus).toBe(
      "qualified",
    );
    expect(registry.getCapability(CALCULIX_MODAL_CAPABILITY_ID)?.qualificationStatus).toBe(
      "reserved",
    );
    expect(registry.listCapabilities({ solverId: "abaqus" })[0]?.qualificationStatus).toBe(
      "reserved",
    );
  });

  it("never implies whole-solver qualification", () => {
    const q = seedCalculiXLinearStaticQualification();
    expect(assertCapabilityDoesNotQualifySolver(q).ok).toBe(true);
    const registry = createEngineeringSolverCapabilityRegistry();
    const cap = registry.getCapability(CALCULIX_LINEAR_STATIC_CAPABILITY_ID)!;
    expect(
      assertFourLayerSeparation({
        capability: cap,
        methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
        providerId: "calculix",
        applicationKey: "bridge_static",
        executionId: "exec-1",
      }).layersDistinct,
    ).toBe(true);
  });

  it("compatibility matrix queries without execution", () => {
    const registry = createEngineeringSolverCapabilityRegistry();
    const matrix = createSolverProviderCompatibilityMatrix(registry);
    const snap = matrix.query({
      methodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      solverId: "calculix",
      solverVersion: "2.21",
      applicationKey: "bridge",
      projectType: "structural",
    });
    expect(snap.compatible).toBe(true);
    expect(snap.executable).toBe(true);
    const reserved = matrix.query({
      methodKey: "modal",
      solverId: "calculix",
      capabilityId: CALCULIX_MODAL_CAPABILITY_ID,
    });
    expect(reserved.executable).toBe(false);
  });

  it("discovery rejects execute-on-discover", () => {
    expect(() => rejectExecuteOnDiscover({ execute: true })).toThrow(
      /capability_discovery_execute_forbidden/,
    );
    const registry = createEngineeringSolverCapabilityRegistry();
    const matrix = createSolverProviderCompatibilityMatrix(registry);
    const discovery = createEngineeringCapabilityDiscoveryService(registry, matrix);
    const result = discovery.discover({ solverId: "calculix" });
    expect(result.executed).toBe(false);
    expect(result.autoQualified).toBe(false);
    expect(result.capabilities.length).toBeGreaterThan(0);
  });

  it("capability review forbids AI self-approval", () => {
    const review = createCapabilityReview({
      reviewId: "rev-1",
      subjectRef: CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
    });
    const submitted = submitCapabilityReview(review, "engineer-1");
    expect(() => decideCapabilityReview(submitted, "approved", "ai")).toThrow(
      /automatic_or_ai_self_approval_forbidden/,
    );
    const decided = decideCapabilityReview(submitted, "approved", "engineer-2");
    expect(decided.status).toBe("approved");
    expect(decided.historicImmutable).toBe(true);
  });

  it("extends simulation package with capability pins", () => {
    const pkg = createTwinSimulationPackage({
      packageId: "pkg-1",
      packageVersionId: "pkgv-1",
      tenantId: "t1",
      workspaceId: "w1",
      twinId: "twin-1",
      packageKey: "k1",
      methodId: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      providerId: "calculix",
      requiredArtifactClasses: [],
    });
    const extended = extendSimulationPackageWithCapability(pkg, {
      capabilityId: CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
      capabilityVersion: "1.0.0",
      providerVersion: "2.21",
      adapterVersion: "1.0.0",
      compatibilitySnapshot: { compatible: true, executable: true, reason: "ok" },
    });
    expect(extended.manifest.capabilityExtension?.capabilityId).toBe(
      CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
    );
  });

  it("emits capability domain events identifiers only", () => {
    expect(SOLVER_CAPABILITY_DOMAIN_EVENTS).toContain(
      "engineering.solver.capability.registered",
    );
    expect(SOLVER_CAPABILITY_DOMAIN_EVENTS).toContain(
      "engineering.solver.capability.qualified",
    );
    expect(SOLVER_CAPABILITY_DOMAIN_EVENTS).toContain(
      "engineering.solver.capability.revoked",
    );
    expect(SOLVER_CAPABILITY_DOMAIN_EVENTS).toContain("engineering.solver.provider.updated");
  });

  it("ownership lock includes capability registry flags", () => {
    const lock = assertOwnershipLock();
    expect(lock.solverCapabilityRegistryReady).toBe(true);
    expect(lock.fourLayerQualificationIntact).toBe(true);
    expect(lock.realSolverExecutionCertified).toBe(true);
    expect(lock.calculixAdapterIntact).toBe(true);
  });

  it("declaration reports phase 12J identity", () => {
    const d = getDigitalTwinSolverCapabilitiesDeclaration();
    expect(d.version).toBe("0.11.0-digital-thread");
    expect(d.phase).toBe("12K");
    expect(d.phase12KReady).toBe(true);
    expect(d.phase12ICertifiedCommit).toBe(PHASE_12I_CERTIFIED_COMMIT);
  });
});
