import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import { EOS3_EVENT_SCHEMA_VERSION } from "../lib/engineering/eos3-governed-events";
import { EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION } from "../lib/engineering/eos3-solver-framework";
import { runEos3StagingGovernedWorkflowScenario } from "../lib/engineering/eos3-workflow-staging";
import { runEos3StagingIntegrationSolverScenario } from "../lib/engineering/eos3-integration-staging";
import { EOS3_AI_TOOL_REGISTRY } from "../lib/engineering/eos3-ai-tools";
import { EOS3_BOUNDED_AGENTS } from "../lib/engineering/eos3-ai-orchestration";
import { EOS3_AI_TASK_CLASSES, EOS3_AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-ai-policy";
import { runEos3EngineeringReasoningEvaluationPack } from "../lib/engineering/eos3-ai-reasoning-evaluation";

describe("EOS 3.7 AI orchestration and engineering reasoning", () => {
  it("preserves 3.1–3.6 baselines and AI authority boundaries", () => {
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS3_AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS3_EVENT_SCHEMA_VERSION).toBe("1.0.0");
    expect(EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION).toBe(false);
    expect(EOS3_AI_TASK_CLASSES.includes("LOOKUP" as never)).toBe(true);
    expect((EOS3_AI_TASK_CLASSES as readonly string[]).includes("APPROVE")).toBe(false);
    expect(EOS3_AI_TOOL_REGISTRY.length).toBeGreaterThan(8);
    expect(EOS3_BOUNDED_AGENTS.length).toBeGreaterThanOrEqual(5);
    expect(runEos3StagingGovernedWorkflowScenario().staleDeliverable).toBe(true);
    expect(runEos3StagingIntegrationSolverScenario().result.classification).toBe("RESULT");
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
  });

  it("passes engineering reasoning evaluation pack and security controls", () => {
    const pack = runEos3EngineeringReasoningEvaluationPack();
    expect(pack.failed, JSON.stringify(pack.cases.filter((c) => !c.pass))).toEqual([]);
    expect(pack.allPassed).toBe(true);
    expect(pack.goldenSetSize).toBeGreaterThanOrEqual(8);
    expect(pack.metrics.crossWorkspaceLeakage).toBe(0);
    expect(pack.metrics.authorityCompliance).toBe(1);
    expect(pack.staging.finalDecisionDenied).toBe(true);
    expect(pack.staging.approvalDenied).toBe(true);
    expect(pack.staging.solverQualDenied).toBe(true);
    expect(pack.staging.abstain.abstained).toBe(true);
    expect(pack.staging.boundAborted).toBe(true);
    expect(pack.staging.injectionBlocked).toBe(true);
    expect(pack.staging.foreignDenied).toBe(true);
    expect(pack.staging.secretDenied).toBe(true);
    expect(pack.staging.policyRepro).toBe(true);
    expect(pack.staging.draftWorkItem).toBeTruthy();
    expect(pack.staging.reasoningTrace.taskClass).toBeTruthy();
    expect(pack.staging.noD1Inherit).toBe(true);
  });
});
