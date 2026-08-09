import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertEngineeringFederationModel,
  assertEngineeringInteropOwnershipLock,
  assertEngineeringInteropPublicContracts,
  assertProviderDiscoveryMatrix,
  assertTerminologyLocks,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  createDurableEngineeringModelMemoryStore,
  createEngineeringModelFederationService,
  createEngineeringModelRepository,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_PHASE,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  FULL_BIM_VIEWER_IMPLEMENTED,
  getEngineeringInteropIfcFederationDeclaration,
  getProviderDiscoveryRow,
  IFC_FEDERATION_READY,
  MODEL_MUTATION_IMPLEMENTED,
  PHASE_13A_CERTIFIED_COMMIT,
  PHASE_13C_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  SOLVER_EXECUTION_IMPLEMENTED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
} from "../src/index";

const fixturePath = resolve(
  __dirname,
  "../fixtures/sample-project.ifc",
);

describe("Phase 13B Engineering Model Interoperability IFC federation", () => {
  it("declares ifc-federation version and readiness flags", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe(
      "0.2.0-ifc-federation",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PHASE).toBe("13B");
    expect(PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(IFC_FEDERATION_READY).toBe(true);
    expect(AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED).toBe(false);
    expect(SOLVER_EXECUTION_IMPLEMENTED).toBe(false);
    expect(MODEL_MUTATION_IMPLEMENTED).toBe(false);
    expect(FULL_BIM_VIEWER_IMPLEMENTED).toBe(false);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(SOURCE_MODEL_OWNERSHIP_PRESERVED).toBe(true);
    expect(PHASE_13C_READY).toBe(true);
    expect(PHASE_13A_CERTIFIED_COMMIT).toBe(
      "5d238f24a3c61b95011c6c2a0ab2f1bf81540267",
    );
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.2.0-ifc-federation");
    expect(DIGITAL_TWIN_V1_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_V1_COMMIT).toBe(
      "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
    );
  });

  it("locks ownership and public contracts for IFC runtime", () => {
    const lock = assertEngineeringInteropOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.EngineeringModelInteroperabilityRuntimeReady).toBe(true);
    expect(lock.IFCFederationReady).toBe(true);
    expect(lock.fullBimViewerImplemented).toBe(false);
    expect(lock.sourceModelOwnershipPreserved).toBe(true);
    expect(lock.digitalTwinMayOwnSourceModel).toBe(false);
    expect(assertTerminologyLocks().ok).toBe(true);
    expect(assertEngineeringFederationModel().ok).toBe(true);
    expect(assertEngineeringInteropPublicContracts().runtimeBacked).toBe(true);
    expect(assertEngineeringInteropPublicContracts().ga).toBe(false);
  });

  it("marks IFC production adapter only", () => {
    const matrix = assertProviderDiscoveryMatrix();
    expect(matrix.ifcProductionOnly).toBe(true);
    expect(getProviderDiscoveryRow("ifc_openbim")?.productionAdapterImplemented).toBe(
      true,
    );
    expect(getProviderDiscoveryRow("etabs")?.productionAdapterImplemented).toBe(
      false,
    );
    expect(
      getProviderDiscoveryRow("spacegass")?.productionAdapterImplemented,
    ).toBe(false);
  });

  it("federates fixture IFC content end-to-end", async () => {
    const content = readFileSync(fixturePath, "utf8");
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
      platformFileRef: "platform_files:fixtures/sample-project.ifc",
    });

    expect(result.model.owner).toBe("source_client_engineering_application");
    expect(result.model.rtbOwned).toBe(false);
    expect(result.model.formatFamily).toBe("ifc");
    expect(result.version.schemaId).toBe("IFC4");
    expect(result.elements.length).toBeGreaterThan(3);
    expect(
      result.elements.some((e) => e.ifcEntityType === "IFCBEAM"),
    ).toBe(true);

    const mapping = await service.proposeMapping({
      tenantId: result.model.tenantId,
      workspaceId: result.model.workspaceId,
      modelRefId: result.model.modelRefId,
      elementRefId: result.elements[0]?.elementRefId,
      targetKind: "asset",
      candidateTargetId: "asset_demo_1",
    });
    expect(mapping.state).toBe("candidate");
    expect(mapping.aiSelfApproval).toBe(false);

    const reviewed = await service.recordMappingReview({
      tenantId: result.model.tenantId,
      workspaceId: result.model.workspaceId,
      mappingId: mapping.mappingId,
      decision: "confirm",
      reviewerId: "00000000-0000-4000-8000-000000000099",
    });
    expect(reviewed.mapping.state).toBe("confirmed");

    const external = await service.referenceExternalResult({
      tenantId: result.model.tenantId,
      workspaceId: result.model.workspaceId,
      modelRefId: result.model.modelRefId,
      externalResultId: "ext_result_1",
    });
    expect(external.trustClassification).toBe("source_declared");
    expect(external.trustClassification).not.toBe("rtb_execution_certified");
  });

  it("fail-closes unsupported IFC schema", async () => {
    const repo = createEngineeringModelRepository({ adapter: "memory" });
    const service = createEngineeringModelFederationService(repo);
    await expect(
      service.federateIfc({
        tenantId: "t",
        workspaceId: "w",
        locator: "bad.ifc",
        content:
          "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC99X'));\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n",
      }),
    ).rejects.toThrow(/unsupported_schema/);
  });

  it("forbids production memory repository", () => {
    expect(() =>
      createEngineeringModelRepository({
        adapter: "memory",
        nodeEnv: "production",
      }),
    ).toThrow(/production_memory_repository_forbidden/);
  });

  it("exposes coherent IFC federation declaration", () => {
    const d = getEngineeringInteropIfcFederationDeclaration();
    expect(d.version).toBe("0.2.0-ifc-federation");
    expect(d.status).toBe("ifc_federation");
    expect(d.EngineeringModelInteroperabilityRuntimeReady).toBe(true);
    expect(d.IFCFederationReady).toBe(true);
    expect(d.phase13CReady).toBe(true);
    expect(d.DigitalTwinV1Intact).toBe(true);
    expect(d.externalModelOwnership).toBe(
      "source_client_engineering_application",
    );
  });
});
