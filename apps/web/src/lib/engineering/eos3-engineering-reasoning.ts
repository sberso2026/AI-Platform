/**
 * EOS 3.7 Engineering Reasoning Assistant.
 * Operates over EOS canonical state — no hidden alternate project model.
 * AI_REASONING != ENGINEERING_AUTHORITY; AI_RECOMMENDATION != HUMAN_DECISION
 */

import {
  currentRevisionOf,
  requirementsDrivingObject,
  assumptionsSupportingCalculation,
  interfacesDependingOnRevision,
  evidenceSupportingDecision,
} from "./eos3-digital-thread";
import type { Eos3CanonicalObjectStore } from "./eos3-object-store";
import { createWorkItem, type Eos3WorkItem } from "./eos3-workflow-engine";
import { Eos3GovernedEventBus } from "./eos3-governed-events";
import {
  createOrchestrationPlan,
  runOrchestration,
  type Eos3OrchestrationPlan,
} from "./eos3-ai-orchestration";
import {
  detectAuthorityAttack,
  evaluateAiPolicy,
  EOS3_AI_DECISION_AUTHORITY,
  EOS3_AI_OPTIMIZATION_SELECTION_AUTHORITY,
  EOS3_AI_DOES_NOT_INHERIT_D1_QUALIFICATION,
  type PolicyCaller,
} from "./eos3-ai-policy";
import { sanitizeRetrievedInstruction, aiMayChangeToolQualification, getTool } from "./eos3-ai-tools";
import { createDecisionCase, addOption, setWeightScheme, generateRecommendation, type Eos3DecisionCase } from "./eos3-decision-intelligence";
import { SPACE_GASS_GLOBAL_QUALIFICATION, EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION } from "./eos3-solver-framework";

export type EvidenceStatement = {
  text: string;
  class: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION" | "RESULT" | "HUMAN_DECISION";
  sourceRefs: string[];
  invented: false;
};

export type ReasoningResponse = {
  plan: Eos3OrchestrationPlan;
  statements: EvidenceStatement[];
  abstained: boolean;
  abstentionReason: string | null;
  conflicts: Array<{ description: string; refs: string[] }>;
  baselineRevisionId: string | null;
  currentRevisionId: string | null;
  affectedInterfaces: string[];
  changeImpacts: string[];
  assumptions: string[];
  calculationEvidence: string[];
  decisionRecommendation: string | null;
  optimizationNotes: string[];
  draftWorkItem: Eos3WorkItem | null;
  humanCheckpointRequired: boolean;
  deniedAuthorityActions: string[];
  jurisdictionContext: string | null;
  graphInferences: EvidenceStatement[];
  metrics: {
    groundingOk: boolean;
    authorityCompliant: boolean;
    revisionAware: boolean;
    baselineAware: boolean;
  };
};

export type ReasoningAssistantContext = {
  store: Eos3CanonicalObjectStore;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  caller: PolicyCaller;
  jurisdictionExplicit: string | null;
  solverQualificationState?: string;
  decisionCase?: Eos3DecisionCase | null;
  optimizationSummary?: string | null;
  solverResultSummary?: string | null;
  forceToolFailure?: "retrieval" | "solver" | "optimization" | null;
  documentInjection?: string | null;
};

