import { describe, expect, it } from "vitest";
import {
  EOS3_PRODUCT_KEY,
  EOS3_RELEASE_STATUS,
  EOS3_VERSION,
  resolveProjectGeneration,
} from "../lib/commerce/eos3-identity";
import {
  eos2EntitlementAutoEnablesEos3,
  eos2EnrollmentAutoEnablesEos3,
  evaluateEos3Access,
} from "../lib/commerce/eos3-entitlement";
import { assertEvidenceClassification, buildEos3Provenance } from "../lib/commerce/eos3-provenance";
import { createEos3EventEnvelope, eventBypassesAuthorization } from "../lib/commerce/eos3-events";
import {
  coexistenceContract,
  createMigrationManifestScaffold,
  defaultLifecycleProfileScaffold,
  embeddingsAreAuthoritativeSystemOfRecord,
  emptyJurisdictionProfile,
  eos2AutoMigrationToEos3,
  eos3WorkflowFoundationCompatibleWithEos2,
  eos3AiMayApproveEngineering,
  eos3AiMayAuthorizeProductionReleases,
  eos3AiMayCertifyCompliance,
  eos3AiMayFinalizeMateriality,
  eos3AiMayReleaseIfc,
  retrievalAuthorityRank,
} from "../lib/commerce/eos3-foundation";
import { eos2ApiContext, eos3ApiContext, resolveApiContext } from "../lib/commerce/eos3-api-context";

const grant = {
  productKey: EOS3_PRODUCT_KEY,
  tenantId: "t1",
  workspaceId: "w1",
  status: "active" as const,
  grantSource: "INTERNAL_DEVELOPMENT",
  validFrom: "2020-01-01T00:00:00.000Z",
  validUntil: null,
};

const open = {
  authenticated: true,
  requestedProductKey: EOS3_PRODUCT_KEY,
  tenantId: "t1",
  workspaceId: "w1",
  record: grant,
  enrollmentState: "DEVELOPMENT" as const,
  productionEnvironment: false,
};

describe("EOS 3.1 foundation compatibility matrix", () => {
  it("identifies EOS 3 development version and denies Production by default", () => {
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(evaluateEos3Access({ ...open, productionEnvironment: true }).reason).toBe(
      "production_denied",
    );
  });

  it("preserves legacy project default as EOS 2 compatible", () => {
    expect(resolveProjectGeneration(null)).toBe("eos2_compatible");
    expect(resolveProjectGeneration({})).toBe("eos2_compatible");
    expect(resolveProjectGeneration({ eos_generation: 3 })).toBe("eos3_development");
    expect(coexistenceContract(null).eos2RuntimeCompatible).toBe(true);
  });

  it("never auto-enables EOS 3 from EOS 2 entitlement or enrollment", () => {
    expect(eos2EntitlementAutoEnablesEos3("eos-2")).toBe(false);
    expect(eos2EnrollmentAutoEnablesEos3(true)).toBe(false);
    expect(eos2AutoMigrationToEos3()).toBe(false);
  });

  it("requires eos-3 product grant + development enrollment", () => {
    expect(evaluateEos3Access(open).allowed).toBe(true);
    expect(evaluateEos3Access({ ...open, enrollmentState: "NOT_ELIGIBLE" }).reason).toBe(
      "not_enrolled",
    );
    expect(
      evaluateEos3Access({ ...open, requestedProductKey: "eos-2", record: { ...grant, productKey: "eos-2" } })
        .reason,
    ).toBe("wrong_product");
    expect(evaluateEos3Access({ ...open, workspaceId: "other" }).reason).toBe("wrong_workspace");
    expect(
      evaluateEos3Access({ ...open, record: { ...grant, status: "revoked" } }).reason,
    ).toBe("revoked");
    expect(
      evaluateEos3Access({ ...open, record: { ...grant, status: "suspended" } }).reason,
    ).toBe("suspended");
    expect(evaluateEos3Access({ ...open, authenticated: false }).reason).toBe("unauthenticated");
    expect(evaluateEos3Access({ ...open, record: null }).reason).toBe("missing");
  });

  it("keeps EOS 2 and EOS 3 API contexts distinct and defaults unspecified to EOS 2", () => {
    expect(resolveApiContext(null, "t", "w").productKey).toBe("eos-2");
    expect(eos2ApiContext("t", "w").releaseStatus).toBe("GENERAL_AVAILABILITY");
    expect(eos3ApiContext("t", "w").releaseStatus).toBe("DEVELOPMENT");
    expect(resolveApiContext({ generation: 3 }, "t", "w").productKey).toBe("eos-3");
  });

  it("builds provenance and rejects AI FACT storage", () => {
    const p = buildEos3Provenance({
      tenantId: "t",
      workspaceId: "w",
      projectId: null,
      objectId: null,
      revisionId: null,
      source: "unit",
      actorId: null,
      authority: null,
      method: "test",
      toolOrModel: null,
      evidenceClassification: "INFERENCE",
      qualificationState: null,
    });
    expect(p.generation).toBe(3);
    expect(() => assertEvidenceClassification("FACT", { aiGenerated: true })).toThrow(
      /ai_cannot_store_authoritative_fact/,
    );
    expect(assertEvidenceClassification("RECOMMENDATION", { aiGenerated: true })).toBe(
      "RECOMMENDATION",
    );
  });

  it("creates event envelopes that cannot bypass authorization", () => {
    const e = createEos3EventEnvelope({
      eventType: "eos3.foundation.ping",
      tenantId: "t",
      workspaceId: "w",
      projectId: null,
      objectId: null,
      revisionId: null,
      actorId: null,
      authority: "admin",
      correlationId: null,
      causationId: null,
      provenanceRef: null,
      auditLink: null,
    });
    expect(e.generation).toBe(3);
    expect(eventBypassesAuthorization(e)).toBe(false);
  });

  it("scaffolds lifecycle, jurisdiction, retrieval, migration, and AI authority boundaries", () => {
    expect(defaultLifecycleProfileScaffold().stages.length).toBeGreaterThan(0);
    expect(emptyJurisdictionProfile().regionKey).toBeNull();
    expect(retrievalAuthorityRank("canonical_structured_engineering_state")).toBe(0);
    expect(retrievalAuthorityRank("model_inference")).toBe(4);
    expect(embeddingsAreAuthoritativeSystemOfRecord()).toBe(false);
    expect(createMigrationManifestScaffold().executed).toBe(false);
    expect(eos3WorkflowFoundationCompatibleWithEos2()).toBe(true);
    expect(eos3AiMayApproveEngineering()).toBe(false);
    expect(eos3AiMayFinalizeMateriality()).toBe(false);
    expect(eos3AiMayReleaseIfc()).toBe(false);
    expect(eos3AiMayCertifyCompliance()).toBe(false);
    expect(eos3AiMayAuthorizeProductionReleases()).toBe(false);
  });
});
