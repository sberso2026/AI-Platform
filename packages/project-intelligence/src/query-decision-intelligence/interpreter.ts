import type { CommandCentreAvailability } from "../command-centre/types";
import {
  classifySourcedRegisterRead,
  registerReadMayEvaluateGreen,
} from "../project-health/register-read-semantics";
import { RISK_CHANGE_STALE_MS } from "../risk-change-intelligence/interpreter";
import type {
  ActionDataQuality,
  ActionEvidenceReference,
  ActionHealthSummary,
  ActionPortfolioSummary,
  ActionSourceSlice,
  CanonicalActionRef,
  CanonicalDecisionRef,
  CanonicalQueryRef,
  DecisionDataQuality,
  DecisionEvidenceReference,
  DecisionHealthSummary,
  DecisionPortfolioSummary,
  DecisionSourceSlice,
  QueryDataQuality,
  QueryDecisionFreshnessState,
  QueryDecisionLinkedSignal,
  QueryEvidenceReference,
  QueryHealthSummary,
  QueryPortfolioSummary,
  QuerySourceSlice,
} from "./types";

export const QUERY_DECISION_STALE_MS = RISK_CHANGE_STALE_MS;
const RECENT_MS = 14 * 24 * 60 * 60 * 1000;
const AGING_DAYS = 14;

export function elapsedCalendarDays(from: string | undefined, to: string): number | undefined {
  if (!from) return undefined;
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return undefined;
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

export function classifyQueryDecisionFreshness(
  availability: CommandCentreAvailability,
  asOf: string | undefined,
  generatedAt: string,
): QueryDecisionFreshnessState {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return "UNAVAILABLE";
  }
  if (!asOf) return "UNKNOWN";
  const then = Date.parse(asOf);
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "UNKNOWN";
  if (now - then > QUERY_DECISION_STALE_MS) return "STALE";
  return "CURRENT";
}

export function isHighPriority(priority: string | undefined): boolean {
  return priority === "high" || priority === "critical";
}

export function isUnowned(item: { ownerId?: string; assignedTo?: string; responderId?: string }): boolean {
  return !item.ownerId && !item.assignedTo && !item.responderId;
}

export function queryDueAt(item: CanonicalQueryRef): string | undefined {
  return item.dueAt ?? item.responseDue;
}

export function isOverdue(dueAt: string | undefined, open: boolean, generatedAt: string): boolean {
  if (!open || !dueAt) return false;
  const due = Date.parse(dueAt);
  const now = Date.parse(generatedAt);
  return Number.isFinite(due) && Number.isFinite(now) && due < now;
}

export function isStaleOpen(updatedAt: string | undefined, open: boolean, generatedAt: string): boolean {
  if (!open || !updatedAt) return false;
  return classifyQueryDecisionFreshness("ok", updatedAt, generatedAt) === "STALE";
}

export function queryEvidence(item: CanonicalQueryRef): QueryEvidenceReference {
  return {
    sourceDomain: "engineering_core",
    entityType: "technical_query",
    entityId: item.id,
    sourceTimestamp: item.updatedAt ?? item.createdAt,
    storesCanonicalCopy: false,
  };
}

export function decisionEvidence(item: CanonicalDecisionRef): DecisionEvidenceReference {
  return {
    sourceDomain: "engineering_core",
    entityType: "decision",
    entityId: item.id,
    sourceTimestamp: item.updatedAt ?? item.createdAt,
    storesCanonicalCopy: false,
  };
}

export function actionEvidence(item: CanonicalActionRef): ActionEvidenceReference {
  return {
    sourceDomain: "engineering_core",
    entityType: "action",
    entityId: item.id,
    sourceTimestamp: item.updatedAt ?? item.createdAt,
    storesCanonicalCopy: false,
  };
}