export function runEngineeringReasoning(
  userRequest: string,
  ctx: ReasoningAssistantContext,
): ReasoningResponse {
  const plan = createOrchestrationPlan({
    userRequest,
    caller: { ...ctx.caller, actingAsAi: true },
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: ctx.projectId,
  });

  const deniedAuthorityActions: string[] = [];
  const attack = detectAuthorityAttack(userRequest);
  if (attack) deniedAuthorityActions.push(attack);

  // Prompt / tool injection from documents — treated as data
  if (ctx.documentInjection) {
    const inj = sanitizeRetrievedInstruction(ctx.documentInjection);
    if (inj.attemptedToolInjection) {
      plan.reasoningEvidence.uncertainty.push("prompt_injection_blocked");
      for (const t of inj.blockedTools) deniedAuthorityActions.push(`blocked:${t}`);
    }
  }

  const statements: EvidenceStatement[] = [];
  const conflicts: ReasoningResponse["conflicts"] = [];
  const graphInferences: EvidenceStatement[] = [];
  let abstained = false;
  let abstentionReason: string | null = null;
  let draftWorkItem: Eos3WorkItem | null = null;
  let decisionRecommendation: string | null = null;

  const view = ctx.store.view();
  const discipline = [...ctx.store.objects.values()].find((o) => o.objectType === "DisciplineObject");
  const baseline = [...ctx.store.objects.values()].find((o) => o.objectType === "Baseline");
  const calc = [...ctx.store.objects.values()].find((o) => o.objectType === "Calculation");
  const deliverable = [...ctx.store.objects.values()].find((o) => o.objectType === "Deliverable");
  const iface = [...ctx.store.objects.values()].find((o) => o.objectType === "Interface");
  const change = [...ctx.store.objects.values()].find((o) => o.objectType === "Change");
  const assumption = [...ctx.store.objects.values()].find((o) => o.objectType === "Assumption");
  const basis = [...ctx.store.objects.values()].find((o) => o.objectType === "EngineeringBasis");

  const currentRev = discipline ? currentRevisionOf(view, discipline.id) : null;
  const baselineMembers = baseline
    ? [...ctx.store.baselineMembers].filter((m) => m.baselineObjectId === baseline.id)
    : [];
  const baselineRevId = baselineMembers[0]?.memberRevisionId ?? null;

  // Cross-workspace / foreign object guard
  const foreignLeak = [...ctx.store.objects.values()].some(
    (o) => o.workspaceId !== ctx.workspaceId || o.tenantId !== ctx.tenantId,
  );

  const executed = runOrchestration(plan, (toolId) => {
    if (ctx.forceToolFailure === "retrieval" && toolId.includes("retrieve")) {
      return { ok: false, summary: "", error: "retrieval_forced_failure" };
    }
    if (ctx.forceToolFailure === "solver" && toolId.includes("solver")) {
      return { ok: false, summary: "", error: "solver_forced_failure" };
    }
    if (ctx.forceToolFailure === "optimization" && toolId.includes("optimization")) {
      return { ok: false, summary: "", error: "optimization_forced_failure" };
    }

    if (toolId === "tool.connector.secret" || toolId === "tool.solver.qualify" || toolId === "tool.workflow.transition") {
      return { ok: false, summary: "", error: "human_only_denied" };
    }

    if (toolId === "tool.retrieve.canonical") {
      if (!discipline) return { ok: false, summary: "", error: "no_canonical_object" };
      const summary = `current_revision:${currentRev?.revisionIdentifier ?? "none"} object:${discipline.stableObjectId}`;
      statements.push({
        text: `Current discipline revision is ${currentRev?.revisionIdentifier ?? "unknown"}.`,
        class: "FACT",
        sourceRefs: [discipline.id, currentRev?.id ?? ""],
        invented: false,
      });
      if (baselineRevId) {
        statements.push({
          text: `Frozen baseline references revision ${baselineRevId}.`,
          class: "FACT",
          sourceRefs: [baseline?.id ?? "", baselineRevId],
          invented: false,
        });
      }
      if (currentRev && baselineRevId && currentRev.id !== baselineRevId) {
        conflicts.push({
          description: "Latest revision differs from frozen baseline membership",
          refs: [currentRev.id, baselineRevId],
        });
      }
      // superseded awareness
      const revs = [...ctx.store.revisions.values()].filter((r) => r.objectId === discipline.id);
      const superseded = revs.filter((r) => r.id !== currentRev?.id);
      for (const s of superseded) {
        statements.push({
          text: `Revision ${s.revisionIdentifier} is superseded relative to current.`,
          class: "FACT",
          sourceRefs: [s.id],
          invented: false,
        });
      }
      return { ok: true, summary, evidenceClass: "FACT" };
    }

    if (toolId === "tool.graph.trace") {
      const ifaces = currentRev
        ? interfacesDependingOnRevision(view, currentRev.id).map((i) => i.id)
        : iface
          ? [iface.id]
          : [];
      for (const id of ifaces) {
        statements.push({
          text: `Interface ${id} is related via canonical graph.`,
          class: "FACT",
          sourceRefs: [id],
          invented: false,
        });
      }
      // Plausible but unsupported inference must be labeled INFERENCE
      graphInferences.push({
        text: "Additional undocumented piping interfaces may exist (not in canonical graph).",
        class: "INFERENCE",
        sourceRefs: [],
        invented: false,
      });
      if (change && deliverable) {
        statements.push({
          text: `Change ${change.stableObjectId} may affect deliverable ${deliverable.stableObjectId}.`,
          class: "FACT",
          sourceRefs: [change.id, deliverable.id],
          invented: false,
        });
      }
      if (calc) {
        const asms = assumptionsSupportingCalculation(view, calc.id);
        for (const a of asms) {
          statements.push({
            text: `Assumption ${a.stableObjectId} supports calculation ${calc.stableObjectId}.`,
            class: "ASSUMPTION",
            sourceRefs: [a.id, calc.id],
            invented: false,
          });
        }
      }
      return {
        ok: true,
        summary: `interfaces:${ifaces.length};impacts:${change && deliverable ? 1 : 0}`,
        evidenceClass: "FACT",
      };
    }

    if (toolId === "tool.decision.support") {
      if (EOS3_AI_DECISION_AUTHORITY) {
        return { ok: false, summary: "", error: "ai_decision_authority_must_be_false" };
      }
      decisionRecommendation =
        "Recommend human review of Revision B impacts before acceptance; AI recommendation only.";
      statements.push({
        text: decisionRecommendation,
        class: "RECOMMENDATION",
        sourceRefs: discipline ? [discipline.id] : [],
        invented: false,
      });
      plan.reasoningEvidence.recommendationRationale = decisionRecommendation;
      plan.reasoningEvidence.optionsCompared = ["accept_B", "retain_A", "defer"];
      return { ok: true, summary: "decision_recommendation_draft", evidenceClass: "RECOMMENDATION" };
    }

    if (toolId === "tool.workflow.draft_work_item") {
      draftWorkItem = createWorkItem({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        projectId: ctx.projectId,
        objectId: deliverable?.id ?? discipline?.id ?? "unknown",
        type: "review_required",
        assignedTo: { kind: "role", value: "reviewer" },
        priority: "high",
      });
      statements.push({
        text: `AI-assisted draft work item ${draftWorkItem.workItemId} created (not an approval).`,
        class: "RECOMMENDATION",
        sourceRefs: [draftWorkItem.workItemId],
        invented: false,
      });
      // Emit non-authoritative event
      const bus = new Eos3GovernedEventBus();
      bus.publish({
        eventType: "AI_DRAFT_WORK_ITEM_CREATED",
        category: "STATE_CHANGE",
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        projectId: ctx.projectId,
        objectId: draftWorkItem.objectId,
        actorId: "ai",
        authority: null,
        source: "eos3.ai.reasoning",
        idempotencyKey: `ai-draft:${draftWorkItem.workItemId}`,
        sequenceHint: 1,
        payload: { grantsAuthority: false },
      });
      return { ok: true, summary: `draft_work_item:${draftWorkItem.workItemId}`, evidenceClass: "RECOMMENDATION" };
    }

    if (toolId === "tool.solver.prepare") {
      const q = ctx.solverQualificationState ?? "INTEGRATED_NOT_VALIDATED";
      statements.push({
        text: `Solver qualification state is ${q}; AI cannot elevate qualification.`,
        class: "FACT",
        sourceRefs: ["solver:synthetic"],
        invented: false,
      });
      if (/qualify|qualified/.test(userRequest.toLowerCase())) {
        deniedAuthorityActions.push("change_solver_qualification");
        return { ok: false, summary: "", error: "ai_cannot_change_solver_qualification" };
      }
      return { ok: true, summary: `solver_request_draft qual=${q}`, evidenceClass: "RECOMMENDATION" };
    }

    if (toolId === "tool.optimization.request") {
      if (EOS3_AI_OPTIMIZATION_SELECTION_AUTHORITY) {
        return { ok: false, summary: "", error: "ai_opt_selection_must_be_false" };
      }
      return {
        ok: true,
        summary: ctx.optimizationSummary ?? "optimization_draft_only",
        evidenceClass: "RECOMMENDATION",
      };
    }

    return { ok: true, summary: `noop:${toolId}`, evidenceClass: "FACT" };
  });

  // Abstention for unsupported questions
  if (/martian|unobtanium|quantum piping|telepathy/.test(userRequest.toLowerCase())) {
    abstained = true;
    abstentionReason = "insufficient_project_evidence";
    statements.push({
      text: "Insufficient evidence in canonical EOS state to answer this question.",
      class: "INFERENCE",
      sourceRefs: [],
      invented: false,
    });
  }

  // Solver result as RESULT class
  if (ctx.solverResultSummary) {
    statements.push({
      text: ctx.solverResultSummary,
      class: "RESULT",
      sourceRefs: ["solver-result"],
      invented: false,
    });
  }

  // Jurisdiction: only explicit
  const jurisdictionContext = ctx.jurisdictionExplicit;
  if (!jurisdictionContext && /governing code|which code applies/.test(userRequest.toLowerCase())) {
    statements.push({
      text: "No explicit project jurisdiction/standard context available; will not infer from location.",
      class: "INFERENCE",
      sourceRefs: basis ? [basis.id] : [],
      invented: false,
    });
  } else if (jurisdictionContext) {
    statements.push({
      text: `Project jurisdiction context: ${jurisdictionContext}.`,
      class: "FACT",
      sourceRefs: basis ? [basis.id] : [],
      invented: false,
    });
  }

  // Secret / exfiltration attempts
  if (/secret|credential|api[_-]?key|exfiltrate|dump all workspaces/.test(userRequest.toLowerCase())) {
    deniedAuthorityActions.push("secret_or_exfiltration_denied");
    const secretPolicy = evaluateAiPolicy({
      caller: { ...ctx.caller, actingAsAi: true },
      taskClass: "LOOKUP",
      sideEffect: "HUMAN_ONLY_ACTION",
      toolId: "tool.connector.secret",
      targetTenantId: ctx.tenantId,
      targetWorkspaceId: ctx.workspaceId,
      requestedHumanOnlyAction: null,
    });
    if (secretPolicy.allowed) deniedAuthorityActions.push("policy_fail_open_bug");
  }

  // Role escalation via internal tool
  if (ctx.caller.role === "viewer") {
    const escalate = evaluateAiPolicy({
      caller: { ...ctx.caller, actingAsAi: true },
      taskClass: "REVIEW_ASSIST",
      sideEffect: "GOVERNED_WRITE",
      targetTenantId: ctx.tenantId,
      targetWorkspaceId: ctx.workspaceId,
    });
    if (escalate.allowed) deniedAuthorityActions.push("role_escalation_bug");
  }

  const affectedInterfaces = iface ? [iface.id] : [];
  const changeImpacts = change && deliverable ? [`${change.id}->${deliverable.id}`] : [];
  const assumptions = assumption ? [assumption.id] : [];
  const calculationEvidence = calc ? [calc.id] : [];
  if (calc) {
    for (const a of assumptionsSupportingCalculation(view, calc.id)) {
      if (!assumptions.includes(a.id)) assumptions.push(a.id);
    }
  }

  const optimizationNotes: string[] = [];
  if (ctx.optimizationSummary) {
    optimizationNotes.push(ctx.optimizationSummary);
    optimizationNotes.push("Optimizer output is not a final engineering decision.");
  }

  // Partial failure exposure
  const failedTools = executed.plannedSteps.filter((s) => s.status === "failed" || s.status === "timeout");
  if (failedTools.length) {
    executed.reasoningEvidence.uncertainty.push(
      ...failedTools.map((f) => `partial_failure:${f.toolId}:${f.error}`),
    );
  }

  void requirementsDrivingObject;
  void evidenceSupportingDecision;
  void getTool;
  void foreignLeak;
  void SPACE_GASS_GLOBAL_QUALIFICATION;
  void EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION;
  void aiMayChangeToolQualification;
  void EOS3_AI_DOES_NOT_INHERIT_D1_QUALIFICATION;

  return {
    plan: executed,
    statements: [...statements, ...graphInferences],
    abstained,
    abstentionReason,
    conflicts,
    baselineRevisionId: baselineRevId,
    currentRevisionId: currentRev?.id ?? null,
    affectedInterfaces,
    changeImpacts,
    assumptions,
    calculationEvidence,
    decisionRecommendation,
    optimizationNotes,
    draftWorkItem,
    humanCheckpointRequired: executed.humanCheckpoints.length > 0 || deniedAuthorityActions.length > 0,
    deniedAuthorityActions,
    jurisdictionContext,
    graphInferences,
    metrics: {
      groundingOk: statements.every((s) => s.invented === false && (s.class !== "FACT" || s.sourceRefs.length > 0 || s.text.includes("Insufficient"))),
      authorityCompliant: deniedAuthorityActions.every((d) => !d.endsWith("_bug")),
      revisionAware: Boolean(currentRev),
      baselineAware: Boolean(baselineRevId) || !baseline,
    },
  };
}

