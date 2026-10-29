import { describe, expect, it } from "vitest";
import {
  CANONICAL_CONNECTOR_CERTIFICATION_MATRIX,
  CONNECTION_OWNERSHIP,
  CONNECTOR_CORE_RECON,
  CONNECTOR_RECONCILIATION,
  DEFAULT_CONNECTOR_WRITE_POLICY,
  MALWARE_FLOW_CLASSIFICATION,
} from "./types";
import {
  assertNoSecretMaterialOnRecord,
  classifyConnectorFailure,
  connectorBackoff,
  observabilitySafe,
  rejectArbitraryUrlFetch,
  rejectCallerConnectorCoreClaims,
} from "./security";
import { canonicalExternalIdentity, canonicalProjectBinding, operationIdempotencyKey } from "./identity";
import { finalizeBatch, poisonIsBounded, recordPoisonObject, shouldIgnoreOutOfOrder } from "./sync";
import { assertConnectorCapability, certificationIsNotHealth, connectorCapabilityState } from "./capability";

describe("EOS-A13C connector core", () => {
  it("does not create ConnectorV2 and keeps JobService/Event Bus reuse", () => {
    expect(CONNECTOR_CORE_RECON.newFramework).toBe(false);
    expect(CONNECTOR_CORE_RECON.newJobSystem).toBe(false);
    expect(CONNECTOR_CORE_RECON.newEventBus).toBe(false);
    expect(CONNECTOR_CORE_RECON.jobService).toBe("REUSE");
    expect(CONNECTION_OWNERSHIP.overlap).toContain("Distinct records");
    expect(CONNECTOR_RECONCILIATION.some((row) => row.capability === "JobService" && row.action === "REUSE")).toBe(true);
    expect(DEFAULT_CONNECTOR_WRITE_POLICY).toBe("READ_ONLY");
  });

  it("keeps honest capability-specific certification", () => {
    expect(connectorCapabilityState("SHAREPOINT", "PUBLISH_DOCUMENT")).toBe("FIXTURE_CERTIFIED");
    expect(connectorCapabilityState("ACONEX", "PUBLISH_DOCUMENT")).toBe("CONTRACT_ONLY");
    expect(connectorCapabilityState("P6", "READ_SCHEDULE")).toBe("FIXTURE_CERTIFIED");
    expect(CANONICAL_CONNECTOR_CERTIFICATION_MATRIX.every((row) => row.liveRead === "NOT_TESTED" && row.liveWrite === "NOT_TESTED")).toBe(true);
  });

  it("separates certification from operational health", () => {
    const liveButAuth = certificationIsNotHealth({ certification: "LIVE_CERTIFIED_READ", operational: "AUTHENTICATION_REQUIRED" });
    expect(liveButAuth.liveCertifiedButAuthRequired).toBe(true);
    expect(liveButAuth.conflated).toBe(false);
    const readyFixture = certificationIsNotHealth({ certification: "FIXTURE_CERTIFIED", operational: "READY" });
    expect(readyFixture.readyButFixtureOnly).toBe(true);
  });

  it("fail-closes read-only writes and uncertified capabilities", () => {
    expect(() => assertConnectorCapability({ vendor: "SHAREPOINT", capability: "PUBLISH_DOCUMENT", writePolicy: "READ_ONLY" })).toThrow("ARBITRARY_EXTERNAL_WRITE_PROHIBITED");
    expect(() => assertConnectorCapability({ vendor: "ACONEX", capability: "PUBLISH_DOCUMENT", writePolicy: "PUBLISH_DOCUMENT" })).toThrow("CAPABILITY_NOT_CERTIFIED");
    expect(() => assertConnectorCapability({ vendor: "P6", capability: "UPDATE_RFI_RESPONSE" })).toThrow("CAPABILITY_NOT_CERTIFIED");
  });

  it("unifies retry, secrets, observability, and identity", () => {
    expect(connectorBackoff(0)).toBe(400);
    expect(connectorBackoff(2, 12_000)).toBe(12_000);
    expect(classifyConnectorFailure("AUTH")).toBe("AUTHENTICATION_REQUIRED");
    expect(classifyConnectorFailure("THROTTLE")).toBe("RATE_LIMITED");
    expect(rejectCallerConnectorCoreClaims({ accessToken: "x" })).toBe("caller_supplied_authority_rejected");
    expect(rejectArbitraryUrlFetch("https://evil.example")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(() => assertNoSecretMaterialOnRecord({ accessToken: "tok" })).toThrow("connector_secret_forbidden_on_record");
    const safe = observabilitySafe({ accessToken: "tok", contentBase64: "UEs=", itemsChanged: 2 });
    expect(safe.accessToken).toBeUndefined();
    expect(safe.contentBase64).toBeUndefined();
    expect(safe.itemsChanged).toBe(2);
    expect(canonicalExternalIdentity({
      connectionId: "c1",
      externalAccountId: "acct",
      externalProjectId: "proj",
      objectType: "RFI",
      objectId: "142",
    })).toBe("c1:acct:proj:RFI:142");
    expect(operationIdempotencyKey({
      connectionId: "c1",
      objectType: "RFI",
      objectId: "142",
      fingerprint: "fp",
      operation: "sync",
    })).toBe("c1:RFI:142:fp:sync");
    expect(canonicalProjectBinding({
      tenantId: "t",
      workspaceId: "w",
      eosProjectId: "p",
      connectionId: "c",
      externalProjectId: "ext",
    }).eosProjectId).toBe("p");
  });

  it("protects out-of-order, partial batches, poison objects, and 100-object replay", () => {
    expect(shouldIgnoreOutOfOrder("2026-01-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z")).toBe(true);
    expect(shouldIgnoreOutOfOrder("2026-03-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z")).toBe(false);
    const poison = recordPoisonObject([], "bad-1", "malformed");
    recordPoisonObject(poison, "bad-1", "malformed");
    expect(poisonIsBounded(poison[0])).toBe(false);
    recordPoisonObject(poison, "bad-1", "malformed");
    expect(poisonIsBounded(poison[0])).toBe(true);
    const blocking = finalizeBatch({ processed: 100, changed: 99, poison: [{ objectId: "bad-1", reason: "malformed", retries: 1 }] });
    expect(blocking.checkpointAllowed).toBe(false);
    expect(blocking.status).toBe("DEGRADED");
    const bounded = finalizeBatch({ processed: 100, changed: 99, poison: [{ objectId: "bad-1", reason: "malformed", retries: 3 }] });
    expect(bounded.checkpointAllowed).toBe(true);
    const keys = new Set(
      Array.from({ length: 100 }, (_, index) => operationIdempotencyKey({
        connectionId: "c1",
        objectType: "DOCUMENT",
        objectId: `doc-${index}`,
        fingerprint: `fp-${index}`,
        operation: "sync",
      })),
    );
    expect(keys.size).toBe(100);
    expect(MALWARE_FLOW_CLASSIFICATION.METADATA_ONLY).toContain("bytes are not ingested");
  });
});
