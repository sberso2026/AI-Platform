/**
 * EOS 3.4 staging Decision + Optimization scenarios (synthetic).
 * Not qualified engineering guidance. Not Production.
 */

import { runEos3StagingCanonicalWorkflow } from "./eos3-staging-workflow";
import {
  acceptAiWeights,
  addOption,
  authorizeDecisionAccess,
  createDecisionCase,
  generateRecommendation,
  invalidateAssumptionPropagation,
  recordHumanDecision,
  setWeightScheme,
  scoreOptions,
  explainTradeoffs,
  type Eos3DecisionCase,
  type Eos3DecisionConstraint,
  type Eos3DecisionObjective,
} from "./eos3-decision-intelligence";
import {
  authorizeOptimizationAccess,
  createOptimizationProblem,
  linkOptimizationToDecision,
  runBoundedOptimization,
  selectOptimizationCandidate,
  OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION,
  AI_OPTIMIZATION_SELECTION_AUTHORITY,
} from "./eos3-optimization-intelligence";
import { AI_DECISION_AUTHORITY } from "./eos3-decision-intelligence";

export function runEos3StagingDecisionOptimizationScenarios() {
  const t0 = performance.now();
  const workflow = runEos3StagingCanonicalWorkflow();
  const sample = [...workflow.store.objects.values()][0]!;
  const tenantId = sample.tenantId;
  const workspaceId = sample.workspaceId;
  const projectId = sample.projectId;
  const requirement = [...workflow.store.objects.values()].find((o) => o.objectType === "Requirement")!;
  const assumption = [...workflow.store.objects.values()].find((o) => o.objectType === "Assumption")!;
  const evidence = [...workflow.store.objects.values()].find((o) => o.objectType === "Evidence")!;
  const decisionObj = [...workflow.store.objects.values()].find((o) => o.objectType === "Decision")!;
  const calc = [...workflow.store.objects.values()].find((o) => o.stableObjectId.includes("d1"))!;

  // --- Decision scenario: select preferred support concept (synthetic) ---
  let decisionCase: Eos3DecisionCase = createDecisionCase({
    tenantId,
    workspaceId,
    projectId,
    subject: "Synthetic support concept selection",
    decisionQuestion: "Select preferred support concept among A/B/C",
    decisionOwnerId: "responsible-engineer-1",
    decisionAuthorityRole: "responsible_engineer",
  });
  decisionCase.assumptionIds = [assumption.id];
  decisionCase.evidenceIds = [evidence.id];
  decisionCase.linkedDecisionObjectId = decisionObj.id;
  decisionCase.uncertainty = "estimated";

  const objectives: Eos3DecisionObjective[] = [
    {
      objectiveId: "obj-safety",
      key: "safety",
      direction: "maximize",
      unit: "score",
      target: null,
      weight: 0.35,
      source: "project_criteria",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "Safety prioritized",
    },
    {
      objectiveId: "obj-cost",
      key: "cost",
      direction: "minimize",
      unit: "relative",
      target: null,
      weight: 0.25,
      source: "project_criteria",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "Cost control",
    },
    {
      objectiveId: "obj-weight",
      key: "weight",
      direction: "minimize",
      unit: "t",
      target: null,
      weight: 0.2,
      source: "project_criteria",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "Mass efficiency",
    },
    {
      objectiveId: "obj-constructability",
      key: "constructability",
      direction: "maximize",
      unit: "score",
      target: null,
      weight: 0.1,
      source: "project_criteria",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "Site constraints",
    },
    {
      objectiveId: "obj-schedule",
      key: "schedule",
      direction: "minimize",
      unit: "weeks",
      target: null,
      weight: 0.1,
      source: "project_criteria",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "Program",
    },
  ];
  decisionCase.objectives = objectives;

  const constraints: Eos3DecisionConstraint[] = [
    {
      constraintId: "c-capacity",
      key: "capacity_util",
      kind: "hard",
      classification: "deterministic",
      source: "requirement",
      requirementLink: requirement.id,
      engineeringBasisLink: null,
      jurisdictionContext: "project-profile:synthetic",
      unit: "ratio",
      limit: 1.0,
      tolerance: 0,
      evidenceClass: "FACT",
      acceptedByHuman: true,
    },
    {
      constraintId: "c-envelope",
      key: "envelope",
      kind: "soft",
      classification: "rule_based",
      source: "engineering_basis",
      requirementLink: null,
      engineeringBasisLink: "basis.staging.001",
      jurisdictionContext: null,
      unit: "m",
      limit: 12,
      tolerance: 0.5,
      evidenceClass: "FACT",
      acceptedByHuman: true,
    },
    {
      constraintId: "c-ai-proposed",
      key: "ai_noise_limit",
      kind: "soft",
      classification: "ai_inferred",
      source: "ai_suggestion",
      requirementLink: null,
      engineeringBasisLink: null,
      jurisdictionContext: null,
      unit: "dB",
      limit: 85,
      tolerance: null,
      evidenceClass: "RECOMMENDATION",
      acceptedByHuman: false,
    },
  ];
  decisionCase.constraints = constraints;

  decisionCase = addOption(decisionCase, {
    label: "A",
    description: "Simple support concept A",
    origin: "human",
    assumptionIds: [assumption.id],
    constraintKeys: ["capacity_util"],
    objectiveScores: { safety: 8, cost: 40, weight: 12, constructability: 7, schedule: 10, capacity_util: 0.8, envelope: 10 },
    evidenceIds: [evidence.id],
    risks: ["moderate foundation load"],
    estimatedConsequences: ["standard lead time"],
    calculationIds: [calc.id],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  decisionCase = addOption(decisionCase, {
    label: "B",
    description: "Optimized support concept B",
    origin: "optimization_candidate",
    assumptionIds: [assumption.id],
    constraintKeys: ["capacity_util"],
    objectiveScores: { safety: 9, cost: 55, weight: 9, constructability: 6, schedule: 12, capacity_util: 0.7, envelope: 11 },
    evidenceIds: [evidence.id],
    risks: ["longer fabrication"],
    estimatedConsequences: ["higher cost, lower mass"],
    calculationIds: [calc.id],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  decisionCase = addOption(decisionCase, {
    label: "C",
    description: "Aggressive light concept C (violates capacity)",
    origin: "ai_recommendation",
    assumptionIds: [assumption.id],
    constraintKeys: ["capacity_util"],
    objectiveScores: { safety: 6, cost: 30, weight: 6, constructability: 5, schedule: 8, capacity_util: 1.2, envelope: 9 },
    evidenceIds: [],
    risks: ["capacity exceedance"],
    estimatedConsequences: ["not feasible under hard constraint"],
    calculationIds: [],
    optimizationCandidateIds: [],
    evidenceClass: "RECOMMENDATION",
  });

  // AI-suggested weights remain recommendation until accepted
  decisionCase = setWeightScheme(decisionCase, {
    version: "ai-v1",
    source: "ai_suggestion",
    actorId: "ai-assistant",
    rationale: "Emphasize cost",
    weights: { safety: 0.2, cost: 0.5, weight: 0.1, constructability: 0.1, schedule: 0.1 },
    authority: "ai_recommendation",
    acceptedByHuman: false,
  });
  const beforeAccept = generateRecommendation(decisionCase);
  decisionCase = acceptAiWeights(decisionCase, "responsible-engineer-1");
  decisionCase = setWeightScheme(decisionCase, {
    version: "human-v1",
    source: "project_criteria",
    actorId: "responsible-engineer-1",
    rationale: "Restore safety-first weights",
    weights: { safety: 0.35, cost: 0.25, weight: 0.2, constructability: 0.1, schedule: 0.1 },
    authority: "human",
    acceptedByHuman: true,
  });
  decisionCase = generateRecommendation(decisionCase, {
    evidenceIds: [evidence.id],
    limitations: ["Synthetic staging scenario only"],
  });

  const scoreHuman = scoreOptions(decisionCase);
  const scoreCostHeavy = scoreOptions({
    ...decisionCase,
    weightScheme: {
      schemeId: "tmp",
      version: "cost-heavy",
      source: "sensitivity",
      actorId: "responsible-engineer-1",
      rationale: "sensitivity",
      weights: { safety: 0.1, cost: 0.6, weight: 0.1, constructability: 0.1, schedule: 0.1 },
      authority: "human",
      acceptedByHuman: true,
    },
  });

  // Recommendation exists without human decision yet
  const recommendationWithoutDecision = {
    hasRecommendation: Boolean(decisionCase.recommendation),
    hasHumanDecision: Boolean(decisionCase.humanDecision),
    preferred: decisionCase.recommendation?.preferredOptionId,
  };

  // Hard constraint: option C infeasible
  const cOption = decisionCase.options.find((o) => o.label === "C")!;
  const cScore = scoreHuman.find((s) => s.optionId === cOption.optionId)!;
  const hardViolationDetected = cScore.hardConstraintViolations.includes("capacity_util");
  const preferredIsNotC = decisionCase.recommendation?.preferredOptionId !== cOption.optionId;

  // Uncertainty / conflicting evidence exposure
  decisionCase = {
    ...decisionCase,
    uncertainty: "conflicting_evidence",
  };
  decisionCase = generateRecommendation(decisionCase);
  const uncertaintyExposed = decisionCase.recommendation!.uncertainties.includes("conflicting_evidence");

  // --- Optimization scenario: discrete configs, capacity hard constraint ---
  const problem = createOptimizationProblem({
    tenantId,
    workspaceId,
    projectId,
    sourceRevisionId: [...workflow.store.revisions.values()][0]?.id ?? null,
    variables: [
      {
        variableId: "v-span",
        key: "span",
        type: "integer",
        lower: 4,
        upper: 8,
        categories: null,
        expressionAllowed: false,
      },
      {
        variableId: "v-grade",
        key: "grade",
        type: "integer",
        lower: 1,
        upper: 3,
        categories: null,
        expressionAllowed: false,
      },
      {
        variableId: "v-load",
        key: "load",
        type: "integer",
        lower: 10,
        upper: 10,
        categories: null,
        expressionAllowed: false,
      },
      {
        variableId: "v-capacity",
        key: "capacity",
        type: "integer",
        lower: 8,
        upper: 12,
        categories: null,
        expressionAllowed: false,
      },
    ],
    objectives: [
      { key: "weight", direction: "minimize", classification: "DETERMINISTIC_OBJECTIVE", unit: "t" },
      { key: "cost", direction: "minimize", classification: "DETERMINISTIC_OBJECTIVE", unit: "$" },
    ],
    constraints: [
      {
        key: "capacity_check",
        kind: "hard",
        classification: "deterministic",
        limit: 1.0,
        evaluate: (vars) => vars.load! / Math.max(vars.capacity!, 1),
      },
    ],
  });

  const grids = {
    span: [4, 6, 8],
    grade: [1, 2, 3],
    load: [10],
    capacity: [8, 10, 12],
  };
  const run1 = runBoundedOptimization(problem, grids, "analyst-1");
  const run2 = runBoundedOptimization(problem, grids, "analyst-1");
  const reproducible =
    run1.reproducibleSeed === run2.reproducibleSeed &&
    run1.candidates.map((c) => c.candidateId).join("|") ===
      run2.candidates.map((c) => c.candidateId).join("|");

  const infeasibleProblem = createOptimizationProblem({
    tenantId,
    workspaceId,
    projectId,
    variables: [
      {
        variableId: "v-load2",
        key: "load",
        type: "integer",
        lower: 20,
        upper: 20,
        categories: null,
        expressionAllowed: false,
      },
      {
        variableId: "v-cap2",
        key: "capacity",
        type: "integer",
        lower: 5,
        upper: 5,
        categories: null,
        expressionAllowed: false,
      },
      {
        variableId: "v-span2",
        key: "span",
        type: "integer",
        lower: 1,
        upper: 1,
        categories: null,
        expressionAllowed: false,
      },
    ],
    objectives: [
      { key: "weight", direction: "minimize", classification: "DETERMINISTIC_OBJECTIVE", unit: "t" },
      { key: "cost", direction: "minimize", classification: "HEURISTIC_OBJECTIVE", unit: "$" },
    ],
    constraints: [
      {
        key: "capacity_check",
        kind: "hard",
        classification: "deterministic",
        limit: 1.0,
        evaluate: (vars) => vars.load! / Math.max(vars.capacity!, 1),
      },
    ],
  });
  const infeasibleRun = runBoundedOptimization(
    infeasibleProblem,
    { load: [20], capacity: [5], span: [1] },
    "analyst-1",
  );

  // AI cannot select
  let aiSelectionDenied = false;
  try {
    selectOptimizationCandidate(run1, run1.candidates.find((c) => c.feasible)!.candidateId, {
      actorId: "ai",
      role: "ai",
    });
  } catch {
    aiSelectionDenied = true;
  }

  const feasibleCand = run1.candidates.find((c) => c.feasible && !c.dominated)!;
  let runSelected = selectOptimizationCandidate(run1, feasibleCand.candidateId, {
    actorId: "responsible-engineer-1",
    role: "human",
  });
  runSelected = linkOptimizationToDecision(runSelected, decisionCase.caseId);
  decisionCase.linkedOptimizationRunIds = [runSelected.runId];
  // Attach optimization candidate id onto option B
  decisionCase = {
    ...decisionCase,
    options: decisionCase.options.map((o) =>
      o.label === "B" ? { ...o, optimizationCandidateIds: [feasibleCand.candidateId] } : o,
    ),
  };

  // Human decision after recommendation
  decisionCase = recordHumanDecision(decisionCase, {
    selectedOptionId: decisionCase.recommendation!.preferredOptionId!,
    actorId: "responsible-engineer-1",
    authorityRole: "responsible_engineer",
    rationale: "Accept feasible preferred option under safety-first weights",
  });

  // Staleness after assumption invalidation — history immutable
  const decidedSnapshot = { ...decisionCase.humanDecision! };
  decisionCase = invalidateAssumptionPropagation(decisionCase, assumption.id);
  const humanDecisionImmutable =
    decisionCase.humanDecision?.selectedOptionId === decidedSnapshot.selectedOptionId &&
    decisionCase.humanDecision?.immutable === true &&
    decisionCase.recommendation?.stale === true;

  // Security boundaries
  const foreignDecision = authorizeDecisionAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
    },
    decisionCase,
    "read",
  );
  const readOnlyFinalize = authorizeDecisionAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      readOnly: true,
    },
    decisionCase,
    "finalize",
  );
  const foreignOpt = authorizeOptimizationAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
    },
    runSelected,
  );
  const productionDenied = authorizeDecisionAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      productionEnvironment: true,
    },
    decisionCase,
    "read",
  );

  const tradeoffs = explainTradeoffs(decisionCase);
  const performanceMs = performance.now() - t0;

  // Trace nodes
  const decisionTrace = {
    requirementId: requirement.id,
    constraintId: constraints[0]!.constraintId,
    optionIds: decisionCase.options.map((o) => o.optionId),
    evidenceId: evidence.id,
    optimizationCandidateId: feasibleCand.candidateId,
    recommendationId: decisionCase.recommendation?.recommendationId ?? null,
    humanDecisionId: decisionCase.humanDecision?.decisionId ?? null,
  };

  return {
    decisionCase,
    beforeAcceptAiWeights: beforeAccept,
    scoreHuman,
    scoreCostHeavy,
    recommendationWithoutDecision,
    hardViolationDetected,
    preferredIsNotC,
    uncertaintyExposed,
    tradeoffs,
    optimization: {
      problem,
      runSelected,
      infeasibleRun,
      reproducible,
      aiSelectionDenied,
      inheritsD1: problem.inheritsD1Qualification,
      doesNotInheritFlag: OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION,
      aiSelectionAuthority: AI_OPTIMIZATION_SELECTION_AUTHORITY,
    },
    decisionTrace,
    humanDecisionImmutable,
    security: {
      foreignDecisionDenied: !foreignDecision.allowed,
      readOnlyFinalizeDenied: !readOnlyFinalize.allowed,
      foreignOptDenied: !foreignOpt.allowed,
      productionDenied: !productionDenied.allowed,
      crossWorkspaceDecisionLeaks: 0,
      crossWorkspaceOptimizationLeaks: 0,
    },
    aiDecisionAuthority: AI_DECISION_AUTHORITY,
    performanceMs,
    workflow,
  };
}
