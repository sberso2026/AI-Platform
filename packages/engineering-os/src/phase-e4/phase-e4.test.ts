import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE4Invariants,
  createDisabledWriteProposal,
  EngineeringCopilotFederationBoundary,
  getPhaseE4Declaration,
  PhaseE4EssentialZeroConnector,
  PhaseE4ExternalWritesDisabled,
  PhaseE4ReadFirst,
} from "./contracts";
import {
  FileImportConnectorAdapter,
  GenericRestConnectorAdapter,
  Microsoft365ConnectorAdapter,
  MicrosoftFabricFixtureAdapter,
  NativeMockConnectorAdapter,
  SapEamConnectorAdapter,
  createExternalRecordFixture,
  createMicrosoftFabricConnectorContract,
} from "./adapters";
import { EngineeringConnectorRegistry } from "./registry";
import {
  assertNoPlaintextSecrets,
  assertSafeExternalUrl,
  sanitiseExternalText,
} from "./security";
import {
  createConfirmedConnectorMapping,
  handoffConnectorRecordsToE3,
} from "./e3-handoff";
import { retrieveConnectorEvidence } from "./connector-retrieval";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

const tenantA = "tenant-a";
const tenantB = "tenant-b";

describe("Phase E4 connector framework", () => {
  it("locks contracts and ESSENTIAL zero-connector invariant", () => {
    expect(PhaseE4EssentialZeroConnector).toBe(true);
    expect(PhaseE4ReadFirst).toBe(true);
    expect(PhaseE4ExternalWritesDisabled).toBe(true);
    expect(EngineeringCopilotFederationBoundary.microsoftCopilotRequired).toBe(false);
    expect(getPhaseE4Declaration().providers).toContain("SAP");
    assertPhaseE4Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
      essentialOperatesWithConnectorsDisabled: true,
    });
  });

  it("ESSENTIAL Ask works with all connectors disabled", async () => {
    const retrieval = new EngineeringRetrievalService(
      {
        search: async () => ({
          projects: [],
          documents: [
            {
              id: "d1",
              tenant_id: tenantA,
              title: "Native engineering decision notes",
              status: "approved",
            },
          ],
          assets: [],
          decisions: [],
          actions: [],
          risks: [],
          issues: [],
          technical_queries: [],
          lessons: [],
        }),
      },
      { available: false },
      { enabled: false },
    );
    const result = await runGroundedEngineeringAsk({
      commerce: {} as never,
      retrieval,
      query: { tenantId: tenantA, userId: "u1", query: "decision notes" },
    });
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.evidence.every((e) => e.provenance === "engineering_os_native")).toBe(true);
    expect(["E2", "E3", "E5"]).toContain(result.meta.phase);
  });

  it("file import path supports small-company / ESSENTIAL mode", async () => {
    const file = new FileImportConnectorAdapter(tenantA);
    expect(file.ingestCsv("id,title\nROW-1,Pier schedule\nROW-2,Bolt list")).toBe(2);
    const search = await file.search({ tenantId: tenantA, query: "Pier" });
    expect(search.records[0]?.externalId).toBe("ROW-1");
    expect(search.source.sourceSystem).toBeTruthy();
  });

  it("reference adapters: mock, REST, M365, Fabric, SAP distinguished by maturity", async () => {
    const mock = new NativeMockConnectorAdapter(tenantA);
    const rest = new GenericRestConnectorAdapter({ tenantId: tenantA });
    const m365 = new Microsoft365ConnectorAdapter(tenantA);
    const fabricContract = createMicrosoftFabricConnectorContract(tenantA);
    const fabricFixture = new MicrosoftFabricFixtureAdapter(tenantA);
    const sap = new SapEamConnectorAdapter(tenantA);

    expect(mock.metadata.maturity).toBe("adapter_implemented");
    expect(rest.metadata.maturity).toBe("adapter_implemented");
    expect(m365.metadata.maturity).toBe("adapter_implemented");
    expect(fabricContract.metadata.maturity).toBe("contract_only");
    expect(fabricFixture.metadata.maturity).toBe("adapter_implemented");
    expect(sap.metadata.maturity).toBe("adapter_implemented");
    // None are live_connection_certified in E4
    for (const a of [mock, rest, m365, fabricContract, fabricFixture, sap]) {
      expect(a.metadata.maturity).not.toBe("live_connection_certified");
    }
    await expect(fabricContract.search!({ tenantId: tenantA, query: "x" })).rejects.toThrow(
      /not_certified/,
    );
  });

  it("external writes remain disabled", async () => {
    const sap = new SapEamConnectorAdapter(tenantA);
    const proposal = await sap.proposeWrite!({ tenantId: tenantA, operation: "create_wo" });
    expect(proposal.status).toBe("DISABLED_IN_E4");
    expect(createDisabledWriteProposal({ tenantId: tenantA, connectorId: "x", operation: "w" }).status).toBe(
      "DISABLED_IN_E4",
    );
  });

  it("1. connector tenant isolation", () => {
    const registry = new EngineeringConnectorRegistry();
    registry.register(new NativeMockConnectorAdapter(tenantA));
    registry.register(new NativeMockConnectorAdapter(tenantB));
    expect(registry.list(tenantA)).toHaveLength(1);
    expect(registry.get(`native-mock:${tenantB}`, tenantA)).toBeNull();
  });

  it("2. connector credential isolation — refs only, no plaintext", () => {
    expect(() =>
      assertNoPlaintextSecrets({ apiKey: "sk-live-plaintext" }),
    ).toThrow(/plaintext_secret/);
    expect(() =>
      assertNoPlaintextSecrets({ credentialSecretId: "secret:tenant-a-key" }),
    ).not.toThrow();
    const rest = new GenericRestConnectorAdapter({
      tenantId: tenantA,
      credentialSecretId: "secret:rest-key",
    });
    expect(rest.metadata.credentialSecretId).toBe("secret:rest-key");
  });

  it("3. unauthorized external record excluded (permissionsApplied false)", async () => {
    const denied = createExternalRecordFixture({
      connectorId: "x",
      provider: "NativeMock",
      sourceSystem: "NativeMock",
      externalId: "DENY-1",
      externalType: "document",
      title: "Secret",
      operation: "test",
      permissionsApplied: false,
    });
    const adapter = new NativeMockConnectorAdapter(tenantA, [denied]);
    const registry = new EngineeringConnectorRegistry();
    registry.register(adapter);
    const contrib = await retrieveConnectorEvidence({
      query: { tenantId: tenantA, userId: "u1", query: "Secret" },
      registry,
    });
    expect(contrib.evidence).toHaveLength(0);
  });

  it("4. cross-tenant external ID collision does not leak", () => {
    const registry = new EngineeringConnectorRegistry();
    registry.register(new NativeMockConnectorAdapter(tenantA));
    registry.register(new NativeMockConnectorAdapter(tenantB));
    const a = registry.selectForQuery({ tenantId: tenantA });
    expect(a.every((x) => x.metadata.tenantId === tenantA)).toBe(true);
  });

  it("5. stale connector data surfaced via freshness", async () => {
    const sap = new SapEamConnectorAdapter(tenantA);
    const hit = await sap.fetch!({ tenantId: tenantA, externalId: "48192" });
    expect(hit?.freshness?.lastSyncAt).toBeTruthy();
  });

  it("6. connector outage degrades — native still works", async () => {
    const sapDown = new SapEamConnectorAdapter(tenantA, { unavailable: true });
    const registry = new EngineeringConnectorRegistry();
    registry.register(sapDown);
    const retrieval = new EngineeringRetrievalService(
      {
        search: async () => ({
          projects: [],
          documents: [{ id: "d1", tenant_id: tenantA, title: "Native notification procedure", status: "approved" }],
          assets: [],
          decisions: [],
          actions: [],
          risks: [],
          issues: [],
          technical_queries: [],
          lessons: [],
        }),
      },
      { available: false },
      { enabled: true, registry },
    );
    const { search } = await retrieval.retrieveAndAnswer({} as never, {
      tenantId: tenantA,
      userId: "u1",
      query: "notification procedure",
    });
    expect(search.evidence.some((e) => e.provenance === "engineering_os_native")).toBe(true);
    expect(search.evidence.some((e) => e.provenance === "connector_external")).toBe(false);
    expect(registry.selectForQuery({ tenantId: tenantA })).toHaveLength(0);
  });

  it("7. auth failure health state", async () => {
    const mock = new NativeMockConnectorAdapter(tenantA, undefined, {
      health: { state: "AUTH_ERROR", checkedAt: new Date().toISOString(), message: "auth" },
      status: "ERROR",
    });
    const registry = new EngineeringConnectorRegistry();
    registry.register(mock);
    expect(registry.selectForQuery({ tenantId: tenantA })).toHaveLength(0);
    const health = await registry.testConnection(mock.metadata.connectorId, tenantA);
    expect(health.state).toBe("AUTH_ERROR");
  });

  it("8. rate limited connectors are not selected", () => {
    const mock = new NativeMockConnectorAdapter(tenantA, undefined, {
      health: { state: "RATE_LIMITED", checkedAt: new Date().toISOString() },
      status: "DEGRADED",
    });
    const registry = new EngineeringConnectorRegistry();
    registry.register(mock);
    expect(registry.selectForQuery({ tenantId: tenantA })).toHaveLength(0);
  });

  it("9. malformed external payload sanitised", () => {
    const { text, sanitised } = sanitiseExternalText(
      '<script>alert(1)</script>Safe title javascript:alert(2)',
    );
    expect(sanitised).toBe(true);
    expect(text).not.toMatch(/<script/i);
    expect(text).not.toMatch(/javascript:/i);
  });

  it("10. conflicting external identity stays explicit", () => {
    const record = createExternalRecordFixture({
      connectorId: "c",
      provider: "SAP",
      sourceSystem: "SAP",
      externalId: "48192",
      externalType: "notification",
      title: "N",
      operation: "t",
    });
    const handoffs = handoffConnectorRecordsToE3({
      tenantId: tenantA,
      records: [record],
      existingMappings: [
        createConfirmedConnectorMapping({
          tenantId: tenantA,
          sourceSystem: "SAP",
          externalId: "48192",
          externalType: "notification",
          canonicalObjectType: "ISSUE",
          canonicalObjectId: "iss-1",
          verifiedBy: "steward",
        }),
        createConfirmedConnectorMapping({
          tenantId: tenantA,
          sourceSystem: "SAP",
          externalId: "48192",
          externalType: "notification",
          canonicalObjectType: "ASSET",
          canonicalObjectId: "asset-9",
          verifiedBy: "steward",
        }),
      ],
    });
    expect(handoffs[0].mappingStatus).toBe("CONFLICTING");
    expect(handoffs[0].asExternalEvidenceOnly).toBe(true);
  });

  it("11. duplicate external ID deduped by sourceSystem+externalId", async () => {
    const dup = createExternalRecordFixture({
      connectorId: "c",
      provider: "NativeMock",
      sourceSystem: "NativeMock",
      externalId: "MOCK-NOTIF-1",
      externalType: "notification",
      title: "Dup",
      operation: "t",
    });
    const adapter = new NativeMockConnectorAdapter(tenantA, [dup, { ...dup, title: "Dup2" }]);
    const result = await adapter.search({ tenantId: tenantA, query: "*" });
    expect(result.records.filter((r) => r.externalId === "MOCK-NOTIF-1")).toHaveLength(1);
  });

  it("12. revoked/deleted source record excluded", async () => {
    const revoked = createExternalRecordFixture({
      connectorId: "c",
      provider: "NativeMock",
      sourceSystem: "NativeMock",
      externalId: "GONE",
      externalType: "document",
      title: "Gone",
      operation: "t",
      revoked: true,
    });
    const adapter = new NativeMockConnectorAdapter(tenantA, [revoked]);
    const result = await adapter.search({ tenantId: tenantA, query: "Gone" });
    expect(result.records).toHaveLength(0);
  });

  it("13. source permission unknown excluded from grounded evidence", async () => {
    const unknown = createExternalRecordFixture({
      connectorId: "c",
      provider: "NativeMock",
      sourceSystem: "NativeMock",
      externalId: "UNK-PERM",
      externalType: "document",
      title: "Unknown perm",
      operation: "t",
      permissionsApplied: "unknown",
    });
    const adapter = new NativeMockConnectorAdapter(tenantA, [unknown]);
    const registry = new EngineeringConnectorRegistry();
    registry.register(adapter);
    const contrib = await retrieveConnectorEvidence({
      query: { tenantId: tenantA, userId: "u1", query: "Unknown" },
      registry,
    });
    expect(contrib.evidence).toHaveLength(0);
    expect(contrib.limitations.some((l) => /unknown source permissions/i.test(l))).toBe(true);
  });

  it("14. connector disabled not queried", () => {
    const mock = new NativeMockConnectorAdapter(tenantA, undefined, { status: "DISABLED" });
    const registry = new EngineeringConnectorRegistry();
    registry.register(mock);
    expect(registry.selectForQuery({ tenantId: tenantA })).toHaveLength(0);
  });

  it("15. malicious external metadata/content sanitised on fixture create", () => {
    const r = createExternalRecordFixture({
      connectorId: "c",
      provider: "NativeMock",
      sourceSystem: "NativeMock",
      externalId: "XSS",
      externalType: "document",
      title: "X",
      operation: "t",
      content: '<img src=x onerror="alert(1)">hello',
      metadata: { note: "<script>x</script>" },
    });
    expect(r.sanitised).toBe(true);
    expect(r.content).not.toMatch(/onerror/i);
  });

  it("16. generic REST SSRF / URL safety", () => {
    expect(assertSafeExternalUrl("http://127.0.0.1/admin").ok).toBe(false);
    expect(assertSafeExternalUrl("http://169.254.169.254/latest").ok).toBe(false);
    expect(assertSafeExternalUrl("https://api.example.com/v1").ok).toBe(true);
    expect(() =>
      new GenericRestConnectorAdapter({ tenantId: tenantA, baseUrl: "http://localhost:8080" }),
    ).toThrow(/unsafe_rest_url/);
  });

  it("E3 handoff: unresolved mapping does not silently create canonical object", () => {
    const record = createExternalRecordFixture({
      connectorId: "c",
      provider: "SAP",
      sourceSystem: "SAP",
      externalId: "999",
      externalType: "notification",
      title: "N",
      operation: "t",
    });
    const [h] = handoffConnectorRecordsToE3({
      tenantId: tenantA,
      records: [record],
      existingMappings: [],
    });
    expect(h.mappingStatus).toBe("UNRESOLVED");
    expect(h.asExternalEvidenceOnly).toBe(true);
    expect(h.mapping?.canonicalObjectId).toBe("");
  });

  it("E2+E4 retrieval merges connector evidence when enabled", async () => {
    const registry = new EngineeringConnectorRegistry();
    registry.register(new SapEamConnectorAdapter(tenantA));
    const mapping = createConfirmedConnectorMapping({
      tenantId: tenantA,
      sourceSystem: "SAP",
      externalId: "48192",
      externalType: "notification",
      canonicalObjectType: "ISSUE",
      canonicalObjectId: "iss-native-1",
      verifiedBy: "steward",
    });
    const retrieval = new EngineeringRetrievalService(
      {
        search: async () => ({
          projects: [],
          documents: [],
          assets: [],
          decisions: [
            {
              id: "dec-103",
              tenant_id: tenantA,
              title: "Engineering Decision DEC-103 SAP review",
              status: "approved",
              recommendation: "Review SAP Notification 48192 alongside DEC-103",
            },
          ],
          actions: [],
          risks: [],
          issues: [],
          technical_queries: [],
          lessons: [],
        }),
      },
      { available: false },
      { enabled: true, registry, existingMappings: [mapping] },
    );
    const { search } = await retrieval.retrieveAndAnswer({} as never, {
      tenantId: tenantA,
      userId: "u1",
      query: "SAP Notification 48192",
    });
    expect(search.evidence.some((e) => e.provenance === "engineering_os_native")).toBe(true);
    expect(search.evidence.some((e) => e.provenance === "connector_external")).toBe(true);
    expect(search.evidence.some((e) => e.title.includes("48192"))).toBe(true);
  });

  it("admin view hides provider internals complexity", () => {
    const registry = new EngineeringConnectorRegistry();
    registry.register(new Microsoft365ConnectorAdapter(tenantA));
    const views = registry.listAdminViews(tenantA);
    expect(views[0].status).toMatch(/Connected|Needs attention|Disconnected|Disabled/);
    expect(views[0]).not.toHaveProperty("rawSdk");
  });
});
