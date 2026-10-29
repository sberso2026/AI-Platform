/**
 * EOS 3.4 Decision Intelligence — ANALYSIS != RECOMMENDATION != HUMAN_DECISION.
 * Authoritative Decision object remains EOS 3.2; this layer provides governed analysis around it.
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";

export const AI_DECISION_AUTHORITY = false as const;

export type DecisionCaseLifecycle =
  | "DRAFT"
  | "ANALYSIS"
  | "READY_FOR_HUMAN_DECISION"
  | "DECIDED"
  | "SUPERSEDED";

export type UncertaintyLevel = "known" | "estimated" | "uncertain" | "unknown" | "conflicting_evidence";

export type DecisionOptionOrigin = "human" | "ai_recommendation" | "optimization_candidate";

export type Eos3DecisionObjective = {
  objectiveId: string;
  key: string;
  direction: "minimize" | "maximize";
  unit: string | null;
  target: number | null;
  weight: number;
  source: string;
  authority: "human" | "ai_recommendation";
  acceptedByHuman: boolean;
  version: string;
  rationale: string;
};

export type Eos3DecisionConstraint = {
  constraintId: string;
  key: string;
  kind: "hard" | "soft";
  classification: "deterministic" | "rule_based" | "ai_inferred";
  source: string;
  requirementLink: string | null;
  engineeringBasisLink: string | null;
  jurisdictionContext: string | null;
  unit: string | null;
  limit: number;
  tolerance: number | null;
  evidenceClass: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION";
  acceptedByHuman: boolean;
};

export type Eos3DecisionOption = {
  optionId: string;
  label: string;
  description: string;
  origin: DecisionOptionOrigin;
  assumptionIds: string[];
  constraintKeys: string[];
  objectiveScores: Record<string, number>;
  evidenceIds: string[];
  risks: string[];
  estimatedConsequences: string[];
  calculationIds: string[];
  optimizationCandidateIds: string[];
  evidenceClass: "FACT" | "RECOMMENDATION";
};

export type WeightScheme = {
  schemeId: string;
  version: string;
  source: string;
  actorId: string;
  rationale: string;
  weights: Record<string, number>;
  authority: "human" | "ai_recommendation";
  acceptedByHuman: boolean;
};

export type DecisionRecommendation = {
  recommendationId: string;
  preferredOptionId: string | null;
  rankedOptionIds: string[];
  optionsConsidered: string[];
  objectives: string[];
  constraints: string[];
  keyEvidenceIds: string[];
  assumptionIds: string[];
  uncertainties: UncertaintyLevel[];
  reason: string;
  limitations: string[];
  evidenceClass: "RECOMMENDATION";
  stale: boolean;
  createdAt: string;
};

export type HumanDecisionRecord = {
  decisionId: string;
  selectedOptionId: string;
  actorId: string;
  authorityRole: string;
  rationale: string;
  date: string;
  immutable: true;
};

export type Eos3DecisionCase = {
  caseId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  subject: string;
  decisionQuestion: string;
  decisionOwnerId: string;
  decisionAuthorityRole: string;
  lifecycle: DecisionCaseLifecycle;
  options: Eos3DecisionOption[];
  objectives: Eos3DecisionObjective[];
  constraints: Eos3DecisionConstraint[];
  assumptionIds: string[];
  evidenceIds: string[];
  risks: string[];
  consequences: string[];
  uncertainty: UncertaintyLevel;
  weightScheme: WeightScheme | null;
  recommendation: DecisionRecommendation | null;
  humanDecision: HumanDecisionRecord | null;
  linkedDecisionObjectId: string | null;
  linkedOptimizationRunIds: string[];
  revision: number;
  supersededByCaseId: string | null;
  stale: boolean;
  staleReasons: string[];
  provenance: Record<string, unknown>;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
  createdAt: string;
  updatedAt: string;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

export function createDecisionCase(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  subject: string;
  decisionQuestion: string;
  decisionOwnerId: string;
  decisionAuthorityRole: string;
}): Eos3DecisionCase {
  const caseId = id();
  return {
    caseId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    subject: input.subject,
    decisionQuestion: input.decisionQuestion,
    decisionOwnerId: input.decisionOwnerId,
    decisionAuthorityRole: input.decisionAuthorityRole,
    lifecycle: "DRAFT",
    options: [],
    objectives: [],
    constraints: [],
    assumptionIds: [],
    evidenceIds: [],
    risks: [],
    consequences: [],
    uncertainty: "unknown",
    weightScheme: null,
    recommendation: null,
    humanDecision: null,
    linkedDecisionObjectId: null,
    linkedOptimizationRunIds: [],
    revision: 1,
    supersededByCaseId: null,
    stale: false,
    staleReasons: [],
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: caseId,
      revisionId: null,
      source: "eos3.decision.intelligence",
      actorId: input.decisionOwnerId,
      authority: input.decisionAuthorityRole,
      method: "createDecisionCase",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: null,
    }),
    audit: [{ action: "case_created", actorId: input.decisionOwnerId, at: now(), detail: {} }],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function advanceDecisionLifecycle(
  decisionCase: Eos3DecisionCase,
  next: DecisionCaseLifecycle,
  actor: { role: "human" | "ai"; actorId: string },
): Eos3DecisionCase {
  if (next === "DECIDED") {
    throw new Error("use_record_human_decision");
  }
  if (decisionCase.lifecycle === "DECIDED" || decisionCase.lifecycle === "SUPERSEDED") {
    throw new Error("terminal_lifecycle");
  }
  if (actor.role === "ai" && next === "READY_FOR_HUMAN_DECISION" && !decisionCase.recommendation) {
    throw new Error("recommendation_required_before_ready");
  }
  return {
    ...decisionCase,
    lifecycle: next,
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      { action: "lifecycle_advanced", actorId: actor.actorId, at: now(), detail: { next, role: actor.role } },
    ],
  };
}

export function addOption(
  decisionCase: Eos3DecisionCase,
  option: Omit<Eos3DecisionOption, "optionId">,
): Eos3DecisionCase {
  const full: Eos3DecisionOption = { ...option, optionId: id() };
  if (option.origin === "ai_recommendation") {
    full.evidenceClass = "RECOMMENDATION";
  }
  return {
    ...decisionCase,
    options: [...decisionCase.options, full],
    lifecycle: decisionCase.lifecycle === "DRAFT" ? "ANALYSIS" : decisionCase.lifecycle,
    updatedAt: now(),
    audit: [...decisionCase.audit, { action: "option_added", actorId: null, at: now(), detail: { origin: option.origin } }],
  };
}

export function setWeightScheme(
  decisionCase: Eos3DecisionCase,
  scheme: Omit<WeightScheme, "schemeId">,
): Eos3DecisionCase {
  const full: WeightScheme = { ...scheme, schemeId: id() };
  if (scheme.authority === "ai_recommendation" && !scheme.acceptedByHuman) {
    // remains recommendation until human acceptance
  }
  return {
    ...decisionCase,
    weightScheme: full,
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      {
        action: "weight_scheme_set",
        actorId: scheme.actorId,
        at: now(),
        detail: { authority: scheme.authority, acceptedByHuman: scheme.acceptedByHuman },
      },
    ],
  };
}

export function acceptAiWeights(decisionCase: Eos3DecisionCase, humanActorId: string): Eos3DecisionCase {
  if (!decisionCase.weightScheme || decisionCase.weightScheme.authority !== "ai_recommendation") {
    throw new Error("no_ai_weights");
  }
  return {
    ...decisionCase,
    weightScheme: {
      ...decisionCase.weightScheme,
      acceptedByHuman: true,
      authority: "human",
      actorId: humanActorId,
      version: `${decisionCase.weightScheme.version}+accepted`,
    },
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      { action: "ai_weights_accepted", actorId: humanActorId, at: now(), detail: {} },
    ],
  };
}

/** Weighted multi-criteria scoring — subjective weights require provenance. */
export function scoreOptions(
  decisionCase: Eos3DecisionCase,
): Array<{ optionId: string; score: number; dominated: boolean; hardConstraintViolations: string[] }> {
  const weights = decisionCase.weightScheme?.weights ?? Object.fromEntries(
    decisionCase.objectives.map((o) => [o.key, o.weight]),
  );
  const scored = decisionCase.options.map((opt) => {
    let score = 0;
    for (const obj of decisionCase.objectives) {
      const raw = opt.objectiveScores[obj.key] ?? 0;
      const w = weights[obj.key] ?? obj.weight;
      const directed = obj.direction === "maximize" ? raw : -raw;
      score += directed * w;
    }
    const hardConstraintViolations = decisionCase.constraints
      .filter((c) => c.kind === "hard")
      .filter((c) => {
        const v = opt.objectiveScores[c.key];
        if (v == null) return false;
        // Convention: for capacity-like constraints, score key holds utilized value; violation if > limit
        return v > c.limit + (c.tolerance ?? 0);
      })
      .map((c) => c.key);
    return { optionId: opt.optionId, score, dominated: false, hardConstraintViolations };
  });

  // Simple Pareto dominance on objectiveScores
  for (const a of scored) {
    const oa = decisionCase.options.find((o) => o.optionId === a.optionId)!;
    a.dominated = scored.some((b) => {
      if (b.optionId === a.optionId) return false;
      const ob = decisionCase.options.find((o) => o.optionId === b.optionId)!;
      let betterOrEqual = true;
      let strictlyBetter = false;
      for (const obj of decisionCase.objectives) {
        const va = oa.objectiveScores[obj.key] ?? 0;
        const vb = ob.objectiveScores[obj.key] ?? 0;
        const aBetter = obj.direction === "maximize" ? va >= vb : va <= vb;
        const aStrict = obj.direction === "maximize" ? va > vb : va < vb;
        // b dominates a if b is better-or-equal on all and better on one
        const bBetterOrEqual = obj.direction === "maximize" ? vb >= va : vb <= va;
        const bStrict = obj.direction === "maximize" ? vb > va : vb < va;
        void aBetter;
        void aStrict;
        if (!bBetterOrEqual) betterOrEqual = false;
        if (bStrict) strictlyBetter = true;
      }
      return betterOrEqual && strictlyBetter;
    });
  }
  return scored.sort((x, y) => y.score - x.score);
}

