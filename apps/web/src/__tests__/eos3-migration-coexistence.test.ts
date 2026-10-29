import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access, eos2EntitlementAutoEnablesEos3, eos2EnrollmentAutoEnablesEos3 } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "../lib/engineering/eos3-digital-thread";
import { EOS3_AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-ai-policy";
import { runEos3StagingProjectAssetScenario } from "../lib/engineering/eos3-project-asset-staging";
import { runEos3StagingMigrationCoexistenceScenario } from "../lib/engineering/eos3-migration-staging";
import { EOS_2_AUTO_MIGRATION_TO_EOS_3, AI_MIGRATION_AUTHORITY } from "../lib/engineering/eos3-migration-engine";

describe("EOS 3.9 migration and EOS 2 coexistence", () => {
  it("preserves baselines and no-auto-migration invariants", () => {
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(EOS3_AI_DECISION_AUTHORITY).toBe(false);
    expect(EOS_2_AUTO_MIGRATION_TO_EOS_3).toBe(false);
    expect(AI_MIGRATION_AUTHORITY).toBe(false);
    expect(eos2EntitlementAutoEnablesEos3("eos-2")).toBe(false);
    expect(eos2EnrollmentAutoEnablesEos3(true)).toBe(false);
    expect(runEos3StagingProjectAssetScenario().handoverImmutable).toBe(true);
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

  it("runs staging migration/coexistence scenario with security controls", () => {
    const r = runEos3StagingMigrationCoexistenceScenario();

    expect(r.datasetReady).toBe(true);
    expect(r.eligible).toBe(true);
    expect(r.ineligible).toBe(true);
    expect(r.unauthorizedDenied).toBe(true);
    expect(r.aiDenied).toBe(true);
    expect(r.fullMigration).toBe(true);
    expect(r.sourceObjectCount).toBe(r.targetObjectCount);
    expect(r.sourceRelationshipCount).toBe(r.targetRelationshipCount);
    expect(r.sourceImmutable).toBe(true);
    expect(r.duplicateSafe).toBe(true);
    expect(r.digitalThreadOk).toBe(true);
    expect(r.qualificationOk).toBe(true);
    expect(r.authorityOk).toBe(true);
    expect(r.rlsOk).toBe(true);
    expect(r.crossWorkspaceLeakCount).toBe(0);
    expect(r.roleEscalationDenied).toBe(true);
    expect(r.prodGuardDenied).toBe(true);
    expect(r.productionMigrationCount).toBe(0);
    expect(r.driftBlocked).toBe(true);
    expect(r.failureHandled).toBe(true);
    expect(r.wrongGenDenied).toBe(true);
    expect(r.rollbackOk).toBe(true);
    expect(r.sourceHashUnchangedAfterRollback).toBe(true);
    expect(r.remigrationOk).toBe(true);
    expect(r.mappingValidated).toBe(true);
    expect(r.matrix.allPassed).toBe(true);
    expect(r.routingEos2).toBe(true);
    expect(r.routingEos3).toBe(true);
    expect(r.knowledgeIsolation).toBe(true);
    expect(r.legacyDefault).toBe(true);
    expect(r.evidenceFingerprint).toBe(true);
    expect(r.assetBaselinePreserved).toBe(true);
  });
});
