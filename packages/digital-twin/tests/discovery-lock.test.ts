import { describe, expect, it } from "vitest";
import {
  assertDraftContractsOnly,
  assertFidelityNotImplemented,
  assertOwnershipLock,
  DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_MODULE_KEY,
  DIGITAL_TWIN_OWNERSHIP_MATRIX,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_PRODUCT_NAME,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  DIGITAL_TWIN_DISCOVERY_IMPLEMENTED,
  digitalTwinDiscoveryReady,
  digitalTwinOwnershipLocked,
  FIDELITY_MODEL,
  getDigitalTwinDiscoveryDeclaration,
  LIVE_TELEMETRY_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PROJECT_CONTROLS_V1_COMMIT,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_EXECUTION_IMPLEMENTED,
  THREE_D_VIEWER_IMPLEMENTED,
  PHYSICAL_ACTUATION_ENABLED,
  AUTOMATIC_CONTROL_ENABLED,
  IMPLEMENTS_OWN_AI_STACK,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  ASSET_INTELLIGENCE_V1_COMMIT,
  PROJECT_INTELLIGENCE_V1_COMMIT,
  INSPECTION_INTELLIGENCE_V1_COMMIT,
} from "../src/index";

describe("Phase 12A Digital Twin discovery lock", () => {
  it("declares discovery identity and version", () => {
    expect(DIGITAL_TWIN_PRODUCT_NAME).toBe("Digital Twin");
    expect(DIGITAL_TWIN_MODULE_KEY).toBe("digital_twin");
    expect(DIGITAL_TWIN_VERSION).toBe("0.1.0-discovery");
    expect(DIGITAL_TWIN_STATUS).toBe("discovery");
    expect(DIGITAL_TWIN_PHASE).toBe("12A");
    expect(DIGITAL_TWIN_DISCOVERY_IMPLEMENTED).toBe(true);
    expect(digitalTwinDiscoveryReady).toBe(true);
    expect(digitalTwinOwnershipLocked).toBe(true);
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.1.0-draft");
  });

  it("keeps every production/runtime lock closed", () => {
    expect(DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(PRODUCTION_DIGITAL_TWIN_READY).toBe(false);
    expect(LIVE_TELEMETRY_IMPLEMENTED).toBe(false);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(false);
    expect(THREE_D_VIEWER_IMPLEMENTED).toBe(false);
    expect(PHYSICAL_ACTUATION_ENABLED).toBe(false);
    expect(AUTOMATIC_CONTROL_ENABLED).toBe(false);
    expect(IMPLEMENTS_OWN_AI_STACK).toBe(false);
    expect(DUPLICATE_ASSET_OWNERSHIP_DETECTED).toBe(false);
    expect(DUPLICATE_PROJECT_OWNERSHIP_DETECTED).toBe(false);
  });

  it("asserts ownership without claiming canonical identity", () => {
    const lock = assertOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.digitalTwinOwnership).toBe("digital_twin");
    expect(lock.canonicalAssetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(lock.canonicalProjectIdentityOwnership).toBe("engineering_os_shared_project_domain");
    expect(lock.sensorStreamOwnership).toBe("shm");
    expect(lock.productionDigitalTwinReady).toBe(false);
    expect(lock.publicContractVersion).toBe("0.1.0-draft");
  });

  it("never assigns canonical asset or project identity to digital_twin", () => {
    const forbidden = DIGITAL_TWIN_OWNERSHIP_MATRIX.filter((row) =>
      ["asset_identity_canonical", "project_identity_canonical", "asset_lifecycle_canonical"].includes(
        row.concern,
      ),
    );
    expect(forbidden.length).toBe(3);
    for (const row of forbidden) {
      expect(row.owner, row.concern).not.toBe("digital_twin");
    }
  });

  it("reserves L0–L5 fidelity without implementation beyond L0", () => {
    expect(FIDELITY_MODEL.length).toBe(6);
    expect(assertFidelityNotImplemented().maxAvailableLevel).toBe("L0");
    expect(assertDraftContractsOnly().contractVersion).toBe("0.1.0-draft");
  });

  it("pins frozen V1 baselines", () => {
    expect(PROJECT_CONTROLS_V1_COMMIT).toBe("b17fe4cfe2574520ec813a7b43ba7328a585d741");
    expect(ASSET_INTELLIGENCE_V1_COMMIT).toBe("925e2ed74025cac6a145c346c17c53320efb8757");
    expect(PROJECT_INTELLIGENCE_V1_COMMIT).toBe("34975b1cf660580d46287f24e746b8915903f768");
    expect(INSPECTION_INTELLIGENCE_V1_COMMIT).toBe("d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09");
  });

  it("exposes a coherent discovery declaration", () => {
    const declaration = getDigitalTwinDiscoveryDeclaration();
    expect(declaration.version).toBe("0.1.0-discovery");
    expect(declaration.status).toBe("discovery");
    expect(declaration.productionDigitalTwinReady).toBe(false);
    expect(declaration.digitalTwinRuntimeImplemented).toBe(false);
    expect(declaration.phase12BReady).toBe(true);
    expect(declaration.moduleRegistryStatus).toBe("coming_soon");
  });
});
