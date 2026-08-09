import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED,
  assertEngineeringFederationModel,
  assertEngineeringInteropOwnershipLock,
  assertEngineeringInteropPublicContracts,
  assertProviderDiscoveryMatrix,
  assertSpaceGassCapabilityRegistry,
  assertSpaceGassFourLayerQualification,
  assertTerminologyLocks,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  createDurableEngineeringModelMemoryStore,
  createEngineeringModelFederationService,
  createEngineeringModelRepository,
  createSPACEGASSSolverAdapter,
  createSpaceGassFourLayerQualificationBundle,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_PHASE,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABSAdapterImplemented,
  FULL_BIM_VIEWER_IMPLEMENTED,
  getEngineeringInteropSpaceGassDeclaration,
  getProviderDiscoveryRow,
  IFC_FEDERATION_READY,
  MODEL_MUTATION_IMPLEMENTED,
  NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED,
  PHASE_13A_CERTIFIED_COMMIT,
  PHASE_13B_CERTIFIED_COMMIT,
  PHASE_13C_READY,
  PHASE_13D_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SOLVER_EXECUTION_IMPLEMENTED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
  SPACEGASS_FEDERATION_READY,
  SPACEGASSFirstMethodQualified,
  SPACEGASSSolverAdapterReady,
  spaceGassHostedExecutionCertified,
} from "../src/index";

const ifcFixturePath = resolve(__dirname, "../fixtures/sample-project.ifc");
const sgFixturePath = resolve(
  __dirname,
  "../fixtures/spacegass/sample-project.spacegass.json",
);

