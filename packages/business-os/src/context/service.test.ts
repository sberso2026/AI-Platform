import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BusinessContextGraphService } from "./service";
import { createMemoryGraphPort } from "./graph-port";
import { demoContextRecords, BOS_10_DEMO_CUSTOMER_ID, BOS_10_DEMO_WORK_ID, BOS_10_DEMO_DECISION_ID } from "./demo";
import { assembleStructuredContext, GRAPH_CAUSATION_DISCLAIMER } from "./assembly";
import { diagnoseSnapshot } from "./diagnostics";
import { BUSINESS_CONTEXT_GRAPH_CONTRACT } from "./extensions";
import { getBusinessOsFoundationDeclaration } from "../version";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};

function serviceWithMemory() {
  const graph = createMemoryGraphPort();
  const kernel = createPlatformKernel({} as SupabaseClient);
  const audit = new AuditService({} as SupabaseClient);
  const service = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
  return { service, graph };
}

describe("BOS-10 context graph service guards", () => {
  it("reuses Kernel graph contracts and forbids second stacks and causation", () => {
    const { service } = serviceWithMemory();
    expect(service.contract()).toEqual(BUSINESS_CONTEXT_GRAPH_CONTRACT);
    expect(service.contract().implementsOwnAiStack).toBe(false);
    expect(service.status().available).toBe(true);
    expect(service.aiWorkforce().available).toBe(true);
    expect(getBusinessOsFoundationDeclaration().duplicateKnowledgeGraphDetected).toBe(false);
    expect(() => service.executeRawGraphQuery()).toThrow("unrestricted_graph_query_forbidden");
    expect(() => service.writeExternalGraph()).toThrow("external_graph_write_forbidden");
    expect(() => service.inferRelationshipByName()).toThrow("inferred_relationship_forbidden");
    expect(() => service.treatAdjacencyAsCausation()).toThrow("graph_adjacency_is_not_causation");
    expect(() => service.calculateProfit()).toThrow("profit_calculation_forbidden_in_graph");
    expect(() => service.assessRisk()).toThrow("risk_assessment_forbidden_in_graph");
    expect(() => service.scoreCustomerHealth()).toThrow("customer_health_forbidden_in_graph");
    expect(() => service.projectEngineeringDomain()).toThrow("engineering_os_internal_projection_forbidden");
    expect(() => service.autonomousDecisionFromGraph()).toThrow("autonomous_graph_decision_forbidden");
    expect(() => service.mutateSourceDomain()).toThrow("source_domain_mutation_forbidden");
  });
});

describe("BOS-10 projection", () => {
  it("is idempotent, rebuildable, and preserves relationship evidence", async () => {
    const { service, graph } = serviceWithMemory();
    const records = demoContextRecords(SCOPE);
    const first = await service.applyRecords(SCOPE, records);
    const second = await service.applyRecords(SCOPE, records);
    expect(first.nodesProjected).toBe(second.nodesProjected);
    expect(graph.snapshot.nodes.length).toBe(first.nodesProjected);
    const edge = graph.snapshot.edges.find((row) => row.edge_type === "CUSTOMER_HAS_WORK");
    expect(edge?.metadata.sourceDomain).toBe("customer");
    expect(edge?.metadata.sourceEntityRef).toBeTruthy();
    expect(edge?.metadata.relationshipVersion).toBe("business_context_graph.v1");
    expect(first.unresolved.some((row) => row.reason === "unresolved_link")).toBe(true);
  });

  it("removes deleted and suppressed personal contact exposure", async () => {
    const { service } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const ctx = await service.customerContext(SCOPE, BOS_10_DEMO_CUSTOMER_ID);
    expect(ctx.entity?.displayName).toBe("Customer ABC");
    expect(ctx.neighbours.some((row) => row.node.entityId === "bos10-contact-deleted")).toBe(false);
    expect(ctx.neighbours.some((row) => row.node.displayName === "Hidden Person")).toBe(false);
    expect(ctx.neighbours.some((row) => row.node.displayName === "Contact (suppressed)")).toBe(false);
  });

  it("contains suppressed contacts across search, entity, relationships, AI, explain, and agent context", async () => {
    const { service, graph } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const snapshot = await graph.loadSnapshot(SCOPE.tenantId, SCOPE.workspaceId);
    expect(JSON.stringify(snapshot)).not.toContain("Hidden Person");

    const searchHidden = await service.search(SCOPE, "Hidden Person");
    const searchSuppressed = await service.search(SCOPE, "Contact (suppressed)");
    expect(searchHidden).toEqual([]);
    expect(searchSuppressed).toEqual([]);

    const entity = await service.entityContext(SCOPE, { entityType: "contact", entityId: "bos10-contact-suppressed" });
    expect(entity.entity).toBeNull();
    expect(JSON.stringify(entity)).not.toContain("Hidden Person");

    const relationships = await service.relationships(SCOPE, {
      entityType: "customer",
      entityId: BOS_10_DEMO_CUSTOMER_ID,
    });
    expect(JSON.stringify(relationships)).not.toContain("Hidden Person");

    const customer = await service.customerContext(SCOPE, BOS_10_DEMO_CUSTOMER_ID);
    const assembled = assembleStructuredContext(customer);
    expect(JSON.stringify(assembled)).not.toContain("Hidden Person");

    const explained = await service.explain(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID });
    expect(JSON.stringify(explained.structured)).not.toContain("Hidden Person");

    const agentOk = await service.agentContext(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID });
    expect(agentOk.adjacencyIsNotCausation).toBe(true);
    expect(JSON.stringify(agentOk)).not.toContain("Hidden Person");

    const agentHidden = await service.agentContext(SCOPE, {
      entityType: "contact",
      entityId: "bos10-contact-suppressed",
    });
    expect(agentHidden.state).toBe("insufficient_evidence");
    expect(agentHidden.assembly).toBeNull();
    expect(JSON.stringify(agentHidden)).not.toContain("Hidden Person");
  });

  it("rejects cross-tenant relationship projection", async () => {
    const { service } = serviceWithMemory();
    const records = demoContextRecords(SCOPE);
    records[0].links[0].toTenantId = "99999999-9999-4999-8999-999999999999";
    await expect(service.applyRecords(SCOPE, records)).rejects.toThrow("cross_tenant_graph_forbidden");
  });
});

