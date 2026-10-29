import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import { EOS3_EVENT_SCHEMA_VERSION } from "../lib/engineering/eos3-governed-events";
import { EOS3_WORKFLOW_DEFINITIONS } from "../lib/engineering/eos3-workflow-engine";
import { runEos3StagingGovernedWorkflowScenario } from "../lib/engineering/eos3-workflow-staging";
import {
  EOS3_CONNECTOR_CATEGORIES,
  EOS3_CONNECTOR_CAPABILITIES,
} from "../lib/engineering/eos3-integration-connectors";
import {
  EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
  EOS3_D1_MIGRATION_STATE,
  SPACE_GASS_GLOBAL_QUALIFICATION,
} from "../lib/engineering/eos3-solver-framework";
import { runEos3StagingIntegrationSolverScenario } from "../lib/engineering/eos3-integration-staging";

describe("EOS 3.6 integration and solver framework", () => {
  it("preserves baselines and qualification boundaries", () => {
    expect(EOS3_VERSION).toBe("3.0.0");
    expect(EOS3_RELEASE_STATUS).toBe("GENERAL_AVAILABILITY");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS3_EVENT_SCHEMA_VERSION).toBe("1.0.0");
    expect(EOS3_WORKFLOW_DEFINITIONS.length).toBeGreaterThan(0);
    expect(EOS3_CONNECTOR_CATEGORIES.length).toBe(10);
    expect(EOS3_CONNECTOR_CAPABILITIES.length).toBe(10);
    expect(EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION).toBe(false);
    expect(EOS3_D1_MIGRATION_STATE).toBe("PRESERVE_COMPATIBLE");
    expect(SPACE_GASS_GLOBAL_QUALIFICATION).toBe(false);
    expect(runEos3StagingGovernedWorkflowScenario().staleDeliverable).toBe(true);
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

  it("runs staging connector/solver scenarios with security controls", () => {
    const r = runEos3StagingIntegrationSolverScenario();

    expect(r.connectorSolverQualSeparation).toBe(true);
    expect(r.importIdempotent).toBe(true);
    expect(r.unauthorizedNotIndexed).toBe(true);
    expect(r.conflictVisible).toBe(true);
    expect(r.exportExternalAcceptanceImplied).toBe(true);
    expect(r.submissionIdempotent).toBe(true);
    expect(r.syntheticReproducible).toBe(true);
    expect(r.result.classification).toBe("RESULT");
    expect(r.jobState).toBe("COMPLETED");
    expect(r.calculationLinked).toBe(true);
    expect(r.failIngestDenied).toBe(true);
    expect(r.timeoutState).toBe("TIMED_OUT");
    expect(r.retryOk).toBe(true);
    expect(r.retryNoDupAuthoritative).toBe(true);
    expect(r.unqualifiedResult).toBe(true);
    expect(r.noD1Inherit).toBe(true);
    expect(r.versionMismatchRejected).toBe(true);
    expect(r.unitMismatchRejected).toBe(true);
    expect(r.tamperRejected).toBe(true);
    expect(r.pathTraversalTest).toBe(true);
    expect(r.commandInjectionTest).toBe(true);
    expect(r.foreignConnDenied).toBe(true);
    expect(r.foreignJobDenied).toBe(true);
    expect(r.credAccessDenied).toBe(true);
    expect(r.aiCredBoundary).toBe(true);
    expect(r.apiBypassDenied).toBe(true);
    expect(r.aiEnableDenied).toBe(true);
    expect(r.aiQualDenied).toBe(true);
    expect(r.aiSolverQualAuthority).toBe(false);
    expect(r.logSafe.token).toBe("[REDACTED]");
    expect(r.decisionNotAutoFinalized).toBe(true);
    expect(r.optSource).toBe("external_solver");
    expect(r.dmsBoundary).toBe(true);
    expect(r.externalSolverGlobalQual).toBe(false);
    expect(r.spaceGassGlobalQual).toBe(false);
    expect(r.dupProtect.duplicate).toBe(true);
    expect(r.replayDupStatus).toBe("SUPPRESSED_DUPLICATE");
    expect(r.performanceMs).toBeGreaterThanOrEqual(0);
    expect(r.recoverability.auditPresent).toBe(true);
  });
});
