import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED,
  assertEngineeringFederationModel,
  assertEngineeringInteropOwnershipLock,
  assertEngineeringInteropPublicContracts,
  assertEtabsCapabilityRegistry,
  assertEtabsQualificationBundle,
  assertProviderDiscoveryMatrix,
  assertTerminologyLocks,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  createDurableEngineeringModelMemoryStore,
  createEngineeringModelFederationService,
  createEngineeringModelRepository,
  createETABSSolverAdapter,
  createEtabsQualificationBundle,
  createSPACEGASSSolverAdapter,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_PHASE,
  ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABSAdapterImplemented,
  ETABSControlledExecutionCertified,
  ETABSHostedExecutionCertified,
  ETABSModelFederationReady,
  ETABSResultFederationReady,
  ETABSSolverAdapterReady,
  FULL_BIM_VIEWER_IMPLEMENTED,
  getEngineeringInteropEtabsFederationDeclaration,
  getProviderDiscoveryRow,
  IFC_FEDERATION_READY,
  MODEL_MUTATION_IMPLEMENTED,
  NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED,
  PHASE_13A_CERTIFIED_COMMIT,
  PHASE_13B_CERTIFIED_COMMIT,
  PHASE_13C_CERTIFIED_COMMIT,
  PHASE_13C_READY,
  PHASE_13D1_CERTIFIED_COMMIT,
  PHASE_13D_READY,
  PHASE_13E_READY,
  PHASE_13F_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  SAP2000AdapterImplemented,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SOLVER_EXECUTION_IMPLEMENTED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
  SPACEGASS_FEDERATION_READY,
  SPACEGASSLiveExecutionCertified,
  SPACEGASSLiveProviderReady,
  SPACEGASSSolverAdapterReady,
  spaceGassHostedExecutionCertified,
} from "../src/index";

const ifcFixturePath = resolve(__dirname, "../fixtures/sample-project.ifc");
const sgFixturePath = resolve(
  __dirname,
  "../fixtures/spacegass/sample-project.spacegass.json",
);
const etabsFixturePath = resolve(
  __dirname,
  "../fixtures/etabs/sample-project.etabs.json",
);

