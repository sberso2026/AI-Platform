import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { EOS3_OBJECT_TYPES } from "../lib/engineering/eos3-canonical-objects";
import { EOS3_KNOWLEDGE_TIERS } from "../lib/engineering/eos3-knowledge-tiers";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import {
  AI_OPTIMIZATION_SELECTION_AUTHORITY,
  OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION,
} from "../lib/engineering/eos3-optimization-intelligence";
import { runEos3StagingDecisionOptimizationScenarios } from "../lib/engineering/eos3-decision-optimization-staging";
import { runEos3RetrievalEvaluationPack } from "../lib/engineering/eos3-retrieval-evaluation";

describe("EOS 3.4 decision and optimization intelligence", () => {
  it("preserves EOS 2 / 3.1–3.3 baselines and authority invariants", () => {
    expect(EOS3_VERSION).toBe("3.0.0");
    expect(EOS3_RELEASE_STATUS).toBe("GENERAL_AVAILABILITY");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(EOS3_OBJECT_TYPES.length).toBe(20);
    expect(EOS3_KNOWLEDGE_TIERS[0]).toContain("CANONICAL");
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(AI_OPTIMIZATION_SELECTION_AUTHORITY).toBe(false);
    expect(OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION).toBe(true);
    expect(
      evaluateEos3Access({
        authenticated: true,
        requestedProductKey: "eos-3",
        tenantId: "t",
        workspaceId: "w",
        record: null,
        enrollmentState: "DEVELOPMENT",
        productionEnvironment: true,
      }).reason,
    ).toBe("production_denied");
    // Retrieval regression smoke
    expect(runEos3RetrievalEvaluationPack().allPassed).toBe(true);
  });

  it("runs staging decision and optimization scenarios with required separations", () => {
    const r = runEos3StagingDecisionOptimizationScenarios();

    expect(r.decisionCase.lifecycle).toBe("DECIDED");
    expect(r.recommendationWithoutDecision.hasRecommendation).toBe(true);
    // Before human decision was recorded in scenario; after finalize humanDecision exists
    expect(r.decisionCase.humanDecision).toBeTruthy();
    expect(r.decisionCase.recommendation?.evidenceClass).toBe("RECOMMENDATION");
    expect(r.decisionCase.humanDecision?.immutable).toBe(true);

    expect(r.hardViolationDetected).toBe(true);
    expect(r.preferredIsNotC).toBe(true);
    expect(r.uncertaintyExposed).toBe(true);
    expect(r.humanDecisionImmutable).toBe(true);
    expect(r.decisionCase.stale).toBe(true);
    expect(r.decisionCase.recommendation?.stale).toBe(true);

    // Weight sensitivity: rankings can change with weights
    const topHuman = r.scoreHuman.filter((s) => s.hardConstraintViolations.length === 0)[0]?.optionId;
    const topCost = r.scoreCostHeavy.filter((s) => s.hardConstraintViolations.length === 0)[0]?.optionId;
    expect(topHuman).toBeTruthy();
    expect(topCost).toBeTruthy();
    // At least expose different score vectors
    expect(r.scoreHuman[0]!.score).not.toBe(r.scoreCostHeavy[0]!.score);

    expect(r.optimization.infeasibleRun.status).toBe("NO_FEASIBLE_SOLUTION");
    expect(r.optimization.reproducible).toBe(true);
    expect(r.optimization.aiSelectionDenied).toBe(true);
    expect(r.optimization.inheritsD1).toBe(false);
    expect(r.optimization.runSelected.humanSelectionCandidateId).toBeTruthy();
    expect(r.optimization.runSelected.linkedDecisionCaseId).toBe(r.decisionCase.caseId);
    expect(r.optimization.runSelected.qualificationState).toBe("NOT_QUALIFIED");

    expect(r.decisionTrace.requirementId).toBeTruthy();
    expect(r.decisionTrace.recommendationId).toBeTruthy();
    expect(r.decisionTrace.humanDecisionId).toBeTruthy();
    expect(r.decisionTrace.optimizationCandidateId).toBeTruthy();

    expect(r.security.foreignDecisionDenied).toBe(true);
    expect(r.security.readOnlyFinalizeDenied).toBe(true);
    expect(r.security.foreignOptDenied).toBe(true);
    expect(r.security.productionDenied).toBe(true);
    expect(r.security.crossWorkspaceDecisionLeaks).toBe(0);
    expect(r.security.crossWorkspaceOptimizationLeaks).toBe(0);
    expect(r.aiDecisionAuthority).toBe(false);
    expect(r.tradeoffs.humanAuthorityRequired).toBe(true);
    expect(r.performanceMs).toBeGreaterThanOrEqual(0);
    expect(r.beforeAcceptAiWeights.recommendation?.limitations.some((l) => /AI recommendation/i.test(l))).toBe(
      true,
    );
  });
});