function unavailableHealth(kind: "query" | "decision" | "action", readState: string): QueryHealthSummary {
  if (readState === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: `${kind} access denied.`,
      reasonCodes: [`${kind}_forbidden`],
    };
  }
  if (readState === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: `${kind} intelligence is unavailable.`,
      reasonCodes: [`${kind}_source_unavailable`],
    };
  }
  if (readState === "unknown_completeness") {
    return {
      classification: "UNKNOWN",
      headline: `Canonical ${kind} register completeness is unknown.`,
      reasonCodes: [`${kind}_register_completeness_unknown`],
    };
  }
  return {
    classification: "UNKNOWN",
    headline: `Canonical ${kind} register is unread or unbound.`,
    reasonCodes: [`unread_${kind}_register`],
  };
}

export function classifyQueryHealth(slice: QuerySourceSlice, generatedAt: string): QueryHealthSummary {
  const readState = classifySourcedRegisterRead({
    bound: slice.bound,
    completeness: slice.completeness,
    availability: slice.availability,
  });
  if (!registerReadMayEvaluateGreen(readState)) return unavailableHealth("query", readState);
  const open = slice.items.filter((item) => item.open);
  const overdue = open.filter((item) => isOverdue(queryDueAt(item), true, generatedAt));
  const high = open.filter((item) => isHighPriority(item.priority));
  if (overdue.length > 0) {
    return {
      classification: "RED",
      headline: "Open technical queries are overdue.",
      reasonCodes: ["overdue_technical_query"],
    };
  }
  if (high.length > 0) {
    return {
      classification: "AMBER",
      headline: "High-priority technical queries remain open.",
      reasonCodes: ["high_priority_open_query"],
    };
  }
  if (open.length > 0) {
    return {
      classification: "AMBER",
      headline: "Open technical queries remain unresolved.",
      reasonCodes: ["open_technical_query"],
    };
  }
  return {
    classification: "GREEN",
    headline: "Canonical technical query register was read completely and has no applicable open queries.",
    reasonCodes: ["no_open_applicable_queries"],
  };
}

export function classifyDecisionHealth(slice: DecisionSourceSlice, generatedAt: string): DecisionHealthSummary {
  const readState = classifySourcedRegisterRead({
    bound: slice.bound,
    completeness: slice.completeness,
    availability: slice.availability,
  });
  if (!registerReadMayEvaluateGreen(readState)) return unavailableHealth("decision", readState);
  const open = slice.items.filter((item) => item.open);
  const overdue = open.filter((item) => isOverdue(item.dueAt, true, generatedAt));
  if (overdue.length > 0) {
    return {
      classification: "RED",
      headline: "Open decisions are overdue.",
      reasonCodes: ["overdue_decision"],
    };
  }
  if (open.length > 0) {
    return {
      classification: "AMBER",
      headline: "Open decisions remain unresolved.",
      reasonCodes: ["open_decision"],
    };
  }
  return {
    classification: "GREEN",
    headline: "Canonical decision register was read completely and has no applicable open decisions.",
    reasonCodes: ["no_open_applicable_decisions"],
  };
}

export function classifyActionHealth(slice: ActionSourceSlice, generatedAt: string): ActionHealthSummary {
  const readState = classifySourcedRegisterRead({
    bound: slice.bound,
    completeness: slice.completeness,
    availability: slice.availability,
  });
  if (!registerReadMayEvaluateGreen(readState)) return unavailableHealth("action", readState);
  const open = slice.items.filter((item) => item.open);
  const overdue = open.filter((item) => isOverdue(item.dueAt, true, generatedAt));
  const high = open.filter((item) => isHighPriority(item.priority));
  if (overdue.length > 0) {
    return {
      classification: "RED",
      headline: "Open actions are overdue.",
      reasonCodes: ["overdue_action"],
    };
  }
  if (high.length > 0) {
    return {
      classification: "AMBER",
      headline: "High-priority actions remain open.",
      reasonCodes: ["high_priority_open_action"],
    };
  }
  if (open.length > 0) {
    return {
      classification: "AMBER",
      headline: "Open actions remain unresolved.",
      reasonCodes: ["open_action"],
    };
  }
  return {
    classification: "GREEN",
    headline: "Canonical action register was read completely and has no applicable open actions.",
    reasonCodes: ["no_open_applicable_actions"],
  };
}

