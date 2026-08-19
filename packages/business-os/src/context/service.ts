import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessContextCanonicalRecord,
  BusinessContextNodeType,
  BusinessContextRelationshipType,
  BusinessWorkforceAgentContext,
} from "@rtb/types";
import {
  BUSINESS_CONTEXT_DEFAULT_DEPTH,
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  BUSINESS_CONTEXT_MAX_DEPTH,
  BUSINESS_CONTEXT_NODE_TYPES,
  BUSINESS_OS_EVENT_TYPES,
} from "@rtb/types";
import type { OwnerCommandScope } from "../owner-command/service";
import { assembleStructuredContext, GRAPH_CAUSATION_DISCLAIMER } from "./assembly";
import { loadCanonicalRecords } from "./catalog";
import { demoContextRecords } from "./demo";
import { diagnoseSnapshot } from "./diagnostics";
import {
  BUSINESS_CONTEXT_GRAPH_CONTRACT,
  aiWorkforceStatus,
  businessContextGraphStatus,
} from "./extensions";
import { kernelGraphPort, type GraphPort } from "./graph-port";
import { assertSameTenant, identityFromContent, isSuppressedContact, suppressedContactLeaks } from "./identity";
import { queryNeighbourhood } from "./neighbourhood";
import { assertOntologyVersion } from "./ontology";
import { projectRecords } from "./projector";
import { BusinessContextRepository } from "./repository";
import {
  CUSTOMER_CONTEXT_ALLOWLIST,
  DECISION_CONTEXT_ALLOWLIST,
  PROFIT_CONTEXT_ALLOWLIST,
  RISK_CONTEXT_ALLOWLIST,
  WORK_CONTEXT_ALLOWLIST,
  assertRelationshipType,
} from "./taxonomy";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function emptyNarrative(reason: string): AiDailyBriefNarrative {
  return {
    text: "",
    generatedAt: new Date().toISOString(),
    generatedBy: "platform_ai_director",
    evidenceRefs: [],
    advisory: true,
    unavailableReason: reason,
  };
}

const SYNC_EVENTS = [
  "business_os.customer.created",
  "business_os.customer.updated",
  "business_os.growth.opportunity_created",
  "business_os.growth.opportunity_won",
  "business_os.revenue.proposal_created",
  "business_os.operations.work_created",
  "business_os.profit.fact_ingested",
  "business_os.risk.created",
  "business_os.decision.selected",
  "business_os.action.created",
] as const;

const EVENT_AFFECTED_NODE_TYPES: Record<string, BusinessContextNodeType[]> = {
  "business_os.customer.created": ["customer", "contact"],
  "business_os.customer.updated": ["customer", "contact"],
  "business_os.growth.opportunity_created": ["opportunity", "organisation", "lead"],
  "business_os.growth.opportunity_won": ["opportunity", "customer"],
  "business_os.revenue.proposal_created": ["proposal", "opportunity"],
  "business_os.operations.work_created": ["work", "customer"],
  "business_os.profit.fact_ingested": ["profit_fact", "customer", "work"],
  "business_os.risk.created": ["risk", "control", "obligation"],
  "business_os.decision.selected": ["decision", "evidence"],
  "business_os.action.created": ["action", "decision"],
};

export function affectedRecordsForEvent(
  records: BusinessContextCanonicalRecord[],
  eventType: string,
  payload?: Record<string, unknown>,
): BusinessContextCanonicalRecord[] {
  const types = EVENT_AFFECTED_NODE_TYPES[eventType];
  if (!types) return records;
  const validTypes = types.filter((type) => (BUSINESS_CONTEXT_NODE_TYPES as readonly string[]).includes(type));
  let affected = records.filter((row) => validTypes.includes(row.identity.entityType));
  const entityId = String(
    payload?.entityId ?? payload?.id ?? payload?.customerId ?? payload?.workId ?? payload?.decisionId ?? "",
  );
  if (entityId) {
    const direct = affected.filter((row) => row.identity.entityId === entityId);
    if (direct.length > 0) {
      const ids = new Set(direct.map((row) => `${row.identity.entityType}:${row.identity.entityId}`));
      for (const rec of direct) {
        for (const link of rec.links) ids.add(`${link.toEntityType}:${link.toEntityId}`);
      }
      affected = records.filter(
        (row) =>
          ids.has(`${row.identity.entityType}:${row.identity.entityId}`) ||
          row.links.some((link) => ids.has(`${link.toEntityType}:${link.toEntityId}`)),
      );
    }
  }
  return affected;
}

