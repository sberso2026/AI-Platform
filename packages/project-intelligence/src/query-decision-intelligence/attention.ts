import {
  actionEvidence,
  decisionEvidence,
  elapsedCalendarDays,
  isHighPriority,
  isOverdue,
  isStaleOpen,
  isUnowned,
  queryDueAt,
  queryEvidence,
} from "./interpreter";
import type {
  ActionAttentionItem,
  ActionHealthSummary,
  ActionSourceSlice,
  DecisionAttentionItem,
  DecisionHealthSummary,
  DecisionSourceSlice,
  QueryAttentionItem,
  QueryDecisionFreshnessState,
  QueryHealthSummary,
  QuerySourceSlice,
} from "./types";

export function buildQueryAttention(input: {
  slice: QuerySourceSlice;
  health: QueryHealthSummary;
  freshness: QueryDecisionFreshnessState;
  generatedAt: string;
}): readonly QueryAttentionItem[] {
  const items: QueryAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: QueryAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  if (!input.slice.bound || input.slice.availability === "no_data") {
    push({
      id: "gap:unread-query-register",
      severity: "info",
      reasonCode: "unread_query_register",
      explanation: "Canonical technical query register is unread. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "technical_query",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.slice.completeness === "unknown") {
    push({
      id: "gap:query-completeness-unknown",
      severity: "info",
      reasonCode: "query_register_completeness_unknown",
      explanation: "Canonical technical query register completeness is unknown. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "technical_query",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
  }

  for (const query of input.slice.items.filter((item) => item.open)) {
    const dueAt = queryDueAt(query);
    const asOf = query.updatedAt ?? input.generatedAt;
    const ageDays = elapsedCalendarDays(query.createdAt, input.generatedAt);
    if (isOverdue(dueAt, true, input.generatedAt)) {
      push({
        id: `query:overdue:${query.id}`,
        severity: "red",
        reasonCode: "overdue_technical_query",
        explanation: `Open technical query ${query.id} is past its canonical due date.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        ageDays,
        dueAt,
        asOf,
      });
    }
    if (isHighPriority(query.priority)) {
      push({
        id: `query:high:${query.id}`,
        severity: "amber",
        reasonCode: "high_priority_open_query",
        explanation: `High-priority technical query ${query.id} remains unresolved.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        ageDays,
        dueAt,
        asOf,
      });
    }
    if (isUnowned(query)) {
      push({
        id: `query:unowned:${query.id}`,
        severity: "amber",
        reasonCode: "unassigned_technical_query",
        explanation: `Open technical query ${query.id} has no owner, assignee, or responder.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        ageDays,
        asOf,
      });
    }
    if (isStaleOpen(query.updatedAt, true, input.generatedAt)) {
      push({
        id: `query:stale:${query.id}`,
        severity: "info",
        reasonCode: "stale_unresolved_query",
        explanation: `Open technical query ${query.id} has not been updated within the freshness window.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        ageDays,
        asOf,
      });
    }
    if (typeof ageDays === "number" && ageDays >= 14 && query.open) {
      push({
        id: `query:latency:${query.id}`,
        severity: "info",
        reasonCode: "query_elapsed_age",
        explanation: `Open technical query ${query.id} has elapsed ${ageDays} calendar days since it was raised. This is elapsed age, not an SLA breach.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        ageDays,
        asOf,
      });
    }
    if (query.status.toLowerCase() === "blocked") {
      push({
        id: `query:blocked:${query.id}`,
        severity: "amber",
        reasonCode: "blocked_technical_query",
        explanation: `Technical query ${query.id} has canonical blocked status.`,
        evidenceReference: queryEvidence(query),
        canonicalQueryId: query.id,
        asOf,
      });
    }
  }
  return items;
}

export function buildDecisionAttention(input: {
  slice: DecisionSourceSlice;
  health: DecisionHealthSummary;
  freshness: QueryDecisionFreshnessState;
  generatedAt: string;
}): readonly DecisionAttentionItem[] {
  const items: DecisionAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: DecisionAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  if (!input.slice.bound || input.slice.availability === "no_data") {
    push({
      id: "gap:unread-decision-register",
      severity: "info",
      reasonCode: "unread_decision_register",
      explanation: "Canonical decision register is unread. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "decision",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.slice.completeness === "unknown") {
    push({
      id: "gap:decision-completeness-unknown",
      severity: "info",
      reasonCode: "decision_register_completeness_unknown",
      explanation: "Canonical decision register completeness is unknown. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "decision",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
  }

  for (const decision of input.slice.items.filter((item) => item.open)) {
    const asOf = decision.updatedAt ?? input.generatedAt;
    const ageDays = elapsedCalendarDays(decision.createdAt, input.generatedAt);
    const latencyDays = decision.decisionDate
      ? elapsedCalendarDays(decision.createdAt, decision.decisionDate)
      : ageDays;
    if (isOverdue(decision.dueAt, true, input.generatedAt)) {
      push({
        id: `decision:overdue:${decision.id}`,
        severity: "red",
        reasonCode: "overdue_decision",
        explanation: `Open decision ${decision.id} is past its canonical due date.`,
        evidenceReference: decisionEvidence(decision),
        canonicalDecisionId: decision.id,
        ageDays,
        latencyDays,
        dueAt: decision.dueAt,
        asOf,
      });
    }
    if (isUnowned(decision)) {
      push({
        id: `decision:unowned:${decision.id}`,
        severity: "amber",
        reasonCode: "unowned_decision",
        explanation: `Open decision ${decision.id} has no owner or assignee.`,
        evidenceReference: decisionEvidence(decision),
        canonicalDecisionId: decision.id,
        ageDays,
        asOf,
      });
    }
    if (typeof ageDays === "number" && ageDays >= 14) {
      push({
        id: `decision:aging:${decision.id}`,
        severity: "info",
        reasonCode: "aging_unresolved_decision",
        explanation: `Open decision ${decision.id} has elapsed ${ageDays} calendar days. This is elapsed age, not an SLA breach.`,
        evidenceReference: decisionEvidence(decision),
        canonicalDecisionId: decision.id,
        ageDays,
        latencyDays,
        asOf,
      });
    }
  }
  return items;
}

export function buildActionAttention(input: {
  slice: ActionSourceSlice;
  health: ActionHealthSummary;
  freshness: QueryDecisionFreshnessState;
  generatedAt: string;
}): readonly ActionAttentionItem[] {
  const items: ActionAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: ActionAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  if (!input.slice.bound || input.slice.availability === "no_data") {
    push({
      id: "gap:unread-action-register",
      severity: "info",
      reasonCode: "unread_action_register",
      explanation: "Canonical action register is unread. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "action",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.slice.completeness === "unknown") {
    push({
      id: "gap:action-completeness-unknown",
      severity: "info",
      reasonCode: "action_register_completeness_unknown",
      explanation: "Canonical action register completeness is unknown. This is not treated as all-clear.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "action",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
  }

  for (const action of input.slice.items.filter((item) => item.open)) {
    const asOf = action.updatedAt ?? input.generatedAt;
    if (isOverdue(action.dueAt, true, input.generatedAt)) {
      push({
        id: `action:overdue:${action.id}`,
        severity: "red",
        reasonCode: "overdue_action",
        explanation: `Open action ${action.id} is past its canonical due date.`,
        evidenceReference: actionEvidence(action),
        canonicalActionId: action.id,
        originatingObjectType: action.originatingObjectType,
        originatingObjectId: action.originatingObjectId,
        dueAt: action.dueAt,
        asOf,
      });
    }
    if (isUnowned(action)) {
      push({
        id: `action:unowned:${action.id}`,
        severity: "amber",
        reasonCode: "unowned_action",
        explanation: `Open action ${action.id} has no owner or assignee.`,
        evidenceReference: actionEvidence(action),
        canonicalActionId: action.id,
        asOf,
      });
    }
    if (isHighPriority(action.priority)) {
      push({
        id: `action:high:${action.id}`,
        severity: "amber",
        reasonCode: "high_priority_open_action",
        explanation: `High-priority action ${action.id} remains unresolved.`,
        evidenceReference: actionEvidence(action),
        canonicalActionId: action.id,
        asOf,
      });
    }
  }
  return items;
}
