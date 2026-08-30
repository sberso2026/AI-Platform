import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FORBIDDEN_QUERY_DECISION_ENGINE_TOKENS,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
  InMemoryProjectControlsSource,
  InMemoryProjectCoreSource,
  InMemoryProjectKnowledgeSource,
  InMemoryQueryDecisionIntelligencePort,
  PI_ACTION_MUTATION_ENABLED,
  PI_CANONICAL_RFI_MODEL,
  PI_CANONICAL_TQ_MODEL,
  PI_DECISION_MUTATION_ENABLED,
  PI_QUERY_MUTATION_ENABLED,
  PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED,
  PI_6_FORECASTING_IMPLEMENTED,
  PI_6_FORECASTING_READY,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  ProjectHealthEvaluator,
  ProjectQueryDecisionIntelligenceService,
  QUERY_DECISION_INTELLIGENCE_IMPLEMENTED,
  SCHEMA_CHANGED,
  actionSliceFrom,
  canonicalActionItem,
  canonicalDecision,
  canonicalQuery,
  decisionSliceFrom,
  duplicateActionDomainDetected,
  duplicateCanonicalProjectDomainDetected,
  duplicateDecisionDomainDetected,
  duplicateQueryDomainDetected,
  duplicateRfiDomainDetected,
  duplicateWorkflowEngineDetected,
  elapsedCalendarDays,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  emptyKnowledgeSnapshot,
  interpretQueryDecisionIntelligence,
  isQueryDecisionOverdue,
  querySliceFrom,
  sampleProjectIdentity,
  snapshotFromQueryDecision,
} from "../src";
import type { AccessContext } from "../src/security/access-guard";

const generatedAt = "2026-08-30T00:00:00.000Z";

const access: AccessContext = {
  tenantId: "tenant",
  workspaceId: "workspace",
  principalId: "user",
  tenantActive: true,
  workspaceAssigned: true,
  subscriptionActive: true,
  licenceActive: true,
  engineeringOsInstalled: true,
  applicationInstalled: true,
  seatAssigned: true,
  roleAssigned: true,
  featureEnabled: true,
  permissions: ["read"],
};

function interpret(
  queries: Parameters<typeof querySliceFrom>[0],
  decisions: Parameters<typeof decisionSliceFrom>[0],
  actions: Parameters<typeof actionSliceFrom>[0],
  extra?: {
    query?: Parameters<typeof querySliceFrom>[1];
    decision?: Parameters<typeof decisionSliceFrom>[1];
    action?: Parameters<typeof actionSliceFrom>[1];
  },
) {
  return interpretQueryDecisionIntelligence({
    projectId: "p1",
    tenantId: "tenant",
    workspaceId: "workspace",
    generatedAt,
    snapshot: snapshotFromQueryDecision(
      querySliceFrom(queries, extra?.query),
      decisionSliceFrom(decisions, extra?.decision),
      actionSliceFrom(actions, extra?.action),
    ),
  });
}

function greenCore() {
  return {
    ...emptyCoreSnapshot(),
    project: { projectId: "p1", storesCanonicalCopy: false as const },
    risks: { bound: true as const, items: [] },
    issues: { bound: true as const, items: [] },
    decisions: { bound: true as const, items: [] },
    actions: { bound: true as const, items: [] },
    technicalQueries: { bound: true as const, items: [] },
    documents: { bound: true as const, items: [] },
    assets: { bound: true as const, items: [] },
  };
}

