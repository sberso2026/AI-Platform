import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { EOS3_OBJECT_TYPES } from "../lib/engineering/eos3-canonical-objects";
import { EOS3_KNOWLEDGE_TIERS } from "../lib/engineering/eos3-knowledge-tiers";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import { OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION } from "../lib/engineering/eos3-optimization-intelligence";
import { runEos3RetrievalEvaluationPack } from "../lib/engineering/eos3-retrieval-evaluation";
import { runEos3StagingDecisionOptimizationScenarios } from "../lib/engineering/eos3-decision-optimization-staging";
import { EOS3_EVENT_CATEGORIES, EOS3_EVENT_SCHEMA_VERSION } from "../lib/engineering/eos3-governed-events";
import { EOS3_WORKFLOW_DEFINITIONS } from "../lib/engineering/eos3-workflow-engine";
import { runEos3StagingGovernedWorkflowScenario } from "../lib/engineering/eos3-workflow-staging";

describe("EOS 3.5 governed workflow and event architecture", () => {
  it("preserves EOS 2 / 3.1–3.4 baselines", () => {
    expect(EOS3_VERSION).toBe("3.0.0");
    expect(EOS3_RELEASE_STATUS).toBe("GENERAL_AVAILABILITY");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(EOS3_OBJECT_TYPES.length).toBe(19);
    expect(EOS3_KNOWLEDGE_TIERS.length).toBe(5);
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION).toBe(true);
    expect(EOS3_EVENT_SCHEMA_VERSION).toBe("1.0.0");
    expect(EOS3_EVENT_CATEGORIES.length).toBe(12);
    expect(EOS3_WORKFLOW_DEFINITIONS.every((d) => d.version)).toBe(true);
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
    expect(runEos3RetrievalEvaluationPack().allPassed).toBe(true);
    expect(runEos3StagingDecisionOptimizationScenarios().decisionCase.lifecycle).toBe("DECIDED");
  });

  it("runs staging governed workflow/event scenario with security controls", () => {
    const r = runEos3StagingGovernedWorkflowScenario();

    expect(r.dup.status).toBe("SUPPRESSED_DUPLICATE");
    expect(r.older.status).toBe("REJECTED_OUT_OF_ORDER");
    expect(r.staleDeliverable).toBe(true);
    expect(r.workItems.some((w) => w.type === "review_required")).toBe(true);
    expect(r.workItemCompletionGrantsApproval).toBe(false);

    expect(r.aiInterfaceDenied).toBe(true);
    expect(r.aiReleaseDenied).toBe(true);
    expect(r.aiDecideDenied).toBe(true);
    expect(r.aiFreezeDenied).toBe(true);
    expect(r.roleEscalationDenied).toBe(true);
    expect(r.humanCheckpointBlocking).toBe(true);
    expect(r.decisionStaleWorkflow).toBe(true);
    expect(r.optDoesNotDecide).toBe(true);
    expect(r.postFreezeImmutable).toBe(true);
    expect(r.frozenNewState).toBe("FROZEN");
    expect(r.cycleDetected).toBe(true);
    expect(r.failureVisible).toBe(true);
    expect(r.replay.createdApproval).toBe(false);
    expect(r.replay.bypassedAuthority).toBe(false);

    expect(r.foreignDenied).toBe(true);
    expect(r.untrustedInjectDenied).toBe(true);
    expect(r.directBypassDenied).toBe(true);

    expect(r.causationTrace.length).toBeGreaterThan(1);
    expect(r.retrievalInvalidations.length).toBeGreaterThan(0);
    expect(r.observability.duplicatesSuppressed).toBeGreaterThan(0);
    expect(r.observability.deadLetters).toBeGreaterThan(0);
    expect(r.instances.interface.currentState).toBe("ACCEPTED");
    expect(r.instances.review.currentState).toBe("ACCEPTED");
    expect(r.instances.optimization.currentState).toBe("COMPLETED");
    expect(r.performanceMs).toBeGreaterThanOrEqual(0);
  });
});
