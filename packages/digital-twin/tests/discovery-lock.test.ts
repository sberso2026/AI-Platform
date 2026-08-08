import { describe, expect, it } from "vitest";
import {
  assertCoreContracts,
  assertDraftContractsOnly,
  assertFidelityNotImplemented,
  assertOwnershipLock,
  DIGITAL_TWIN_DISCOVERY_IMPLEMENTED,
  DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_MODULE_KEY,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_PRODUCT_NAME,
  DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  digitalTwinDiscoveryReady,
  digitalTwinOwnershipLocked,
  FIDELITY_MODEL,
  getDigitalTwinCoreDeclaration,
  HOSTED_PERSISTENCE_READY,
  KNOWLEDGE_GRAPH_REUSE,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHASE_12A_CERTIFIED_COMMIT,
  PHASE_12A_VERSION,
  PHASE_12C_READY,
  PRODUCTION_DIGITAL_TWIN_READY,
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
  PROJECT_CONTROLS_V1_COMMIT,
  TWIN_IDENTITY_READY,
} from "../src/index";

describe("Phase 12A/12B Digital Twin discovery and core lock", () => {
  it("declares core identity and version (12B)", () => {
    expect(DIGITAL_TWIN_PRODUCT_NAME).toBe("Digital Twin");
    expect(DIGITAL_TWIN_MODULE_KEY).toBe("digital_twin");
    expect(DIGITAL_TWIN_VERSION).toBe("0.2.0-core");
    expect(DIGITAL_TWIN_STATUS).toBe("core");
    expect(DIGITAL_TWIN_PHASE).toBe("12B");
    expect(DIGITAL_TWIN_DISCOVERY_IMPLEMENTED).toBe(true);
    expect(DIGITAL_TWIN_IMPLEMENTED).toBe(true);
    expect(digitalTwinDiscoveryReady).toBe(true);
    expect(digitalTwinOwnershipLocked).toBe(true);
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.2.0-core-draft");
    expect(TWIN_IDENTITY_READY).toBe(true);
    expect(KNOWLEDGE_GRAPH_REUSE).toBe(true);
    expect(HOSTED_PERSISTENCE_READY).toBe(true);
    expect(DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED).toBe(true);
    expect(PHASE_12C_READY).toBe(true);
  });

  it("pins Phase 12A certified baseline", () => {
    expect(PHASE_12A_CERTIFIED_COMMIT).toBe("2c5ed03f7de12cde9bfb71a9d430f5e342291303");
    expect(PHASE_12A_VERSION).toBe("0.1.0-discovery");
  });

  it("keeps every production/runtime lock closed", () => {
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
    expect(lock.digitalTwinImplemented).toBe(true);
    expect(lock.productionDigitalTwinReady).toBe(false);
    expect(lock.publicContractVersion).toBe("0.2.0-core-draft");
  });

  it("reserves L0–L5 fidelity without implementation beyond L0", () => {
    expect(FIDELITY_MODEL.length).toBe(6);
    expect(assertFidelityNotImplemented().maxAvailableLevel).toBe("L0");
    expect(assertDraftContractsOnly().contractVersion).toBe("0.2.0-core-draft");
    expect(assertCoreContracts().contractVersion).toBe("0.2.0-core-draft");
  });

  it("pins frozen V1 baselines", () => {
    expect(PROJECT_CONTROLS_V1_COMMIT).toBe("b17fe4cfe2574520ec813a7b43ba7328a585d741");
    expect(ASSET_INTELLIGENCE_V1_COMMIT).toBe("925e2ed74025cac6a145c346c17c53320efb8757");
    expect(PROJECT_INTELLIGENCE_V1_COMMIT).toBe("34975b1cf660580d46287f24e746b8915903f768");
    expect(INSPECTION_INTELLIGENCE_V1_COMMIT).toBe("d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09");
  });

  it("exposes a coherent core declaration", () => {
    const declaration = getDigitalTwinCoreDeclaration();
    expect(declaration.version).toBe("0.2.0-core");
    expect(declaration.status).toBe("core");
    expect(declaration.digitalTwinImplemented).toBe(true);
    expect(declaration.productionDigitalTwinReady).toBe(false);
    expect(declaration.digitalTwinRuntimeImplemented).toBe(false);
    expect(declaration.phase12CReady).toBe(true);
    expect(declaration.twinIdentityReady).toBe(true);
    expect(declaration.digitalTwinProductTablesIntroduced).toBe(true);
    expect(declaration.identityReviewSlug).toBe("digital_twin.identity_review");
  });
});