describe("Phase 13E Engineering Model Interoperability ETABS", () => {
  it("declares etabs-federation version and readiness flags", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe(
      "0.4.0-etabs-federation",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_STATUS).toBe("etabs_federation");
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PHASE).toBe("13E");
    expect(PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(IFC_FEDERATION_READY).toBe(true);
    expect(SPACEGASS_FEDERATION_READY).toBe(true);
    expect(ETABSModelFederationReady).toBe(true);
    expect(ETABSResultFederationReady).toBe(true);
    expect(ETABSAdapterImplemented).toBe(true);
    expect(ETABSSolverAdapterReady).toBe(true);
    expect(ETABSHostedExecutionCertified).toBe(false);
    expect(ETABSControlledExecutionCertified).toBe(false);
    expect(NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED).toBe(true);
    expect(SPACEGASSSolverAdapterReady).toBe(true);
    expect(spaceGassHostedExecutionCertified).toBe(false);
    expect(SPACEGASSLiveExecutionCertified).toBe(false);
    expect(SPACEGASSLiveProviderReady).toBe(false);
    expect(SILENT_SOLVER_FALLBACK_ALLOWED).toBe(false);
    expect(AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED).toBe(false);
    expect(SOLVER_EXECUTION_IMPLEMENTED).toBe(false);
    expect(ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED).toBe(true);
    expect(MODEL_MUTATION_IMPLEMENTED).toBe(false);
    expect(FULL_BIM_VIEWER_IMPLEMENTED).toBe(false);
    expect(SAP2000AdapterImplemented).toBe(false);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(SOURCE_MODEL_OWNERSHIP_PRESERVED).toBe(true);
    expect(PHASE_13C_READY).toBe(true);
    expect(PHASE_13D_READY).toBe(true);
    expect(PHASE_13E_READY).toBe(true);
    expect(PHASE_13F_READY).toBe(true);
    expect(PHASE_13A_CERTIFIED_COMMIT).toBe(
      "5d238f24a3c61b95011c6c2a0ab2f1bf81540267",
    );
    expect(PHASE_13B_CERTIFIED_COMMIT).toBe(
      "1540f806ada0cf70179c3cfdffe4157f29620778",
    );
    expect(PHASE_13C_CERTIFIED_COMMIT).toBe(
      "a1c73721326927b507bb7c2f456d6188dd00e8b9",
    );
    expect(PHASE_13D1_CERTIFIED_COMMIT).toBe(
      "0bbe0c7bc686615231167f9d56cad2481c627026",
    );
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.4.0-etabs-federation");
    expect(DIGITAL_TWIN_V1_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_V1_COMMIT).toBe(
      "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
    );
  });

  it("locks ownership and public contracts for ETABS federation runtime", () => {
    const lock = assertEngineeringInteropOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.ETABSModelFederationReady).toBe(true);
    expect(lock.ETABSHostedExecutionCertified).toBe(false);
    expect(lock.SPACEGASSLiveExecutionCertified).toBe(false);
    expect(lock.SpaceGassFederationReady).toBe(true);
    expect(lock.IFCFederationReady).toBe(true);
    expect(lock.ControlledEngineeringExecutionHostReady).toBe(true);
    expect(assertTerminologyLocks().ok).toBe(true);
    expect(assertEngineeringFederationModel().ok).toBe(true);
    expect(assertEngineeringInteropPublicContracts().etabsFederation).toBe(true);
    expect(assertEngineeringInteropPublicContracts().ga).toBe(false);
  });

  it("marks IFC + SPACE GASS + ETABS production; other CSI false", () => {
    const matrix = assertProviderDiscoveryMatrix();
    expect(matrix.spacegassProductionAdapter).toBe(true);
    expect(matrix.ifcProductionAdapter).toBe(true);
    expect(matrix.etabsProductionAdapter).toBe(true);
    expect(matrix.sap2000ProductionAdapter).toBe(false);
    expect(getProviderDiscoveryRow("etabs")?.productionAdapterImplemented).toBe(
      true,
    );
    expect(getProviderDiscoveryRow("sap2000")?.productionAdapterImplemented).toBe(
      false,
    );
  });

  it("federates fixture IFC content end-to-end (coexistence)", async () => {
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

  it("federates SPACE GASS fixture (retained)", async () => {
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
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("federates ETABS export fixture with existing results as source_declared", async () => {
    const content = readFileSync(etabsFixturePath, "utf8");
    const repo = createEngineeringModelRepository({
      adapter: "memory",
      memoryStore: createDurableEngineeringModelMemoryStore(),
    });
    const service = createEngineeringModelFederationService(repo);
    const result = await service.federateEtabs({
      tenantId: "00000000-0000-4000-8000-000000000001",
      workspaceId: "00000000-0000-4000-8000-000000000002",
      locator: "platform_files:fixtures/etabs/sample-project.etabs.json",
      content,
    });
    expect(result.model.providerKey).toBe("etabs");
    expect(result.federationPath).toBe("export_fixture");
    expect(result.liveNativeCom).toBe(false);
    expect(result.elements.some((e) => e.elementKind === "joint")).toBe(true);
    expect(result.elements.some((e) => e.elementKind === "frame")).toBe(true);
    expect(result.elements.some((e) => e.elementKind === "area")).toBe(true);
    expect(result.elements.some((e) => e.elementKind === "story")).toBe(true);
    expect(result.elements.some((e) => e.elementKind === "load_case")).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    for (const r of result.results) {
      expect(r.provenance).toBe("external_existing");
      expect(r.trustClassification).toBe("source_declared");
      expect(r.rtbGenerated).toBe(false);
    }
  });

  it("qualifies ETABS federation without hosted/controlled certification", () => {
    expect(assertEtabsCapabilityRegistry().federationProven).toBe(true);
    expect(
      assertEtabsCapabilityRegistry().noExecutionMethodQualifiedOrCertified,
    ).toBe(true);
    const bundle = createEtabsQualificationBundle();
    const q = assertEtabsQualificationBundle(bundle);
    expect(q.ETABSAdapterImplemented).toBe(true);
    expect(q.ETABSHostedExecutionCertified).toBe(false);
    expect(q.ETABSControlledExecutionCertified).toBe(false);
  });

  it("fail-closes ETABS execution when COM unavailable", async () => {
    const adapter = createETABSSolverAdapter({ env: {} });
    const result = await adapter.execute({
      requestId: "req_neg_unavailable",
      adapterId: adapter.adapterId,
      solverId: "etabs",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/etabs-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: {
        projectId: "p1",
        projectApprovedProviders: "etabs",
        modelRefId: "m1",
      },
    });
    expect(result.status).toBe("failed");
    expect(result.errorCode).toBe("com_unavailable");
    expect(result.silentFallbackUsed).toBe(false);
    expect(result.externalProcessSpawned).toBe(false);
  });

  it("fail-closes on unapproved project and wrong version; never substitutes SPACE GASS", async () => {
    const unapproved = createETABSSolverAdapter({
      env: {
        ETABS_HOME: "C:\\ETABS21",
        ETABS_VERSION: "21.0",
        ETABS_LICENSE_PRESENT: "1",
      },
    });
    const r1 = await unapproved.execute({
      requestId: "req_neg_project",
      adapterId: unapproved.adapterId,
      solverId: "etabs",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/etabs-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: { projectId: "p1", projectApprovedProviders: "spacegass" },
    });
    expect(r1.errorCode).toBe("project_not_approved");

    const wrongVer = createETABSSolverAdapter({
      env: {
        ETABS_HOME: "C:\\ETABS21",
        ETABS_VERSION: "16.0",
        ETABS_LICENSE_PRESENT: "1",
      },
    });
    const r2 = await wrongVer.execute({
      requestId: "req_neg_version",
      adapterId: wrongVer.adapterId,
      solverId: "etabs",
      methodKey: "linear_elastic_static",
      artifactDir: "/tmp/etabs-test",
      inputArtifactRefs: [],
      timeoutMs: 1000,
      unitSystem: "SI",
      unitCode: "N_mm_t",
      defaultsManifestVersion: "1",
      metadata: {
        projectId: "p1",
        projectApprovedProviders: "etabs",
        modelRefId: "m1",
      },
    });
    expect(r2.errorCode).toBe("wrong_version");

    // SPACE GASS adapter still fail-closes independently — not a substitute.
    const sg = createSPACEGASSSolverAdapter({ env: {} });
    const r3 = await sg.execute({
      requestId: "req_sg_not_substitute",
      adapterId: sg.adapterId,
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
    expect(r3.status).toBe("failed");
    expect(r3.silentFallbackUsed).toBe(false);
  });

  it("declaration exposes ETABS honesty flags", () => {
    const d = getEngineeringInteropEtabsFederationDeclaration();
    expect(d.version).toBe("0.4.0-etabs-federation");
    expect(d.status).toBe("etabs_federation");
    expect(d.ETABSHostedExecutionCertified).toBe(false);
    expect(d.ETABSControlledExecutionCertified).toBe(false);
    expect(d.ETABSSolverAdapterReady).toBe(true);
    expect(d.SPACEGASSLiveExecutionCertified).toBe(false);
    expect(d.phase13FReady).toBe(true);
    expect(d.DigitalTwinV1Intact).toBe(true);
  });
});
