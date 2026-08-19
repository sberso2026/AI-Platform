import { describe, expect, it } from "vitest";
import { createBusinessOS } from "../business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { BUSINESS_CONTEXT_GRAPH_CONTRACT, BUSINESS_RISK_CONTRACT } from "./extensions";
import { assessInherent } from "./assessment";
import { computeResidual } from "./residual";

describe("BOS-9 business risk service guards", () => {
  it("forbids autonomous acceptance, statutory claims, regulator writes, and legal advice", () => {
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.businessRisk).toBeDefined();
    expect(bos.businessRisk.contract()).toEqual(BUSINESS_RISK_CONTRACT);
    expect(bos.businessRisk.contract().implemented).toBe(true);
    expect(bos.businessRisk.contract().implementsOwnAiStack).toBe(false);
    expect(bos.businessRisk.contract().treatmentsReuseBosActions).toBe(true);
    expect(bos.businessRisk.status().available).toBe(true);
    expect(bos.businessRisk.businessContextGraph().available).toBe(false);
    expect(BUSINESS_CONTEXT_GRAPH_CONTRACT.implemented).toBe(false);
    expect(() => bos.businessRisk.acceptRiskAutonomously()).toThrow("autonomous_risk_acceptance_forbidden");
    expect(() => bos.businessRisk.declareStatutoryCompliance()).toThrow("statutory_compliance_claim_forbidden");
    expect(() => bos.businessRisk.writeExternalRegulator()).toThrow("external_regulator_write_forbidden");
    expect(() => bos.businessRisk.rewriteHistoricalEvidence()).toThrow("historical_evidence_rewrite_forbidden");
    expect(() => bos.businessRisk.provideLegalAdvice()).toThrow("legal_advice_forbidden");
    expect(bos.decisionAction.businessRisk().available).toBe(true);
  });

  it("preserves inherent/residual semantics across a lifecycle without a second task system", () => {
    const inherent = assessInherent("likely", "severe");
    expect(inherent.level).toBe("extreme");
    const afterRecordOnly = computeResidual(inherent.level, [
      { status: "planned", effectiveness: "untested", evidenceRefs: [] },
    ]);
    expect(afterRecordOnly.residualLevel).toBe("extreme");
    const afterEvidence = computeResidual(inherent.level, [
      {
        status: "operating",
        effectiveness: "effective",
        evidenceRefs: [{ sourceType: "document", sourceRef: "ctrl-test", title: "Test" }],
      },
    ]);
    expect(afterEvidence.residualLevel).toBe("high");
    expect(BUSINESS_RISK_CONTRACT.reuses).toContain("business_os_actions");
  });
});