export function generateRecommendation(
  decisionCase: Eos3DecisionCase,
  extras?: { evidenceIds?: string[]; limitations?: string[] },
): Eos3DecisionCase {
  if (!decisionCase.weightScheme || (decisionCase.weightScheme.authority === "ai_recommendation" && !decisionCase.weightScheme.acceptedByHuman)) {
    // Allow recommendation with unaccepted AI weights but label limitation
  }
  const scored = scoreOptions(decisionCase);
  const feasible = scored.filter((s) => s.hardConstraintViolations.length === 0);
  const preferred = feasible[0] ?? null;
  const uncertainties: UncertaintyLevel[] = [decisionCase.uncertainty];
  if (decisionCase.uncertainty === "conflicting_evidence") uncertainties.push("conflicting_evidence");

  const recommendation: DecisionRecommendation = {
    recommendationId: id(),
    preferredOptionId: preferred?.optionId ?? null,
    rankedOptionIds: scored.map((s) => s.optionId),
    optionsConsidered: decisionCase.options.map((o) => o.optionId),
    objectives: decisionCase.objectives.map((o) => o.key),
    constraints: decisionCase.constraints.map((c) => c.key),
    keyEvidenceIds: extras?.evidenceIds ?? decisionCase.evidenceIds,
    assumptionIds: decisionCase.assumptionIds,
    uncertainties,
    reason: preferred
      ? `Highest feasible weighted score under scheme ${decisionCase.weightScheme?.version ?? "default"}`
      : "No feasible option under hard constraints",
    limitations: [
      ...(extras?.limitations ?? []),
      "Weights may be subjective; not universal scientific truth",
      "Recommendation is not a human engineering decision",
      ...(decisionCase.weightScheme?.authority === "ai_recommendation" && !decisionCase.weightScheme.acceptedByHuman
        ? ["Weight scheme remains AI recommendation until human acceptance"]
        : []),
    ],
    evidenceClass: "RECOMMENDATION",
    stale: false,
    createdAt: now(),
  };

  return {
    ...decisionCase,
    recommendation,
    lifecycle: "READY_FOR_HUMAN_DECISION",
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      {
        action: "recommendation_generated",
        actorId: null,
        at: now(),
        detail: { preferredOptionId: recommendation.preferredOptionId },
      },
    ],
  };
}