describe("PI-5 query, decision, and action intelligence", () => {
  it("surfaces an open TQ and computes age from canonical timestamps", () => {
    const view = interpret(
      [canonicalQuery({ id: "tq-1", createdAt: "2026-08-01T00:00:00.000Z" })],
      [],
      [],
    );
    expect(view.query.health.classification).toBe("AMBER");
    expect(view.query.portfolio.openCount).toBe(1);
    expect(view.query.attentionItems.some((item) => item.canonicalQueryId === "tq-1")).toBe(true);
    expect(elapsedCalendarDays("2026-08-01T00:00:00.000Z", generatedAt)).toBe(29);
    expect(view.query.attentionItems.some((item) => item.reasonCode === "query_elapsed_age")).toBe(true);
  });

  it("surfaces overdue TQs only with due-date evidence and does not fabricate SLA breach", () => {
    const withDue = interpret(
      [canonicalQuery({ id: "tq-due", dueAt: "2026-08-01T00:00:00.000Z" })],
      [],
      [],
    );
    expect(withDue.query.attentionItems.some((item) => item.reasonCode === "overdue_technical_query")).toBe(true);
    expect(isQueryDecisionOverdue("2026-08-01T00:00:00.000Z", true, generatedAt)).toBe(true);

    const noDue = interpret([canonicalQuery({ id: "tq-open" })], [], []);
    expect(noDue.query.attentionItems.some((item) => item.reasonCode === "overdue_technical_query")).toBe(false);
    expect(isQueryDecisionOverdue(undefined, true, generatedAt)).toBe(false);
    expect(noDue.query.dataQuality.limitations).toContain("no_fabricated_sla_breach");
    expect(noDue.query.attentionItems.some((item) => item.reasonCode === "sla_breach")).toBe(false);
    expect(noDue.query.attentionItems.some((item) => item.reasonCode === "overdue_technical_query")).toBe(false);
    expect(noDue.query.attentionItems.some((item) => item.explanation.includes("not an SLA breach"))).toBe(true);
  });

  it("surfaces unassigned TQs", () => {
    const view = interpret(
      [canonicalQuery({ id: "tq-open", ownerId: undefined, assignedTo: undefined, responderId: undefined })],
      [],
      [],
    );
    expect(view.query.attentionItems.some((item) => item.reasonCode === "unassigned_technical_query")).toBe(true);
    expect(view.query.portfolio.unassignedCount).toBe(1);
  });

  it("surfaces open, overdue, and unowned decisions with deterministic age and latency", () => {
    const view = interpret(
      [],
      [
        canonicalDecision({
          id: "d-1",
          dueAt: "2026-08-01T00:00:00.000Z",
          createdAt: "2026-08-01T00:00:00.000Z",
        }),
      ],
      [],
    );
    expect(view.decision.health.classification).toBe("RED");
    expect(view.decision.attentionItems.some((item) => item.reasonCode === "overdue_decision")).toBe(true);
    expect(view.decision.attentionItems.some((item) => item.reasonCode === "unowned_decision")).toBe(true);
    expect(view.decision.attentionItems.some((item) => item.reasonCode === "aging_unresolved_decision")).toBe(true);
    expect(view.decision.portfolio.agingCount).toBe(1);
  });

  it("surfaces open, overdue, and unowned actions", () => {
    const view = interpret(
      [],
      [],
      [
        canonicalActionItem({
          id: "a-1",
          dueAt: "2026-08-01T00:00:00.000Z",
          ownerId: undefined,
          assignedTo: undefined,
        }),
      ],
    );
    expect(view.action.health.classification).toBe("RED");
    expect(view.action.attentionItems.some((item) => item.reasonCode === "overdue_action")).toBe(true);
    expect(view.action.attentionItems.some((item) => item.reasonCode === "unowned_action")).toBe(true);
  });

  it("uses explicit originating-object links only", () => {
    const linked = interpret(
      [canonicalQuery({ id: "tq-1" })],
      [canonicalDecision({ id: "d-1" })],
      [
        canonicalActionItem({
          id: "a-tq",
          originatingObjectType: "technical_query",
          originatingObjectId: "tq-1",
          dueAt: "2026-08-01T00:00:00.000Z",
        }),
        canonicalActionItem({
          id: "a-d",
          originatingObjectType: "decision",
          originatingObjectId: "d-1",
          dueAt: "2026-08-01T00:00:00.000Z",
        }),
      ],
    );
    expect(linked.linkedSignals.some((row) => row.reasonCode === "query_linked_to_overdue_action")).toBe(true);
    expect(linked.linkedSignals.some((row) => row.reasonCode === "decision_linked_to_overdue_action")).toBe(true);
    expect(linked.query.attentionItems.some((item) => item.reasonCode === "query_linked_to_overdue_action")).toBe(true);
    expect(linked.action.portfolio.originatingFromQueryCount).toBe(1);
    expect(linked.action.portfolio.originatingFromDecisionCount).toBe(1);

    const unlinked = interpret(
      [canonicalQuery({ id: "tq-a", title: "delay" })],
      [canonicalDecision({ id: "d-a", title: "delay" })],
      [canonicalActionItem({ id: "a-a", title: "delay" })],
    );
    expect(unlinked.linkedSignals).toHaveLength(0);
  });

  it("treats unread registers as UNKNOWN and complete empty reads as GREEN", () => {
    const empty = interpret([], [], []);
    expect(empty.query.health.classification).toBe("GREEN");
    expect(empty.query.health.reasonCodes).toContain("no_open_applicable_queries");
    expect(empty.decision.health.classification).toBe("GREEN");
    expect(empty.action.health.classification).toBe("GREEN");

    const unread = interpret([], [], [], {
      query: { availability: "no_data", bound: false },
      decision: { availability: "no_data", bound: false },
      action: { availability: "no_data", bound: false },
    });
    expect(unread.query.health.classification).toBe("UNKNOWN");
    expect(unread.query.health.classification).not.toBe("GREEN");
    expect(unread.query.health.reasonCodes).toContain("unread_query_register");
    expect(unread.decision.health.reasonCodes).toContain("unread_decision_register");
    expect(unread.action.health.reasonCodes).toContain("unread_action_register");
  });

  it("isolates query, decision, and action source failures", () => {
    const queryFail = interpret(
      [],
      [canonicalDecision({ id: "d-ok" })],
      [canonicalActionItem({ id: "a-ok" })],
      { query: { availability: "error", bound: false } },
    );
    expect(queryFail.query.availability).toBe("error");
    expect(queryFail.query.health.classification).toBe("UNKNOWN");
    expect(queryFail.decision.health.classification).toBe("AMBER");
    expect(queryFail.action.health.classification).toBe("AMBER");

    const decisionFail = interpret([canonicalQuery({ id: "tq-ok" })], [], [canonicalActionItem({ id: "a-ok" })], {
      decision: { availability: "unavailable", bound: false },
    });
    expect(decisionFail.decision.availability).toBe("unavailable");
    expect(decisionFail.query.health.classification).toBe("AMBER");
    expect(decisionFail.action.health.classification).toBe("AMBER");
  });

  it("reconciles risk health GREEN versus UNKNOWN on complete empty versus unread", async () => {
    const completeEmpty = await new ProjectHealthEvaluator({
      core: new InMemoryProjectCoreSource({
        ...emptyCoreSnapshot(),
        project: { projectId: "p1", storesCanonicalCopy: false },
        risks: { bound: true, items: [], completeness: "complete" },
      }),
      controls: new InMemoryProjectControlsSource(emptyControlsSnapshot()),
      knowledge: new InMemoryProjectKnowledgeSource(emptyKnowledgeSnapshot()),
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt: generatedAt });
    expect(completeEmpty.dimensions.find((row) => row.dimension === "risk")?.state).toBe("green");

    const unread = await new ProjectHealthEvaluator({
      core: new InMemoryProjectCoreSource(emptyCoreSnapshot()),
      controls: new InMemoryProjectControlsSource(emptyControlsSnapshot()),
      knowledge: new InMemoryProjectKnowledgeSource(emptyKnowledgeSnapshot()),
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt: generatedAt });
    expect(unread.dimensions.find((row) => row.dimension === "risk")?.state).toBe("unknown");
    expect(unread.dimensions.find((row) => row.dimension === "risk")?.state).not.toBe("green");
  });

  it("denies cross-tenant and cross-workspace through Command Centre identity checks", async () => {
    const service = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ tenantId: "other-tenant" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort(emptyControlsSnapshot()),
      knowledge: new InMemoryCommandCentreKnowledgePort({
        findings: { bound: true, items: [] },
        inspectionFindings: { bound: true, items: [] },
      }),
    });
    await expect(service.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      code: "project_forbidden",
    });
  });

  it("works with AI disabled and isolates a throwing query/decision source on Command Centre", async () => {
    const view = await new ProjectQueryDecisionIntelligenceService(
      new InMemoryQueryDecisionIntelligencePort(undefined, "throw"),
    ).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    expect(view.mutatesQuery).toBe(false);
    expect(view.mutatesDecision).toBe(false);
    expect(view.mutatesAction).toBe(false);
    expect(view.query.availability).toBe("error");

    const cc = await new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity(), greenCore()),
      controls: new InMemoryCommandCentreControlsPort(emptyControlsSnapshot()),
      knowledge: new InMemoryCommandCentreKnowledgePort({
        findings: { bound: true, items: [] },
        inspectionFindings: { bound: true, items: [] },
      }),
      queryDecision: new InMemoryQueryDecisionIntelligencePort(undefined, "throw"),
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(cc.queryDecisionIntelligence.query.health.classification).toBe("GREEN");
    expect(cc.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
  });

  it("fails closed on forbidden dedicated query/decision reads", async () => {
    await expect(
      new ProjectQueryDecisionIntelligenceService(
        new InMemoryQueryDecisionIntelligencePort(
          snapshotFromQueryDecision(
            querySliceFrom([], { availability: "forbidden", bound: false }),
            decisionSliceFrom([], { availability: "ok", bound: true, completeness: "complete" }),
            actionSliceFrom([], { availability: "ok", bound: true, completeness: "complete" }),
          ),
        ),
      ).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden" });
  });

  it("does not implement duplicate query, RFI, decision, action, or workflow domains", () => {
    expect(duplicateQueryDomainDetected).toBe(false);
    expect(duplicateRfiDomainDetected).toBe(false);
    expect(duplicateDecisionDomainDetected).toBe(false);
    expect(duplicateActionDomainDetected).toBe(false);
    expect(duplicateCanonicalProjectDomainDetected).toBe(false);
    expect(duplicateWorkflowEngineDetected).toBe(false);
    expect(PI_QUERY_MUTATION_ENABLED).toBe(false);
    expect(PI_DECISION_MUTATION_ENABLED).toBe(false);
    expect(PI_ACTION_MUTATION_ENABLED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(QUERY_DECISION_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED).toBe(false);
    expect(PI_6_FORECASTING_IMPLEMENTED).toBe(false);
    expect(PI_6_FORECASTING_READY).toBe(true);
    expect(PI_CANONICAL_TQ_MODEL).toBe("engineering_technical_queries");
    expect(PI_CANONICAL_RFI_MODEL).toBe("not_first_class_represented_through_technical_queries");
    const dir = resolve(__dirname, "../src/query-decision-intelligence");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/@rtb\/project-controls/);
      expect(source).not.toMatch(/\.insert\(/);
      expect(source).not.toMatch(/\.update\(/);
      for (const token of FORBIDDEN_QUERY_DECISION_ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
  });
});
