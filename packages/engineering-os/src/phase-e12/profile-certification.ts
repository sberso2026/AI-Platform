/**
 * Deployment profile certification matrix.
 */

import type { DeploymentProfile } from "../phase-e10/contracts";
import type { EngineeringProfileCertStatus } from "./contracts";
import { getEngineeringProfileContract } from "../phase-e10/profiles";
import { evaluateProfile, runProfileEvaluations } from "../phase-e11/profile-evaluation";
import { resolveCopilotFederation } from "../phase-e10/degradation";
import { EngineeringCopilotFederationBoundary } from "../phase-e4/contracts";

export type ProfileCapabilityCertRow = {
  profileId: DeploymentProfile;
  capability: string;
  status: EngineeringProfileCertStatus;
  note: string;
};

export function buildProfileCertificationMatrix(): {
  rows: ProfileCapabilityCertRow[];
  profileResults: ReturnType<typeof runProfileEvaluations>;
  passed: boolean;
} {
  const essential = getEngineeringProfileContract("ESSENTIAL");
  const professional = getEngineeringProfileContract("PROFESSIONAL");
  const enterprise = getEngineeringProfileContract("ENTERPRISE");
  const profileResults = runProfileEvaluations();

  const rows: ProfileCapabilityCertRow[] = [
    {
      profileId: "ESSENTIAL",
      capability: "zero_connectors",
      status: essential.connectorPolicy === "DISABLED" ? "CERTIFIED" : "NOT_CERTIFIED",
      note: "connectorPolicy=DISABLED",
    },
    {
      profileId: "ESSENTIAL",
      capability: "native_identity",
      status: essential.identityMode === "NATIVE" ? "CERTIFIED" : "NOT_CERTIFIED",
      note: "NATIVE identity mode",
    },
    {
      profileId: "ESSENTIAL",
      capability: "ask_retrieval_reasoning",
      status: evaluateProfile("ESSENTIAL").passed ? "CERTIFIED" : "NOT_CERTIFIED",
      note: "Native Ask path within E11 budgets",
    },
    {
      profileId: "ESSENTIAL",
      capability: "enterprise_dependency",
      status: "NOT_APPLICABLE",
      note: "No enterprise dependency required",
    },
    {
      profileId: "ESSENTIAL",
      capability: "sap_fabric_copilot",
      status: "NOT_APPLICABLE",
      note: "Not required for ESSENTIAL",
    },
    {
      profileId: "PROFESSIONAL",
      capability: "core_same_architecture",
      status: "CERTIFIED",
      note: "Same codebase as ESSENTIAL",
    },
    {
      profileId: "PROFESSIONAL",
      capability: "optional_connectors",
      status: professional.connectorPolicy === "OPTIONAL" ? "CONTRACT_READY" : "NOT_CERTIFIED",
      note: "Optional connectors — not live-certified adapters",
    },
    {
      profileId: "PROFESSIONAL",
      capability: "optional_intelligence",
      status: "CONTRACT_READY",
      note: "Selected intelligence packs entitled when installed",
    },
    {
      profileId: "PROFESSIONAL",
      capability: "graceful_degradation",
      status: evaluateProfile("PROFESSIONAL").optionalDegradesSafely
        ? "CERTIFIED"
        : "NOT_CERTIFIED",
      note: "Connector/intel outage → native Ask",
    },
    {
      profileId: "ENTERPRISE",
      capability: "same_core_architecture",
      status: "CERTIFIED",
      note: "No separate enterprise app fork",
    },
    {
      profileId: "ENTERPRISE",
      capability: "enterprise_identity",
      status: "CONTRACT_READY",
      note: "OIDC_SAML_READY / ENTRA abstraction — not live IdP certified here",
    },
    {
      profileId: "ENTERPRISE",
      capability: "connector_federation",
      status: "CONTRACT_READY",
      note: "Federation contracts; adapters not live-certified as enterprise SoR",
    },
    {
      profileId: "ENTERPRISE",
      capability: "advanced_governance",
      status: enterprise.governanceLevel === "ENTERPRISE" ? "CERTIFIED" : "NOT_CERTIFIED",
      note: "ENTERPRISE governanceLevel packaging",
    },
    {
      profileId: "ENTERPRISE",
      capability: "corporate_copilot_boundary",
      status:
        EngineeringCopilotFederationBoundary.microsoftCopilotRequired === false &&
        resolveCopilotFederation({
          profileId: "ENTERPRISE",
          entitled: false,
          enabledByAdmin: false,
        }).nativeAssistantRequiredFunctional
          ? "CONTRACT_READY"
          : "NOT_CERTIFIED",
      note: "Optional federation contract; native Ask required without Copilot",
    },
  ];

  const dishonestLiveClaim = rows.some(
    (r) =>
      r.status === "CERTIFIED" &&
      /live[- ]certified (adapter|integration|sor)/i.test(r.note),
  );
  const essentialOk = rows
    .filter((r) => r.profileId === "ESSENTIAL" && r.status !== "NOT_APPLICABLE")
    .every((r) => r.status === "CERTIFIED" || r.status === "CONTRACT_READY");

  return {
    rows,
    profileResults,
    passed: profileResults.allPassed && essentialOk && !dishonestLiveClaim,
  };
}