export function recordHumanDecision(
  decisionCase: Eos3DecisionCase,
  input: {
    selectedOptionId: string;
    actorId: string;
    authorityRole: string;
    rationale: string;
    readOnly?: boolean;
  },
): Eos3DecisionCase {
  if (input.readOnly) throw new Error("read_only_cannot_finalize");
  if (input.actorId !== decisionCase.decisionOwnerId && input.authorityRole !== decisionCase.decisionAuthorityRole) {
    // allow matching authority role even if different actor when role matches decision authority
    if (input.authorityRole !== decisionCase.decisionAuthorityRole) {
      throw new Error("unauthorized_decision_actor");
    }
  }
  if (!decisionCase.options.some((o) => o.optionId === input.selectedOptionId)) {
    throw new Error("unknown_option");
  }
  if (decisionCase.humanDecision) throw new Error("decision_already_recorded");

  const humanDecision: HumanDecisionRecord = {
    decisionId: id(),
    selectedOptionId: input.selectedOptionId,
    actorId: input.actorId,
    authorityRole: input.authorityRole,
    rationale: input.rationale,
    date: now(),
    immutable: true,
  };

  return {
    ...decisionCase,
    humanDecision,
    lifecycle: "DECIDED",
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      {
        action: "human_decision_recorded",
        actorId: input.actorId,
        at: now(),
        detail: { selectedOptionId: input.selectedOptionId },
      },
    ],
  };
}

