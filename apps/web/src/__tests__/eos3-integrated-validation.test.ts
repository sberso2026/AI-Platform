import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { EOS3_AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-ai-policy";
import { runEos3StagingMigrationCoexistenceScenario } from "../lib/engineering/eos3-migration-staging";
import { runEos3StagingProjectAssetScenario } from "../lib/engineering/eos3-project-asset-staging";
import { runEos3IntegratedValidationScenario } from "../lib/engineering/eos3-integrated-staging";
import {
  EOS_3_PILOT_ACCESS_MODEL,
  SPACE_GASS_STATUS_EXACT,
  validateBaselinesPreserved,
} from "../lib/engineering/eos3-integrated-validation";
import { EOS_2_AUTO_MIGRATION_TO_EOS_3 } from "../lib/engineering/eos3-migration-engine";

describe("EOS 3.10 integrated validation", () => {
  it("preserves EOS 2 GA and EOS 3.1–3.9 baselines without Production activation", () => {
    const b = validateBaselinesPreserved();
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(EOS3_AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS_2_AUTO_MIGRATION_TO_EOS_3).toBe(false);
    expect(b.eos2Ga).toBe(true);
    expect(b.d1State).toBe(true);
    expect(b.externalSolver).toBe(true);
    expect(runEos3StagingProjectAssetScenario().handoverImmutable).toBe(true);
    expect(runEos3StagingMigrationCoexistenceScenario().fullMigration).toBe(true);
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

  it("runs integrated end-to-end staging validation with security, soak, and pilot readiness", () => {
    const r = runEos3IntegratedValidationScenario();

    expect(r.objectiveComplete).toBe(true);
    expect(r.datasetReady).toBe(true);
    expect(r.objectCount).toBeGreaterThanOrEqual(10);
    expect(r.relationshipCount).toBeGreaterThanOrEqual(5);
    expect(r.eventCount).toBeGreaterThan(0);
    expect(r.e2ePass).toBe(true);
    expect(r.digitalThread).toBe(true);
    expect(r.canonicalAuthority).toBe(true);
    expect(r.revisionIntegrity).toBe(true);
    expect(r.baselineImmutability).toBe(true);
    expect(r.knowledgeRetrieval).toBe(true);
    expect(r.knowledgeConflict).toBe(true);
    expect(r.abstention).toBe(true);
    expect(r.decisionIntelligence).toBe(true);
    expect(r.humanDecisionAuthority).toBe(true);
    expect(r.optimizationIntelligence).toBe(true);
    expect(r.optimizationDecisionSeparation).toBe(true);
    expect(r.workflowIntegrated).toBe(true);
    expect(r.eventArchitecture).toBe(true);
    expect(r.changePropagation).toBe(true);
    expect(r.solverFramework).toBe(true);
    expect(r.realConnectorStatus).toBe("NOT_EXECUTED");
    expect(r.spaceGassStatus).toBe(SPACE_GASS_STATUS_EXACT);
    expect(r.spaceGassGlobalQual).toBe(false);
    expect(r.aiOrchestration).toBe(true);
    expect(r.aiAuthorityBoundary).toBe(true);
    expect(r.aiSecurity).toBe(true);
    expect(r.multiAgent).toBe(true);
    expect(r.projectAssetThread).toBe(true);
    expect(r.handoverAuthority).toBe(true);
    expect(r.assetConfigHistory).toBe(true);
    expect(r.migrationIntegrated).toBe(true);
    expect(r.coexistence).toBe(true);
    expect(r.eos2SourceUnchanged).toBe(true);
    expect(r.rls).toBe(true);
    expect(r.crossWorkspaceLeakCount).toBe(0);
    expect(r.authorityMatrixPass).toBe(true);
    expect(r.apiBypass).toBe(true);
    expect(r.securityAttackMatrix).toBe(true);
    expect(r.soak.pass).toBe(true);
    expect(r.soak.operationCount).toBeGreaterThanOrEqual(50);
    expect(r.soak.failureCount).toBe(0);
    expect(r.concurrency.pass).toBe(true);
    expect(r.performanceStatus).toBe("READY_WITH_LIMITATIONS");
    expect(r.observability.securityDenial).toBe(true);
    expect(r.supportability.workspace).toBeTruthy();
    expect(r.applicationRollbackReady).toBe(true);
    expect(r.databaseRecoverability).toBe(true);
    expect(r.indexRebuildRecovery).toBe(true);
    expect(r.migrationRecovery).toBe(true);
    expect(r.killSwitch.eos3Denied).toBe(true);
    expect(r.killSwitch.eos2Isolation).toBe(true);
    expect(r.entitlementOk).toBe(true);
    expect(r.pilotAccessModel).toBe(EOS_3_PILOT_ACCESS_MODEL);
    expect(r.pilotEligibility.length).toBeGreaterThanOrEqual(5);
    expect(r.pilotScope.enabled.length).toBeGreaterThan(0);
    expect(r.pilotClaims.length).toBeGreaterThanOrEqual(10);
    expect(r.limitations.length).toBeGreaterThanOrEqual(15);
    expect(r.defectCounts.critical).toBe(0);
    expect(r.defectCounts.high).toBe(0);
    expect(r.d1State).toBe("PRESERVE_COMPATIBLE");
    expect(r.nonD1).toBe("NOT_QUALIFIED");
    expect(r.externalSolverGlobal).toBe(false);
    expect(r.technicalReadiness).toBe("READY_WITH_LIMITATIONS");
    expect(r.productionPilotHumanGo).toBe("NOT_ISSUED");
    expect(r.productionActivation).toBe(false);
    expect(r.productionEnabledWorkspaceCount).toBe(0);
    expect(r.productionAccess).toBe("DENIED");
    expect(r.productionDataWriteCount).toBe(0);
    expect(r.productionMigrationCount).toBe(0);
  });
});