describe("Phase 13C Engineering Model Interoperability SPACE GASS", () => {
  it("declares spacegass version and readiness flags", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe("0.3.0-spacegass");
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PHASE).toBe("13C");
    expect(PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(IFC_FEDERATION_READY).toBe(true);
    expect(SPACEGASS_FEDERATION_READY).toBe(true);
    expect(NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED).toBe(true);
    expect(SPACEGASSSolverAdapterReady).toBe(true);
    expect(SPACEGASSFirstMethodQualified).toBe(true);
    expect(spaceGassHostedExecutionCertified).toBe(false);
    expect(SILENT_SOLVER_FALLBACK_ALLOWED).toBe(false);
    expect(AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED).toBe(false);
    expect(SOLVER_EXECUTION_IMPLEMENTED).toBe(false);
    expect(ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED).toBe(true);
    expect(MODEL_MUTATION_IMPLEMENTED).toBe(false);
    expect(FULL_BIM_VIEWER_IMPLEMENTED).toBe(false);
    expect(ETABSAdapterImplemented).toBe(false);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(SOURCE_MODEL_OWNERSHIP_PRESERVED).toBe(true);
    expect(PHASE_13C_READY).toBe(true);
    expect(PHASE_13D_READY).toBe(true);
    expect(PHASE_13A_CERTIFIED_COMMIT).toBe(
      "5d238f24a3c61b95011c6c2a0ab2f1bf81540267",
    );
    expect(PHASE_13B_CERTIFIED_COMMIT).toBe(
      "1540f806ada0cf70179c3cfdffe4157f29620778",
    );
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.3.0-spacegass");
    expect(DIGITAL_TWIN_V1_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_V1_COMMIT).toBe(
      "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
    );
  });

  it("locks ownership and public contracts for SPACE GASS runtime", () => {
    const lock = assertEngineeringInteropOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.SpaceGassFederationReady).toBe(true);
    expect(lock.IFCFederationReady).toBe(true);
    expect(lock.spaceGassHostedExecutionCertified).toBe(false);
    expect(lock.additionalExternalSolverExecutionImplemented).toBe(true);
    expect(lock.sourceModelOwnershipPreserved).toBe(true);
    expect(assertTerminologyLocks().ok).toBe(true);
    expect(assertEngineeringFederationModel().ok).toBe(true);
    expect(assertEngineeringInteropPublicContracts().spacegassFederation).toBe(
      true,
    );
    expect(assertEngineeringInteropPublicContracts().ga).toBe(false);
  });

  it("marks IFC + SPACE GASS production adapters; ETABS false", () => {
    const matrix = assertProviderDiscoveryMatrix();
    expect(matrix.spacegassProductionAdapter).toBe(true);
    expect(matrix.ifcProductionAdapter).toBe(true);
    expect(matrix.etabsProductionAdapter).toBe(false);
    expect(getProviderDiscoveryRow("ifc_openbim")?.productionAdapterImplemented).toBe(
      true,
    );
    expect(getProviderDiscoveryRow("spacegass")?.productionAdapterImplemented).toBe(
      true,
    );
    expect(getProviderDiscoveryRow("etabs")?.productionAdapterImplemented).toBe(
      false,
    );
  });

  it("federates fixture IFC content end-to-end (13B coexistence)", async () => {
    const content = readFileSync(ifcFixturePath, "utf8");
    const repo = createEngineeringModelRepository({
      adapter: "memory",
      memoryStore: createDurableEngineeringModelMemoryStore(),
    });
    const service = createEngineeringModelFederationService(repo);
    const result = await service.federateIfc({
      tenantId: "00000000-0000-4000-8000-000000000001",
      workspaceId: "00000000-0000-4000-8000-000000000002",
      locator: "platform_files:fixtures/sample-project.ifc",
      content,
    });
    expect(result.model.providerKey).toBe("ifc_openbim");
    expect(result.elements.length).toBeGreaterThan(0);
  });

  it("federates SPACE GASS fixture with existing results as source_declared", async () => {
    const content = readFileSync(sgFixturePath, "utf8");
    const repo = createEngineeringModelRepository({
      adapter: "memory",
      memoryStore: createDurableEngineeringModelMemoryStore(),
    });
    const service = createEngineeringModelFederationService(repo);
    const result = await service.federateSpaceGass({
      tenantId: "00000000-0000-4000-8000-000000000001",
      workspaceId: "00000000-0000-4000-8000-000000000002",
      locator: "platform_files:fixtures/spacegass/sample-project.spacegass.json",
      content,
    });
    expect(result.model.providerKey).toBe("spacegass");
    expect(result.elements.some((e) => e.elementKind === "node")).toBe(true);
    expect(result.elements.some((e) => e.elementKind === "member")).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    for (const r of result.results) {
      expect(r.provenance).toBe("external_existing");
      expect(r.trustClassification).toBe("source_declared");
      expect(r.rtbGenerated).toBe(false);
    }
  });

  it("qualifies four-layer SPACE GASS records without hosted certification", () => {
    expect(assertSpaceGassCapabilityRegistry().onlySelectedQualified).toBe(true);
    const bundle = createSpaceGassFourLayerQualificationBundle();
    const q = assertSpaceGassFourLayerQualification(bundle);
    expect(q.SPACEGASSFirstMethodQualified).toBe(true);
    expect(q.spaceGassHostedExecutionCertified).toBe(false);
  });

  it("fail-closes SPACE GASS execution when runtime unavailable", async () => {
    const adapter = createSPACEGASSSolverAdapter({ env: {} });
    const result = await adapter.execute({
      requestId: "req_neg_unavailable",
      adapterId: adapter.adapterId,
      solverId: "spacegass",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/sg-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: {
        projectId: "p1",
        projectApprovedProviders: "spacegass",
        modelRefId: "m1",
      },
    });
    expect(result.status).toBe("failed");
    expect(result.errorCode).toBe("solver_unavailable");
    expect(result.silentFallbackUsed).toBe(false);
    expect(result.externalProcessSpawned).toBe(false);
  });

  it("fail-closes on unapproved project and wrong version", async () => {
    const unapproved = createSPACEGASSSolverAdapter({
      env: {
        SPACEGASS_HOME: "C:\\SpaceGass",
        SPACEGASS_VERSION: "14.0",
        SPACEGASS_LICENSE_PRESENT: "1",
      },
    });
    const r1 = await unapproved.execute({
      requestId: "req_neg_project",
      adapterId: unapproved.adapterId,
      solverId: "spacegass",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/sg-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: { projectId: "p1", projectApprovedProviders: "etabs" },
    });
    expect(r1.errorCode).toBe("project_not_approved");

    const wrongVer = createSPACEGASSSolverAdapter({
      env: {
        SPACEGASS_HOME: "C:\\SpaceGass",
        SPACEGASS_VERSION: "10.0",
        SPACEGASS_LICENSE_PRESENT: "1",
      },
    });
    const r2 = await wrongVer.execute({
      requestId: "req_neg_version",
      adapterId: wrongVer.adapterId,
      solverId: "spacegass",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/sg-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: {
        projectId: "p1",
        projectApprovedProviders: "spacegass",
        modelRefId: "m1",
      },
    });
    expect(r2.errorCode).toBe("wrong_version");
  });

  it("declaration exposes SPACE GASS honesty flags", () => {
    const d = getEngineeringInteropSpaceGassDeclaration();
    expect(d.version).toBe("0.3.0-spacegass");
    expect(d.spaceGassHostedExecutionCertified).toBe(false);
    expect(d.SPACEGASSSolverAdapterReady).toBe(true);
    expect(d.phase13DReady).toBe(true);
    expect(d.DigitalTwinV1Intact).toBe(true);
  });
});
