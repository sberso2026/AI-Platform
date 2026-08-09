import { describe, expect, it } from "vitest";
import {
  assertEngineeringFederationModel,
  assertEngineeringInteropDraftContracts,
  assertEngineeringInteropOwnershipLock,
  assertExistingFootprintInventory,
  assertProviderDiscoveryMatrix,
  assertTerminologyLocks,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  DUPLICATE_TOOL_FRAMEWORK_DETECTED,
  ENGINEERING_FEDERATION_MODEL_LOCKED,
  ENGINEERING_MODEL_INTEROPERABILITY_PHASE,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABS_INTEGRATION_DISCOVERED,
  getEngineeringInteropDiscoveryDeclaration,
  getProviderDiscoveryRow,
  IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED,
  INTEROP_DISCOVERY_READY,
  PHASE_13B_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PUBLIC_CONTRACT_VERSION,
  resolveProjectApprovedProvider,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
  SPACE_GASS_INTEGRATION_DISCOVERED,
} from "../src/index";

describe("Phase 13A Engineering Model Interoperability discovery", () => {
  it("declares interop-discovery version and readiness flags", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe(
      "0.1.0-interop-discovery",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PHASE).toBe("13A");
    expect(INTEROP_DISCOVERY_READY).toBe(true);
    expect(ENGINEERING_FEDERATION_MODEL_LOCKED).toBe(true);
    expect(PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED).toBe(false);
    expect(AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED).toBe(false);
    expect(DUPLICATE_TOOL_FRAMEWORK_DETECTED).toBe(false);
    expect(SOURCE_MODEL_OWNERSHIP_PRESERVED).toBe(true);
    expect(IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED).toBe(true);
    expect(ETABS_INTEGRATION_DISCOVERED).toBe(true);
    expect(SPACE_GASS_INTEGRATION_DISCOVERED).toBe(true);
    expect(PHASE_13B_READY).toBe(true);
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.1.0-draft");
    expect(DIGITAL_TWIN_V1_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_V1_COMMIT).toBe(
      "a94425ed009ca087c2f44c9d3757c0c82bd936b1",
    );
  });

  it("locks ownership, federation, terminology, and draft contracts", () => {
    const lock = assertEngineeringInteropOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.EngineeringFederationModelLocked).toBe(true);
    expect(lock.productionInteroperabilityRuntimeImplemented).toBe(false);
    expect(lock.duplicateToolFrameworkDetected).toBe(false);
    expect(lock.sourceModelOwnershipPreserved).toBe(true);

    expect(assertTerminologyLocks().ok).toBe(true);
    expect(assertEngineeringFederationModel().ok).toBe(true);
    expect(assertEngineeringInteropDraftContracts().contractVersion).toBe(
      "0.1.0-draft",
    );
    expect(assertEngineeringInteropDraftContracts().ga).toBe(false);
  });

  it("inventories providers with independent capability flags", () => {
    const matrix = assertProviderDiscoveryMatrix();
    expect(matrix.etabsDiscovered).toBe(true);
    expect(matrix.spaceGassDiscovered).toBe(true);
    expect(matrix.noProductionAdapters).toBe(true);

    const etabs = getProviderDiscoveryRow("etabs");
    expect(etabs?.capabilities.modelFederationSupported).toBe(true);
    expect(etabs?.capabilities.solverExecutionSupported).toBe(true);
    expect(etabs?.digitalTwinReservedStub).toBe(true);
    expect(etabs?.productionAdapterImplemented).toBe(false);

    const ifc = getProviderDiscoveryRow("ifc_openbim");
    expect(ifc?.capabilities.modelFederationSupported).toBe(true);

    const calculix = getProviderDiscoveryRow("calculix");
    expect(calculix?.category).toBe("existing_certified");

    expect(assertExistingFootprintInventory().calculixCertifiedOnly).toBe(true);
  });

  it("abstains when provider is not project-approved", () => {
    const denied = resolveProjectApprovedProvider({
      requestedProviderId: "etabs",
      policy: {
        projectApprovedProviders: ["calculix"],
        silentSubstituteForbidden: true,
        abstainWhenNotApproved: true,
      },
    });
    expect(denied.action).toBe("abstain");
    expect(denied.approved).toBe(false);

    const allowed = resolveProjectApprovedProvider({
      requestedProviderId: "calculix",
      policy: {
        projectApprovedProviders: ["calculix"],
        silentSubstituteForbidden: true,
        abstainWhenNotApproved: true,
      },
    });
    expect(allowed.action).toBe("allow");
  });

  it("exposes coherent discovery declaration", () => {
    const d = getEngineeringInteropDiscoveryDeclaration();
    expect(d.version).toBe("0.1.0-interop-discovery");
    expect(d.status).toBe("interop_discovery");
    expect(d.phase13BReady).toBe(true);
    expect(d.DigitalTwinV1Intact).toBe(true);
    expect(d.canonicalAssetOwnership).toBe("engineering_os_shared_domain");
    expect(d.canonicalProjectOwnership).toBe(
      "engineering_os_shared_project_domain",
    );
    expect(d.canonicalSpatialOwnership).toBe(
      "engineering_os_shared_spatial_domain",
    );
    expect(d.externalModelOwnership).toBe(
      "source_client_engineering_application",
    );
  });
});