export function markDecisionStale(
  decisionCase: Eos3DecisionCase,
  reason: string,
): Eos3DecisionCase {
  // Historical human decision remains; recommendation marked stale.
  return {
    ...decisionCase,
    stale: true,
    staleReasons: [...decisionCase.staleReasons, reason],
    recommendation: decisionCase.recommendation
      ? { ...decisionCase.recommendation, stale: true }
      : null,
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      { action: "marked_stale", actorId: null, at: now(), detail: { reason } },
    ],
  };
}

export function supersedeDecisionCase(
  decisionCase: Eos3DecisionCase,
  newCaseId: string,
): Eos3DecisionCase {
  if (!decisionCase.humanDecision) throw new Error("only_decided_cases_supersede");
  return {
    ...decisionCase,
    lifecycle: "SUPERSEDED",
    supersededByCaseId: newCaseId,
    revision: decisionCase.revision + 1,
    updatedAt: now(),
    audit: [
      ...decisionCase.audit,
      { action: "superseded", actorId: null, at: now(), detail: { newCaseId } },
    ],
  };
}

export function invalidateAssumptionPropagation(
  decisionCase: Eos3DecisionCase,
  assumptionId: string,
): Eos3DecisionCase {
  if (!decisionCase.assumptionIds.includes(assumptionId)) return decisionCase;
  return markDecisionStale(decisionCase, `assumption_invalidated:${assumptionId}`);
}

export function authorizeDecisionAccess(
  caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
    readOnly?: boolean;
  },
  decisionCase: Eos3DecisionCase,
  action: "read" | "analyze" | "finalize",
): { allowed: boolean; reason?: string } {
  if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
  if (caller.tenantId !== decisionCase.tenantId) return { allowed: false, reason: "tenant_mismatch" };
  if (caller.workspaceId !== decisionCase.workspaceId) return { allowed: false, reason: "workspace_mismatch" };
  if (action === "finalize" && caller.readOnly) return { allowed: false, reason: "read_only" };
  return { allowed: true };
}

export function explainTradeoffs(decisionCase: Eos3DecisionCase): {
  dominatedOptionIds: string[];
  paretoOptionIds: string[];
  hardViolations: Record<string, string[]>;
  humanAuthorityRequired: true;
} {
  const scored = scoreOptions(decisionCase);
  return {
    dominatedOptionIds: scored.filter((s) => s.dominated).map((s) => s.optionId),
    paretoOptionIds: scored.filter((s) => !s.dominated).map((s) => s.optionId),
    hardViolations: Object.fromEntries(
      scored.filter((s) => s.hardConstraintViolations.length).map((s) => [s.optionId, s.hardConstraintViolations]),
    ),
    humanAuthorityRequired: true,
  };
}
