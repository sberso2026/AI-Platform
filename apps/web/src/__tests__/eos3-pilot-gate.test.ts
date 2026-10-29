import { describe, expect, it } from "vitest";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";
import { runEos3IntegratedValidationScenario } from "../lib/engineering/eos3-integrated-staging";
import {
  EOS_3_10_BASELINE,
  EOS_3_APPROVED_PRODUCTION_MIGRATIONS,
  EOS_3_LIVE_LLM_PILOT_STATUS,
  EOS_3_PILOT_CANDIDATE_COMMIT,
  EXPECTED_PRODUCTION_LEDGER_AFTER_EOS_3_PILOT_MIGRATIONS,
  PRODUCTION_EOS_2_LEDGER_PRE_GATE,
  runEos3ProductionPilotGate,
  verifyEos310Baseline,
} from "../lib/engineering/eos3-pilot-gate";

describe("EOS 3.11 Production Pilot Gate", () => {
  it("verifies EOS 3.10 baseline and preserves EOS 2 GA / Production deny", () => {
    expect(verifyEos310Baseline(EOS_3_10_BASELINE)).toBe(true);
    expect(EOS3_VERSION).toBe("3.0.0-development");
    expect(EOS3_RELEASE_STATUS).toBe("DEVELOPMENT");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(EOS_3_PILOT_CANDIDATE_COMMIT).toBe("c89f106af689a2e79c81a30d0a8420803e632220");
    expect(EOS_3_APPROVED_PRODUCTION_MIGRATIONS).toHaveLength(9);
    expect(PRODUCTION_EOS_2_LEDGER_PRE_GATE).toBe(161);
    expect(EXPECTED_PRODUCTION_LEDGER_AFTER_EOS_3_PILOT_MIGRATIONS).toBe(170);
    const integrated = runEos3IntegratedValidationScenario();
    expect(integrated.defectCounts.critical).toBe(0);
    expect(integrated.defectCounts.high).toBe(0);
    expect(integrated.crossWorkspaceLeakCount).toBe(0);
    expect(integrated.soak.operationCount).toBe(111);
    expect(integrated.soak.failureCount).toBe(0);
    expect(
      evaluateEos3Access({
        authenticated: true,
        requestedProductKey: "eos-3",
        tenantId: "t",
        workspaceId: "w",
        record: {
          productKey: "eos-3",
          tenantId: "t",
          workspaceId: "w",
          status: "active",
          grantSource: "INTERNAL_DEVELOPMENT",
          validFrom: "2026-01-01",
          validUntil: null,
        },
        enrollmentState: "DEVELOPMENT",
        productionEnvironment: true,
      }).reason,
    ).toBe("production_denied");
    expect(
      evaluateEos3Access({
        authenticated: true,
        requestedProductKey: "eos-3",
        tenantId: "t",
        workspaceId: "w",
        record: {
          productKey: "eos-3",
          tenantId: "t",
          workspaceId: "w",
          status: "active",
          grantSource: "INTERNAL_VALIDATION",
          validFrom: "2026-01-01",
          validUntil: null,
        },
        enrollmentState: "PILOT",
        productionEnvironment: true,
      }).allowed,
    ).toBe(true);
  });

  it("freezes pilot gate without activation or human GO", () => {
    const g = runEos3ProductionPilotGate();
    expect(g.baselineOk).toBe(true);
    expect(g.fingerprint.startsWith("sha256:")).toBe(true);
    expect(g.fingerprint.length).toBeGreaterThan(70);
    expect(g.migrationCount).toBe(9);
    expect(g.migrationsOrdered).toBe(true);
    expect(g.migrationPreflight).toBe(true);
    expect(g.liveLlmStatus).toBe(EOS_3_LIVE_LLM_PILOT_STATUS);
    expect(g.scope.live_llm).toBe("DISABLED");
    expect(g.scope.real_third_party_connectors).toBe("DISABLED");
    expect(g.scope.migration).toBe("DISABLED");
    expect(g.allMediumPilotSafe).toBe(true);
    expect(g.mediumReviews).toHaveLength(2);
    expect(g.defectGate).toBe("PASS");
    expect(g.killSwitchReady).toBe(true);
    expect(g.killSwitchEos2Isolation).toBe(true);
    expect(g.initialWorkspaceCount).toBe(1);
    expect(g.projectStrategy).toBe("NEW_EOS3_PILOT_PROJECT");
    expect(g.autoMigration).toBe(false);
    expect(g.externalCustomerAuthorized).toBe(false);
    expect(g.releaseAuthorityDesignated).toBe(false);
    expect(g.humanGo).toBe("NOT_ISSUED");
    expect(g.activationPerformed).toBe(false);
    expect(g.productionChangeCount).toBe(0);
    expect(g.productionMigrationCount).toBe(0);
    expect(g.technicalGate).toBe("READY_WITH_LIMITATIONS");
    expect(g.releaseDecision).toBe("TECHNICALLY_READY_PENDING_HUMAN_GO");
    expect(g.aiEngineeringAuthority).toBe(false);
    expect(g.aiFinalDecision).toBe(false);
    expect(g.aiMigration).toBe(false);
    expect(g.spaceGassClaimAccurate).toBe(true);
    expect(g.preMigrationBackupRequired).toBe(true);
  });
});
