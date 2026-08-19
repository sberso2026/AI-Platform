import type { BusinessRiskContract } from "@rtb/types";
import {
  BUSINESS_CONTEXT_GRAPH_CONTRACT,
  businessContextGraphStatus,
} from "../context/extensions";

export const BUSINESS_RISK_CONTRACT: BusinessRiskContract = {
  capability: "business_risk",
  implemented: true,
  inputs: [
    "finance_evidence_refs",
    "growth_evidence_refs",
    "revenue_evidence_refs",
    "customer_evidence_refs",
    "profit_evidence_refs",
    "operations_evidence_refs",
    "decision_outcomes",
    "owner_actions",
    "signals",
    "kpis",
  ],
  reuses: [
    "business_os_signals",
    "business_os_recommendations",
    "business_os_kpis",
    "business_os_decisions",
    "business_os_actions",
  ],
  threatFocused: true,
  opportunityRiskDeferred: true,
  residualRequiresEvidencedControls: true,
  controlEffectivenessRequiresEvidence: true,
  treatmentsReuseBosActions: true,
  riskAcceptanceHumanOnly: true,
  noAutonomousRiskAcceptance: true,
  noStatutoryComplianceClaims: true,
  noLegalAdvice: true,
  noExternalRegulatorWrites: true,
  implementsOwnAiStack: false,
  note: "BOS-9 Business Risk. Residual risk does not improve merely because a control record exists. Compliant obligations require evidence and authorized confirmation. Not legal advice, certification, insurance underwriting, or a GRC suite. Opportunity-risk is deferred.",
};

export function businessRiskStatus() {
  return {
    available: true as const,
    reason: "business_risk_implemented" as const,
    contract: BUSINESS_RISK_CONTRACT.capability,
  };
}

export { BUSINESS_CONTEXT_GRAPH_CONTRACT, businessContextGraphStatus };