export function interpretQueryPortfolio(items: readonly CanonicalQueryRef[], generatedAt: string): QueryPortfolioSummary {
  const open = items.filter((item) => item.open);
  return {
    openCount: open.length,
    overdueCount: open.filter((item) => isOverdue(queryDueAt(item), true, generatedAt)).length,
    unassignedCount: open.filter((item) => isUnowned(item)).length,
    highPriorityCount: open.filter((item) => isHighPriority(item.priority)).length,
    staleCount: open.filter((item) => isStaleOpen(item.updatedAt, true, generatedAt)).length,
    resolvedOrClosedCount: items.filter((item) => !item.open).length,
    numericalScoreImplemented: false,
  };
}

export function interpretDecisionPortfolio(
  items: readonly CanonicalDecisionRef[],
  generatedAt: string,
): DecisionPortfolioSummary {
  const open = items.filter((item) => item.open);
  const generatedMs = Date.parse(generatedAt);
  return {
    openCount: open.length,
    overdueCount: open.filter((item) => isOverdue(item.dueAt, true, generatedAt)).length,
    unassignedCount: open.filter((item) => isUnowned(item)).length,
    agingCount: open.filter((item) => {
      const age = elapsedCalendarDays(item.createdAt, generatedAt);
      return typeof age === "number" && age >= AGING_DAYS;
    }).length,
    recentlyDecidedCount: items.filter((item) => {
      if (!item.decisionDate || !Number.isFinite(generatedMs)) return false;
      const decided = Date.parse(item.decisionDate);
      return Number.isFinite(decided) && generatedMs - decided <= RECENT_MS;
    }).length,
    numericalScoreImplemented: false,
  };
}

export function interpretActionPortfolio(items: readonly CanonicalActionRef[], generatedAt: string): ActionPortfolioSummary {
  const open = items.filter((item) => item.open);
  const generatedMs = Date.parse(generatedAt);
  return {
    openCount: open.length,
    overdueCount: open.filter((item) => isOverdue(item.dueAt, true, generatedAt)).length,
    unassignedCount: open.filter((item) => isUnowned(item)).length,
    highPriorityCount: open.filter((item) => isHighPriority(item.priority)).length,
    originatingFromRiskCount: items.filter((item) => item.originatingObjectType === "risk").length,
    originatingFromQueryCount: items.filter((item) => item.originatingObjectType === "technical_query").length,
    originatingFromDecisionCount: items.filter((item) => item.originatingObjectType === "decision").length,
    originatingFromChangeCount: items.filter((item) => item.originatingObjectType === "change").length,
    recentlyCompletedCount: items.filter((item) => {
      if (item.open || !item.closedAt || !Number.isFinite(generatedMs)) return false;
      const closed = Date.parse(item.closedAt);
      return Number.isFinite(closed) && generatedMs - closed <= RECENT_MS;
    }).length,
    numericalScoreImplemented: false,
  };
}

function interpretRegisterQuality(
  slice: { availability: CommandCentreAvailability; bound: boolean; completeness?: "complete" | "unknown"; sourceTimestamp?: string; items: readonly { updatedAt?: string }[] },
  generatedAt: string,
  missingIfUnread: string,
): QueryDataQuality {
  const asOf = slice.sourceTimestamp ?? slice.items[0]?.updatedAt;
  const limitations: string[] = ["contractual_response_not_issued_by_pi", "no_fabricated_sla_breach"];
  const missing: string[] = [];
  if (!slice.bound) missing.push(missingIfUnread);
  if (slice.completeness === "unknown") limitations.push("register_completeness_unknown");
  const freshness = classifyQueryDecisionFreshness(slice.availability, asOf, generatedAt);
  if (freshness === "STALE") limitations.push("stale_canonical_register_records");
  return {
    asOf,
    source: "engineering_core",
    freshness,
    registerBound: slice.bound,
    completeness: slice.completeness,
    missing,
    limitations,
  };
}

