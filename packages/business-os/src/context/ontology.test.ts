import { describe, expect, it } from "vitest";
import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  BUSINESS_CONTEXT_NODE_TYPES,
  BUSINESS_CONTEXT_RELATIONSHIP_TYPES,
} from "@rtb/types";
import { ONTOLOGY, kernelNodeType, parseKernelNodeType } from "./ontology";
import { buildIdentity, canonicalRef, parseCanonicalRef, assertSameTenant } from "./identity";
import { RELATIONSHIP_ENDPOINTS, assertRelationshipType } from "./taxonomy";

describe("BOS-10 ontology", () => {
  it("uses versioned business_context_graph.v1 node types", () => {
    expect(ONTOLOGY.version).toBe(BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION);
    expect(ONTOLOGY.version).toBe("business_context_graph.v1");
    expect(BUSINESS_CONTEXT_NODE_TYPES).toEqual(expect.arrayContaining([
      "customer",
      "work",
      "decision",
      "risk",
      "profit_fact",
      "engineering_project_reference",
    ]));
    expect(kernelNodeType("customer")).toBe("bos.customer");
    expect(parseKernelNodeType("bos.work")).toBe("work");
    expect(parseKernelNodeType("decision")).toBeNull();
  });
});

describe("BOS-10 node identity", () => {
  const scope = {
    tenantId: "11111111-1111-4111-8111-111111111111",
    workspaceId: "22222222-2222-4222-8222-222222222222",
  };

  it("builds stable tenant-scoped canonical refs", () => {
    const identity = buildIdentity({
      ...scope,
      domain: "customer",
      entityType: "customer",
      entityId: "abc",
      displayName: "Customer ABC",
      sourceType: "demo",
      effectiveAt: "2026-08-19T12:00:00.000Z",
    });
    expect(identity.canonicalRef).toBe(
      canonicalRef({ ...scope, entityType: "customer", entityId: "abc" }),
    );
    expect(identity.canonicalRef).toContain(scope.tenantId);
    expect(identity.ontologyVersion).toBe("business_context_graph.v1");
    expect(parseCanonicalRef(identity.canonicalRef)?.entityId).toBe("abc");
  });

  it("forbids leaking one tenant identity into another", () => {
    expect(() => assertSameTenant(scope.tenantId, "33333333-3333-4333-8333-333333333333")).toThrow(
      "cross_tenant_graph_forbidden",
    );
  });
});

describe("BOS-10 relationship taxonomy", () => {
  it("has explicit BOS relationship types and rejects RELATED_TO", () => {
    expect(BUSINESS_CONTEXT_RELATIONSHIP_TYPES).toEqual(
      expect.arrayContaining([
        "CUSTOMER_HAS_OPPORTUNITY",
        "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE",
        "RISK_AFFECTS_CUSTOMER",
        "DECISION_CREATES_ACTION",
      ]),
    );
    expect(BUSINESS_CONTEXT_RELATIONSHIP_TYPES).not.toContain("RELATED_TO");
    expect(() => assertRelationshipType("RELATED_TO")).toThrow();
    expect(RELATIONSHIP_ENDPOINTS.WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE.to).toBe(
      "engineering_project_reference",
    );
  });
});
