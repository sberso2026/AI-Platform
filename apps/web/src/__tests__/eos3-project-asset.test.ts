import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import { EOS3_EVENT_SCHEMA_VERSION } from "../lib/engineering/eos3-governed-events";
import { EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION, EOS3_D1_MIGRATION_STATE } from "../lib/engineering/eos3-solver-framework";
import { EOS3_AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-ai-policy";
import { runEos3EngineeringReasoningEvaluationPack } from "../lib/engineering/eos3-ai-reasoning-evaluation";
import { runEos3StagingProjectAssetScenario } from "../lib/engineering/eos3-project-asset-staging";

describe("EOS 3.8 project-to-asset digital thread", () => {
  it("preserves 3.1–3.7 baselines", () => {
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS3_AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS3_EVENT_SCHEMA_VERSION).toBe("1.0.0");
    expect(EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION).toBe(false);
    expect(EOS3_D1_MIGRATION_STATE).toBe("PRESERVE_COMPATIBLE");
    expect(runEos3EngineeringReasoningEvaluationPack().allPassed).toBe(true);
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

  it("runs staging project-asset lifecycle with security controls", () => {
    const r = runEos3StagingProjectAssetScenario();

    expect(r.identityStable).toBe(true);
    expect(r.mappingCount).toBe(10);
    expect(r.incompleteReadiness.ready).toBe(false);
    expect(r.incompleteReadiness.missing.length).toBeGreaterThan(0);
    expect(r.incompleteReadiness.isAcceptance).toBe(false);
    expect(r.ready.ready).toBe(true);
    expect(r.aiHandoverDenied).toBe(true);
    expect(r.unauthorizedHandoverDenied).toBe(true);
    expect(r.handoverImmutable).toBe(true);
    expect(r.baselineUnchanged).toBe(true);
    expect(r.asBuiltDiffers).toBe(true);
    expect(r.configHistoryPreserved).toBe(true);
    expect(r.currentVsHandover).toBe(true);
    expect(r.inspectionTrace).toBe(true);
    expect(r.findingLinked).toBe(true);
    expect(r.changeCandidate).toBe(true);
    expect(r.aiDisposeDenied).toBe(true);
    expect(r.unauthorizedCfgDenied).toBe(true);
    expect(r.modLoop).toBe(true);
    expect(r.assumptionInvalidation).toBe(true);
    expect(r.assetStateUnchangedByAssumption).toBe(true);
    expect(r.decisionHistory).toBe(true);
    expect(r.fullThreadOk).toBe(true);
    expect(r.foreignDenied).toBe(true);
    expect(r.crossWorkspaceLeakCount).toBe(0);
    expect(r.aiReasoningOk).toBe(true);
    expect(r.aiApprovalDenied).toBe(true);
    expect(r.aiBoundaries.acceptHandover).toBe(false);
    expect(r.aiBoundaries.certify).toBe(false);
    expect(r.boundaries.historian).toBe(true);
    expect(r.boundaries.dms).toBe(true);
    expect(r.residualOutstandingVisible).toBe(true);
    expect(r.performanceMs).toBeGreaterThanOrEqual(0);
    expect(r.observability.handoverTransitions).toBeGreaterThan(0);
  });
});