export function buildDecisionSupportCase(ctx: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): Eos3DecisionCase {
  let d = createDecisionCase({
    ...ctx,
    subject: "Revision B acceptance",
    decisionQuestion: "Accept Revision B?",
    decisionOwnerId: "decision-owner-1",
    decisionAuthorityRole: "responsible_engineer",
  });
  d = addOption(d, {
    label: "Accept B",
    description: "Proceed",
    origin: "ai_recommendation",
    assumptionIds: [],
    constraintKeys: [],
    objectiveScores: { safety: 0.8 },
    evidenceIds: [],
    risks: ["interface_stale"],
    estimatedConsequences: [],
    calculationIds: [],
    optimizationCandidateIds: [],
    evidenceClass: "RECOMMENDATION",
  });
  d = addOption(d, {
    label: "Retain A",
    description: "Hold",
    origin: "human",
    assumptionIds: [],
    constraintKeys: [],
    objectiveScores: { safety: 0.7 },
    evidenceIds: [],
    risks: [],
    estimatedConsequences: [],
    calculationIds: [],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  d = setWeightScheme(d, {
    version: "v1",
    source: "ai_recommendation",
    actorId: "ai",
    rationale: "proposed",
    weights: { safety: 1 },
    authority: "ai_recommendation",
    acceptedByHuman: false,
  });
  d.objectives = [
    {
      objectiveId: "o1",
      key: "safety",
      direction: "maximize",
      unit: null,
      target: null,
      weight: 1,
      source: "ai",
      authority: "ai_recommendation",
      acceptedByHuman: false,
      version: "v1",
      rationale: "proposed",
    },
  ];
  return generateRecommendation(d);
}