export function interpretQueryDataQuality(slice: QuerySourceSlice, generatedAt: string): QueryDataQuality {
  return interpretRegisterQuality(slice, generatedAt, "canonical_technical_query_register");
}

export function interpretDecisionDataQuality(slice: DecisionSourceSlice, generatedAt: string): DecisionDataQuality {
  return interpretRegisterQuality(slice, generatedAt, "canonical_decision_register");
}

export function interpretActionDataQuality(slice: ActionSourceSlice, generatedAt: string): ActionDataQuality {
  return interpretRegisterQuality(slice, generatedAt, "canonical_action_register");
}

export function interpretLinkedSignals(input: {
  query: QuerySourceSlice;
  decision: DecisionSourceSlice;
  action: ActionSourceSlice;
  generatedAt: string;
}): readonly QueryDecisionLinkedSignal[] {
  const queries = new Map(input.query.items.map((item) => [item.id, item]));
  const decisions = new Map(input.decision.items.map((item) => [item.id, item]));
  const signals: QueryDecisionLinkedSignal[] = [];
  const seen = new Set<string>();
  const push = (signal: QueryDecisionLinkedSignal) => {
    if (seen.has(signal.id)) return;
    seen.add(signal.id);
    signals.push(signal);
  };

  for (const action of input.action.items) {
    if (!action.originatingObjectType || !action.originatingObjectId) continue;
    if (action.originatingObjectType === "technical_query") {
      const query = queries.get(action.originatingObjectId);
      if (!query) continue;
      const overdue = isOverdue(action.dueAt, action.open, input.generatedAt);
      push({
        id: `link:query-action:${query.id}:${action.id}`,
        reasonCode: overdue ? "query_linked_to_overdue_action" : "query_linked_to_canonical_action",
        explanation: overdue
          ? `Technical query ${query.id} has an overdue linked action ${action.id}.`
          : `Canonical action ${action.id} originates from technical query ${query.id}.`,
        fromEvidence: queryEvidence(query),
        toEvidence: actionEvidence(action),
      });
    } else if (action.originatingObjectType === "decision") {
      const decision = decisions.get(action.originatingObjectId);
      if (!decision) continue;
      const overdue = isOverdue(action.dueAt, action.open, input.generatedAt);
      push({
        id: `link:decision-action:${decision.id}:${action.id}`,
        reasonCode: overdue ? "decision_linked_to_overdue_action" : "decision_linked_to_canonical_action",
        explanation: overdue
          ? `Open decision ${decision.id} has an overdue linked action ${action.id}.`
          : `Canonical action ${action.id} originates from decision ${decision.id}.`,
        fromEvidence: decisionEvidence(decision),
        toEvidence: actionEvidence(action),
      });
    } else if (action.originatingObjectType === "risk") {
      push({
        id: `link:risk-action:${action.originatingObjectId}:${action.id}`,
        reasonCode: isOverdue(action.dueAt, action.open, input.generatedAt)
          ? "risk_mitigation_action_overdue"
          : "risk_linked_to_canonical_action",
        explanation: isOverdue(action.dueAt, action.open, input.generatedAt)
          ? `Risk mitigation action ${action.id} originating from risk ${action.originatingObjectId} is overdue.`
          : `Canonical action ${action.id} originates from risk ${action.originatingObjectId}.`,
        fromEvidence: {
          sourceDomain: "engineering_core",
          entityType: "risk",
          entityId: action.originatingObjectId,
          storesCanonicalCopy: false,
        },
        toEvidence: actionEvidence(action),
      });
    } else if (action.originatingObjectType === "change") {
      push({
        id: `link:change-action:${action.originatingObjectId}:${action.id}`,
        reasonCode: "change_linked_to_canonical_action",
        explanation: `Canonical action ${action.id} originates from change ${action.originatingObjectId}.`,
        fromEvidence: {
          sourceDomain: "engineering_core",
          entityType: "change",
          entityId: action.originatingObjectId,
          storesCanonicalCopy: false,
        },
        toEvidence: actionEvidence(action),
      });
    }
  }

  return signals;
}