export class BusinessContextGraphService {
  readonly repository: BusinessContextRepository;
  private readonly graph: GraphPort;
  private syncRegistered = false;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    graph?: GraphPort,
  ) {
    this.repository = new BusinessContextRepository(supabase);
    this.graph = graph ?? kernelGraphPort(kernel.knowledgeGraph);
  }

  contract() {
    return BUSINESS_CONTEXT_GRAPH_CONTRACT;
  }

  status() {
    return businessContextGraphStatus();
  }

  aiWorkforce() {
    return aiWorkforceStatus();
  }

  ontology() {
    return {
      version: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
      implementsOwnAiStack: false,
      projectionOnly: true,
      adjacencyIsNotCausation: true,
      graphRuntime: "platform_kernel_knowledge_graph",
    };
  }

  executeRawGraphQuery(): never {
    throw new Error("unrestricted_graph_query_forbidden");
  }

  writeExternalGraph(): never {
    throw new Error("external_graph_write_forbidden");
  }

  inferRelationshipByName(): never {
    throw new Error("inferred_relationship_forbidden");
  }

  treatAdjacencyAsCausation(): never {
    throw new Error("graph_adjacency_is_not_causation");
  }

  calculateProfit(): never {
    throw new Error("profit_calculation_forbidden_in_graph");
  }

  assessRisk(): never {
    throw new Error("risk_assessment_forbidden_in_graph");
  }

  scoreCustomerHealth(): never {
    throw new Error("customer_health_forbidden_in_graph");
  }

  projectEngineeringDomain(): never {
    throw new Error("engineering_os_internal_projection_forbidden");
  }

  autonomousDecisionFromGraph(): never {
    throw new Error("autonomous_graph_decision_forbidden");
  }

  mutateSourceDomain(): never {
    throw new Error("source_domain_mutation_forbidden");
  }

  registerSync(): void {
    if (this.syncRegistered) return;
    this.syncRegistered = true;
    for (const eventType of SYNC_EVENTS) {
      this.kernel.eventBus.registerSubscriber({
        eventType,
        handle: async (event) => {
          if (!event.workspace_id) return;
          try {
            await this.projectIncremental(
              { tenantId: event.tenant_id, workspaceId: event.workspace_id, userId: event.tenant_id },
              {
                eventType,
                payload: (event.payload ?? {}) as Record<string, unknown>,
              },
            );
          } catch {
            try {
              await this.kernel.eventBus.publish({
                tenantId: event.tenant_id,
                workspaceId: event.workspace_id,
                eventType: "business_os.context.projection_failed",
                source: "business-os",
                payload: { sourceEvent: event.event_type },
              });
            } catch {
              // fail-open
            }
          }
        },
      });
    }
  }

  async search(raw: { tenantId: string; workspaceId?: string; userId: string }, query: string) {
    const scope = requireWorkspace(raw);
    if (!query.trim()) return [];
    try {
      const nodes = await this.graph.searchNodes(scope.tenantId, scope.workspaceId, query.trim(), 20);
      return nodes
        .map((node) => identityFromContent(node.content ?? {}, node.title))
        .filter((row) => row && row.tenantId === scope.tenantId && !row.deleted)
        .filter((row) => row && !(row.suppressed && row.entityType === "contact"));
    } catch {
      throw new Error("graph_projection_unavailable");
    }
  }

  async entityContext(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { entityType: BusinessContextNodeType; entityId: string; depth?: number },
  ) {
    const scope = requireWorkspace(raw);
    const allowlist =
      input.entityType === "customer"
        ? CUSTOMER_CONTEXT_ALLOWLIST
        : input.entityType === "work"
          ? WORK_CONTEXT_ALLOWLIST
          : input.entityType === "decision"
            ? DECISION_CONTEXT_ALLOWLIST
            : input.entityType === "risk"
              ? RISK_CONTEXT_ALLOWLIST
              : input.entityType === "profit_fact"
                ? PROFIT_CONTEXT_ALLOWLIST
                : undefined;
    return this.neighbourhood(scope, { ...input, allowlist });
  }

  async neighbourhood(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      entityType: string;
      entityId: string;
      depth?: number;
      allowlist?: readonly BusinessContextRelationshipType[];
    },
  ) {
    const scope = requireWorkspace(raw);
    const depth = input.depth ?? BUSINESS_CONTEXT_DEFAULT_DEPTH;
    if (depth > BUSINESS_CONTEXT_MAX_DEPTH) throw new Error("graph_depth_exceeded");
    let snapshot;
    try {
      snapshot = await this.graph.loadSnapshot(scope.tenantId, scope.workspaceId);
    } catch {
      throw new Error("graph_projection_unavailable");
    }
    const result = queryNeighbourhood(snapshot, input, {
      depth,
      allowlist: input.allowlist,
      includeSuppressedContacts: false,
    });
    if (result.entity) assertSameTenant(scope.tenantId, result.entity.tenantId);
    const settings = await this.repository.getSettings(scope);
    const unresolved = await this.repository.listUnresolved(scope);
    const diagnosed = diagnoseSnapshot({
      snapshot,
      expectedSourceCount: snapshot.nodes.length,
      unresolvedCount: unresolved.length,
      staleAfterHours: settings.staleAfterHours,
    });
    return { ...result, dataQuality: diagnosed.quality };
  }

  async relationships(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { entityType: string; entityId: string },
  ) {
    const ctx = await this.neighbourhood(raw, { ...input, depth: 1 });
    return ctx.neighbours.map((row) => ({
      relationshipType: row.relationshipType,
      direction: row.direction,
      neighbour: row.node,
      evidence: row.evidence,
      adjacencyIsNotCausation: true as const,
    }));
  }

  async customerContext(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId: string) {
    return this.entityContext(raw, { entityType: "customer", entityId: customerId });
  }

  async workContext(raw: { tenantId: string; workspaceId?: string; userId: string }, workId: string) {
    return this.entityContext(raw, { entityType: "work", entityId: workId });
  }

  async decisionContext(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string) {
    return this.entityContext(raw, { entityType: "decision", entityId: decisionId });
  }

  async riskContext(raw: { tenantId: string; workspaceId?: string; userId: string }, riskId: string) {
    return this.entityContext(raw, { entityType: "risk", entityId: riskId });
  }

  async profitContext(raw: { tenantId: string; workspaceId?: string; userId: string }, factId: string) {
    return this.entityContext(raw, { entityType: "profit_fact", entityId: factId });
  }

  assembleAiContext(result: Awaited<ReturnType<BusinessContextGraphService["neighbourhood"]>>) {
    return assembleStructuredContext(result);
  }

  /**
   * Bounded structured context for governed agents. Never treats adjacency as causation.
   * Fail-closed on missing evidence, stale context, unresolved refs, schema mismatch,
   * forbidden entities, and cross-tenant/workspace access. Does not repair graph data.
   */
  async agentContext(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { entityType: string; entityId: string; depth?: number; staleAfterHours?: number },
  ): Promise<BusinessWorkforceAgentContext> {
    const scope = requireWorkspace(raw);
    if (!(BUSINESS_CONTEXT_NODE_TYPES as readonly string[]).includes(input.entityType)) {
      return {
        state: "insufficient_evidence",
        reasons: ["forbidden_entity"],
        assembly: null,
        adjacencyIsNotCausation: true,
        provenancePreserved: true,
      };
    }
    const ctx = await this.entityContext(scope, {
      entityType: input.entityType as BusinessContextNodeType,
      entityId: input.entityId,
      depth: input.depth,
    });
    if (ctx.entity) {
      assertSameTenant(scope.tenantId, ctx.entity.tenantId);
      if (ctx.entity.workspaceId !== scope.workspaceId) throw new Error("cross_workspace_graph_forbidden");
    }

    const reasons: string[] = [];
    let state: BusinessWorkforceAgentContext["state"] = "ok";
    const mark = (reason: string, next: BusinessWorkforceAgentContext["state"]) => {
      reasons.push(reason);
      if (state === "insufficient_evidence") return;
      if (next === "insufficient_evidence") state = next;
      else if (state === "ok") state = next;
    };

    if (!ctx.entity) mark("source_entity_missing", "insufficient_evidence");
    if (ctx.entity && isSuppressedContact(ctx.entity)) mark("forbidden_entity", "insufficient_evidence");
    if (ctx.entity && ctx.entity.ontologyVersion !== BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION) {
      throw new Error("schema_version_mismatch");
    }
    if (ctx.unknown.length > 0 || ctx.missingLinks.length > 0) {
      mark("unresolved_references", "insufficient_evidence");
    }

    const settings = await this.repository.getSettings(scope);
    const staleAfterHours = input.staleAfterHours ?? settings.staleAfterHours;
    for (const row of ctx.neighbours) {
      if (!row.evidence?.sourceDomain || !row.evidence.sourceEntityRef || row.evidence.sourceEntityRef === "unknown") {
        mark("missing_evidence", "insufficient_evidence");
      }
      const projected = Date.parse(row.evidence.projectedAt);
      if (Number.isFinite(projected)) {
        const ageHours = (Date.now() - projected) / 3_600_000;
        if (ageHours > staleAfterHours) mark("stale_context", "needs_human_review");
      }
    }

    const assembly = ctx.entity ? assembleStructuredContext(ctx) : null;
    const leakPayload = JSON.stringify(assembly ?? ctx);
    if (
      leakPayload.includes("Hidden Person") ||
      /hidden@example\.com/i.test(leakPayload) ||
      (ctx.entity && suppressedContactLeaks({ ...ctx.entity })) ||
      ctx.neighbours.some((row) => suppressedContactLeaks({ ...row.node }))
    ) {
      return {
        state: "insufficient_evidence",
        reasons: [...reasons, "suppressed_context_leakage"],
        assembly: null,
        adjacencyIsNotCausation: true,
        provenancePreserved: true,
      };
    }

    if (state !== "ok") {
      return {
        state,
        reasons,
        assembly: null,
        adjacencyIsNotCausation: true,
        provenancePreserved: true,
      };
    }

    return {
      state: "ok",
      reasons,
      assembly,
      adjacencyIsNotCausation: true,
      provenancePreserved: true,
    };
  }

  async suggestEvidence(raw: { tenantId: string; workspaceId?: string; userId: string }, decisionId: string) {
    const ctx = await this.decisionContext(raw, decisionId);
    return {
      suggestions: ctx.neighbours.map((row) => ({
        nodeType: row.node.entityType,
        displayName: row.node.displayName,
        relationshipType: row.relationshipType,
        evidence: row.evidence,
        canonicalRef: row.node.canonicalRef,
      })),
      included: false as const,
      adjacencyIsNotCausation: true as const,
      note: "Graph context may suggest evidence; evidence inclusion remains explicit and auditable.",
    };
  }

  async diagnostics(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const snapshot = await this.graph.loadSnapshot(scope.tenantId, scope.workspaceId);
    const settings = await this.repository.getSettings(scope);
    const unresolved = await this.repository.listUnresolved(scope);
    return diagnoseSnapshot({
      snapshot,
      expectedSourceCount: Math.max(snapshot.nodes.length, 1),
      unresolvedCount: unresolved.length,
      staleAfterHours: settings.staleAfterHours,
    });
  }

  async projectionStatus(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const run = await this.repository.latestRun(scope);
    const settings = await this.repository.getSettings(scope);
    const diag = await this.diagnostics(scope);
    return {
      ontologyVersion: settings.ontologyVersion,
      lastRun: run,
      quality: diag.quality,
      findings: diag.findings,
      graphRuntime: "platform_kernel_knowledge_graph",
    };
  }

  async rebuild(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    options?: { trigger?: "rebuild" | "event" | "demo" | "deletion"; records?: BusinessContextCanonicalRecord[]; audit?: boolean },
  ) {
    const scope = requireWorkspace(raw);
    const loaded = options?.records
      ? { records: options.records, missingDomains: [] as string[] }
      : await loadCanonicalRecords(this.supabase, scope);
    const result = await projectRecords(this.graph, loaded.records, scope.userId);
    await this.repository.replaceUnresolved(
      scope,
      result.unresolved.map((row) => ({
        relationshipType: row.relationshipType,
        fromCanonicalRef: row.fromCanonicalRef,
        toRef: row.toEntityId,
        reason: row.reason,
        sourceDomain: "platform",
      })),
    );
    await this.repository.insertRun(scope, {
      status: "completed",
      trigger: options?.trigger ?? "rebuild",
      nodesProjected: result.nodesProjected,
      relationshipsProjected: result.relationshipsProjected,
      unresolved: result.unresolved.length,
      provenance: { missingDomains: loaded.missingDomains },
    });
    if (options?.audit !== false) {
      try {
        await this.audit.log({
          tenantId: scope.tenantId,
          workspaceId: scope.workspaceId,
          userId: scope.userId,
          action: "rebuild",
          resourceType: "business_os_context_projection",
          resourceId: scope.workspaceId,
          metadata: { nodesProjected: result.nodesProjected, unresolved: result.unresolved.length },
        });
      } catch {
        // Audit persistence must not fail-close rebuild.
      }
    }
    await this.emit(scope, "business_os.context.rebuild_completed", {
      nodesProjected: result.nodesProjected,
      relationshipsProjected: result.relationshipsProjected,
      unresolved: result.unresolved.length,
    });
    if (result.nodesProjected > 0) {
      await this.emit(scope, "business_os.context.node_projected", { count: result.nodesProjected });
    }
    if (result.relationshipsProjected > 0) {
      await this.emit(scope, "business_os.context.relationship_projected", {
        count: result.relationshipsProjected,
      });
    }
    if (result.unresolved.length > 0) {
      await this.emit(scope, "business_os.context.unresolved_reference_detected", {
        count: result.unresolved.length,
      });
    }
    return { ...result, missingDomains: loaded.missingDomains, idempotent: true };
  }

  /**
   * Hot-path event projection: only affected nodes/edges for the source event.
   * Full rebuild remains recovery/reconciliation tooling and is not required per event.
   */
  async projectIncremental(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      eventType: string;
      payload?: Record<string, unknown>;
      records?: BusinessContextCanonicalRecord[];
    },
  ) {
    const scope = requireWorkspace(raw);
    const loaded = input.records
      ? { records: input.records, missingDomains: [] as string[] }
      : await loadCanonicalRecords(this.supabase, scope);
    const affected = affectedRecordsForEvent(loaded.records, input.eventType, input.payload);
    if (affected.length === 0) {
      await this.repository.insertRun(scope, {
        status: "completed",
        trigger: "event",
        nodesProjected: 0,
        relationshipsProjected: 0,
        unresolved: 0,
        provenance: { mode: "incremental", empty: true, eventType: input.eventType },
      });
      return {
        nodesProjected: 0,
        relationshipsProjected: 0,
        unresolved: [] as Array<{
          fromCanonicalRef: string;
          toEntityId: string;
          relationshipType: string;
          reason: string;
        }>,
        missingDomains: loaded.missingDomains,
        incremental: true as const,
        fullRebuild: false as const,
      };
    }
    const result = await projectRecords(this.graph, affected, scope.userId);
    await this.repository.replaceUnresolved(
      scope,
      result.unresolved.map((row) => ({
        relationshipType: row.relationshipType,
        fromCanonicalRef: row.fromCanonicalRef,
        toRef: row.toEntityId,
        reason: row.reason,
        sourceDomain: "platform",
      })),
    );
    await this.repository.insertRun(scope, {
      status: "completed",
      trigger: "event",
      nodesProjected: result.nodesProjected,
      relationshipsProjected: result.relationshipsProjected,
      unresolved: result.unresolved.length,
      provenance: { mode: "incremental", eventType: input.eventType, fullRebuild: false },
    });
    if (result.nodesProjected > 0) {
      await this.emit(scope, "business_os.context.node_projected", {
        count: result.nodesProjected,
        incremental: true,
      });
    }
    if (result.relationshipsProjected > 0) {
      await this.emit(scope, "business_os.context.relationship_projected", {
        count: result.relationshipsProjected,
        incremental: true,
      });
    }
    return { ...result, missingDomains: loaded.missingDomains, incremental: true as const, fullRebuild: false as const };
  }

  async createOverride(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      relationshipType: string;
      fromCanonicalRef: string;
      toCanonicalRef: string;
      reason: string;
    },
  ) {
    const scope = requireWorkspace(raw);
    const type = assertRelationshipType(input.relationshipType);
    if (!input.reason?.trim()) throw new Error("manual_override_requires_reason");
    const row = await this.repository.insertOverride(scope, {
      relationshipType: type,
      fromCanonicalRef: input.fromCanonicalRef,
      toCanonicalRef: input.toCanonicalRef,
      reason: input.reason.trim(),
      evidence: {
        sourceDomain: "platform",
        sourceEntityRef: `override:${scope.userId}`,
        provenance: { reason: input.reason.trim(), reversible: true },
        projectedAt: new Date().toISOString(),
        relationshipVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
        status: "override",
      },
    });
    await this.auditSafe(scope, "create", "business_os_context_override", String(row.id), {
      relationshipType: type,
      reason: input.reason.trim(),
    });
    return row;
  }

  async reverseOverride(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string) {
    const scope = requireWorkspace(raw);
    const row = await this.repository.reverseOverride(scope, id);
    await this.auditSafe(scope, "update", "business_os_context_override", id, { status: "reversed" });
    return row;
  }

  async updateSettings(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { staleAfterHours?: number; maxDepth?: number; maxNeighbours?: number },
  ) {
    const scope = requireWorkspace(raw);
    if (input.maxDepth !== undefined && input.maxDepth > BUSINESS_CONTEXT_MAX_DEPTH) {
      throw new Error("graph_depth_exceeded");
    }
    await this.repository.upsertSettings(scope, { ...input, provenance: { ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION } });
    await this.auditSafe(scope, "update", "business_os_context_settings", scope.workspaceId, input);
    return this.repository.getSettings(scope);
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }, input: { entityType: BusinessContextNodeType; entityId: string }) {
    const scope = requireWorkspace(raw);
    const ctx = await this.entityContext(scope, input);
    const structured = assembleStructuredContext(ctx);
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "business_context.explain",
        simulation: false,
      });
      if (policy.allowed === false) return { structured, narrative: emptyNarrative("policy_denied"), disclaimer: GRAPH_CAUSATION_DISCLAIMER };
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise structured business context. Do not treat graph adjacency as causation. Do not invent relationships. Do not expose chain-of-thought.",
        context: {
          evidence: {
            kind: "business_os.context.evidence",
            payload: structured,
            instructions: [
              "Use only structured graph context.",
              "Graph adjacency is not causation.",
              "Unknown stays unknown.",
              "Do not expose chain-of-thought.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return { structured, narrative: emptyNarrative("empty_ai_response"), disclaimer: GRAPH_CAUSATION_DISCLAIMER };
      return {
        structured,
        narrative: {
          text,
          generatedAt: new Date().toISOString(),
          generatedBy: "platform_ai_director" as const,
          modelProvenance:
            [response.run.model_provider, response.run.model_name].filter(Boolean).join("/") || "platform-ai-director",
          evidenceRefs: [],
          advisory: true,
        } satisfies AiDailyBriefNarrative,
        disclaimer: GRAPH_CAUSATION_DISCLAIMER,
      };
    } catch {
      return { structured, narrative: emptyNarrative("ai_director_unavailable"), disclaimer: GRAPH_CAUSATION_DISCLAIMER };
    }
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const records = demoContextRecords(scope);
    const result = await this.rebuild(scope, { trigger: "demo", records });
    return { created: true, isDemo: true as const, ...result };
  }

  async applyRecords(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    records: BusinessContextCanonicalRecord[],
  ) {
    const scope = requireWorkspace(raw);
    return this.rebuild(scope, { trigger: "rebuild", records, audit: false });
  }

  assertOntology(version: string) {
    assertOntologyVersion(version);
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload,
      });
    } catch {
      // Event persistence must not fail-close projection.
    }
  }

  private async auditSafe(
    scope: OwnerCommandScope,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ) {
    try {
      await this.audit.log({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        action,
        resourceType,
        resourceId,
        metadata,
      });
    } catch {
      // Audit persistence must not fail-close context mutations.
    }
  }
}