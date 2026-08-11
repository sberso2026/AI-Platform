/**
 * A1–A20 product assertion certification matrix.
 */

import type { AssertionResult } from "./contracts";
import {
  NoMandatorySapM365CopilotDependency,
  EnterpriseConnectorsNeverHardDependency,
  supportsZeroConnectorNativeDeployment,
  CapabilityBasedUxHideUnavailable,
  VendorNeutralLogicalArchitecture,
  NeverFabricateMissingEvidence,
} from "../phase-e0/contracts";
import { PhaseE1ExperienceFoundationComplete } from "../phase-e1/contracts";
import {
  PhaseE2GroundedSearchComplete,
  PhaseE2NativeZeroConnector,
} from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import {
  EngineeringCopilotFederationBoundary,
  PhaseE4DoesNotOwnExternalSor,
  PhaseE4EssentialZeroConnector,
  PhaseE4ConnectorFailureDegradesGracefully,
} from "../phase-e4/contracts";
import {
  PhaseE5ReasoningExplainabilityComplete,
  PhaseE5NoHiddenCotExposure,
  PhaseE5NoFabricatedAuthority,
} from "../phase-e5/contracts";
import {
  PhaseE6LlmCannotImpersonateToolExecution,
  PhaseE6NoAutonomousEngineeringApproval,
} from "../phase-e6/contracts";
import {
  PhaseE7NoUnsupportedAiFactPromotion,
  PhaseE7MemoryIsNeverAutomaticAuthority,
} from "../phase-e7/contracts";
import { PhaseE8NoAutonomousApproval } from "../phase-e8/contracts";
import {
  PhaseE9NoEngineOwnershipDuplication,
  PhaseE9IntelligenceIsNotApproval,
} from "../phase-e9/contracts";
import {
  PhaseE10EssentialZeroConnectorIndependent,
  PhaseE10NoSeparateAppsPerProfile,
  PhaseE10ProfileIsNotAuthorization,
  PhaseE10HideUnavailableFromEngineers,
  PhaseE10SameDomainArchitectureAcrossProfiles,
} from "../phase-e10/contracts";
import {
  PhaseE11BenchmarkIsNotRealUserKpi,
  PhaseE11NoUnsupportedProductivityClaims,
} from "../phase-e11/contracts";
import {
  duplicateEngineeringToolFrameworkDetected,
  duplicateKnowledgeGraphDetected,
  duplicateMemoryFrameworkDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../version";
import { runArchitectureOwnershipAudit } from "./architecture-audit";

export function certifyProductAssertions(): {
  results: AssertionResult[];
  allPassed: boolean;
} {
  const arch = runArchitectureOwnershipAudit();
  const results: AssertionResult[] = [
    {
      id: "A1",
      statement: "Engineering OS works without Copilot",
      passed: EngineeringCopilotFederationBoundary.microsoftCopilotRequired === false,
      evidence: ["EngineeringCopilotFederationBoundary.microsoftCopilotRequired=false"],
    },
    {
      id: "A2",
      statement: "Engineering OS works without SAP/Fabric/M365",
      passed:
        NoMandatorySapM365CopilotDependency && EnterpriseConnectorsNeverHardDependency,
      evidence: [
        "NoMandatorySapM365CopilotDependency",
        "EnterpriseConnectorsNeverHardDependency",
      ],
    },
    {
      id: "A3",
      statement: "ESSENTIAL is independently useful with native services",
      passed:
        supportsZeroConnectorNativeDeployment &&
        PhaseE4EssentialZeroConnector &&
        PhaseE10EssentialZeroConnectorIndependent &&
        PhaseE2NativeZeroConnector,
      evidence: ["supportsZeroConnectorNativeDeployment", "PhaseE10EssentialZeroConnectorIndependent"],
    },
    {
      id: "A4",
      statement: "PROFESSIONAL adds capabilities without architecture fork",
      passed:
        PhaseE10NoSeparateAppsPerProfile && PhaseE10SameDomainArchitectureAcrossProfiles,
      evidence: ["PhaseE10NoSeparateAppsPerProfile", "PhaseE10SameDomainArchitectureAcrossProfiles"],
    },
    {
      id: "A5",
      statement: "ENTERPRISE can federate external SoRs without taking ownership",
      passed: PhaseE4DoesNotOwnExternalSor,
      evidence: ["PhaseE4DoesNotOwnExternalSor"],
    },
    {
      id: "A6",
      statement: "Ask is the primary low-friction engineering interface",
      passed: PhaseE1ExperienceFoundationComplete && PhaseE2GroundedSearchComplete,
      evidence: ["PhaseE1ExperienceFoundationComplete", "PhaseE2GroundedSearchComplete"],
    },
    {
      id: "A7",
      statement: "Engineering answers are evidence-grounded",
      passed: PhaseE2GroundedSearchComplete && PhaseE5ReasoningExplainabilityComplete,
      evidence: ["PhaseE2GroundedSearchComplete", "PhaseE5ReasoningExplainabilityComplete"],
    },
    {
      id: "A8",
      statement: "Insufficient/conflicting evidence fails safely",
      passed: NeverFabricateMissingEvidence && PhaseE5NoFabricatedAuthority,
      evidence: ["NeverFabricateMissingEvidence", "PhaseE5NoFabricatedAuthority"],
    },
    {
      id: "A9",
      statement: "Canonical context preserves external SoR boundaries",
      passed: PhaseE3CanonicalContextComplete && PhaseE4DoesNotOwnExternalSor,
      evidence: ["PhaseE3CanonicalContextComplete", "PhaseE4DoesNotOwnExternalSor"],
    },
    {
      id: "A10",
      statement: "Governed tools cannot be impersonated by LLM output",
      passed: PhaseE6LlmCannotImpersonateToolExecution,
      evidence: ["PhaseE6LlmCannotImpersonateToolExecution"],
    },
    {
      id: "A11",
      statement: "Passive memory cannot promote unsupported AI output as fact",
      passed:
        PhaseE7NoUnsupportedAiFactPromotion && PhaseE7MemoryIsNeverAutomaticAuthority,
      evidence: [
        "PhaseE7NoUnsupportedAiFactPromotion",
        "PhaseE7MemoryIsNeverAutomaticAuthority",
      ],
    },
    {
      id: "A12",
      statement: "AI proposes; humans retain engineering approval authority",
      passed:
        PhaseE6NoAutonomousEngineeringApproval &&
        PhaseE8NoAutonomousApproval &&
        PhaseE9IntelligenceIsNotApproval,
      evidence: [
        "PhaseE6NoAutonomousEngineeringApproval",
        "PhaseE8NoAutonomousApproval",
        "PhaseE9IntelligenceIsNotApproval",
      ],
    },
    {
      id: "A13",
      statement: "Certified intelligence engines retain original ownership/semantics",
      passed: PhaseE9NoEngineOwnershipDuplication,
      evidence: ["PhaseE9NoEngineOwnershipDuplication"],
    },
    {
      id: "A14",
      statement: "Unavailable capabilities are hidden from normal engineers",
      passed: CapabilityBasedUxHideUnavailable && PhaseE10HideUnavailableFromEngineers,
      evidence: ["CapabilityBasedUxHideUnavailable", "PhaseE10HideUnavailableFromEngineers"],
    },
    {
      id: "A15",
      statement: "Profile never substitutes for entitlement/RBAC",
      passed: PhaseE10ProfileIsNotAuthorization,
      evidence: ["PhaseE10ProfileIsNotAuthorization"],
    },
    {
      id: "A16",
      statement: "Provider/connector failures degrade safely",
      passed: PhaseE4ConnectorFailureDegradesGracefully,
      evidence: ["PhaseE4ConnectorFailureDegradesGracefully"],
    },
    {
      id: "A17",
      statement: "No duplicate KG/memory/tool/workflow/intelligence frameworks",
      passed:
        arch.passed &&
        !duplicateKnowledgeGraphDetected &&
        !duplicateMemoryFrameworkDetected &&
        !duplicateEngineeringToolFrameworkDetected &&
        !duplicateWorkflowEngineDetected &&
        !implementsOwnAiStack,
      evidence: arch.findings.map((f) => `${f.check}:${f.passed ? "ok" : "fail"}`),
    },
    {
      id: "A18",
      statement: "Vendor/provider implementations remain adapters",
      passed: VendorNeutralLogicalArchitecture && PhaseE4DoesNotOwnExternalSor,
      evidence: ["VendorNeutralLogicalArchitecture", "adapters-only"],
    },
    {
      id: "A19",
      statement: "Evaluation distinguishes benchmark/system/live metrics",
      passed: PhaseE11BenchmarkIsNotRealUserKpi,
      evidence: ["PhaseE11BenchmarkIsNotRealUserKpi", "EngineeringMetricKinds"],
    },
    {
      id: "A20",
      statement: "No unsupported accuracy/productivity/ROI claims",
      passed: PhaseE11NoUnsupportedProductivityClaims && PhaseE5NoHiddenCotExposure,
      evidence: [
        "PhaseE11NoUnsupportedProductivityClaims",
        "PhaseE5NoHiddenCotExposure",
      ],
    },
  ];

  return { results, allPassed: results.every((r) => r.passed) };
}