describe("BOS-10 bounded context", () => {
  it("returns customer, work, and decision neighbourhoods without the whole graph", async () => {
    const { service, graph } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const customer = await service.customerContext(SCOPE, BOS_10_DEMO_CUSTOMER_ID);
    const work = await service.workContext(SCOPE, BOS_10_DEMO_WORK_ID);
    const decision = await service.decisionContext(SCOPE, BOS_10_DEMO_DECISION_ID);
    expect(customer.neighbours.some((row) => row.node.entityType === "opportunity")).toBe(true);
    expect(customer.neighbours.some((row) => row.node.entityType === "work")).toBe(true);
    expect(customer.neighbours.some((row) => row.node.entityType === "risk")).toBe(true);
    expect(work.neighbours.some((row) => row.relationshipType === "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE")).toBe(
      true,
    );
    expect(work.neighbours.some((row) => row.node.entityType === "customer")).toBe(true);
    expect(decision.neighbours.some((row) => row.node.entityType === "action")).toBe(true);
    expect(decision.neighbours.some((row) => row.node.entityType === "evidence")).toBe(true);
    expect(customer.adjacencyIsNotCausation).toBe(true);
    expect(customer.neighbours.length).toBeLessThan(graph.snapshot.nodes.length);
    await expect(service.neighbourhood(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID, depth: 9 })).rejects.toThrow(
      "graph_depth_exceeded",
    );
  });

  it("does not treat adjacency as causation in AI assembly", async () => {
    const { service } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const ctx = await service.customerContext(SCOPE, BOS_10_DEMO_CUSTOMER_ID);
    const assembled = assembleStructuredContext(ctx);
    expect(assembled.adjacencyIsNotCausation).toBe(true);
    expect(assembled.narrativeSeparate).toBe(true);
    expect(GRAPH_CAUSATION_DISCLAIMER.toLowerCase()).toContain("not causation");
    const explained = await service.explain(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID });
    expect(explained.structured.adjacencyIsNotCausation).toBe(true);
    expect(explained.disclaimer).toBe(GRAPH_CAUSATION_DISCLAIMER);
  });
});

describe("BOS-10 diagnostics", () => {
  it("identifies stale, unresolved, and orphaned projection problems without silent repair", async () => {
    const { service, graph } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const snapshot = await graph.loadSnapshot(SCOPE.tenantId, SCOPE.workspaceId);
    const diagnosed = diagnoseSnapshot({
      snapshot,
      expectedSourceCount: snapshot.nodes.length,
      unresolvedCount: 1,
      staleAfterHours: 24,
      now: new Date("2026-08-19T12:00:00.000Z"),
    });
    expect(diagnosed.findings.every((row) => row.repaired === false)).toBe(true);
    expect(diagnosed.findings.some((row) => row.code === "stale_projection" || row.code === "unresolved_link")).toBe(
      true,
    );
    expect(diagnosed.quality.unresolvedRefs).toBeGreaterThan(0);
  });
});

describe("BOS-10 tenant isolation", () => {
  it("does not return another tenant's nodes from a workspace snapshot", async () => {
    const { service, graph } = serviceWithMemory();
    await service.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const other = {
      tenantId: "44444444-4444-4444-8444-444444444444",
      workspaceId: "55555555-5555-4555-8555-555555555555",
      userId: SCOPE.userId,
    };
    await service.applyRecords(other, demoContextRecords(other));
    const snapshot = await graph.loadSnapshot(SCOPE.tenantId, SCOPE.workspaceId);
    expect(snapshot.nodes.every((n) => n.tenant_id === SCOPE.tenantId)).toBe(true);
    const otherSnapshot = await graph.loadSnapshot(other.tenantId, other.workspaceId);
    expect(otherSnapshot.nodes.every((n) => n.tenant_id === other.tenantId)).toBe(true);
  });
});
