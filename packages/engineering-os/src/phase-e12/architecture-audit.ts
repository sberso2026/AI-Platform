/**
 * Architecture / ownership duplication audit for E12 certification.
 */

import {
  duplicateAssetOwnershipDetected,
  duplicateEngineeringToolFrameworkDetected,
  duplicateKnowledgeGraphDetected,
  duplicateMemoryFrameworkDetected,
  duplicateProjectOwnershipDetected,
  duplicateSpatialOwnershipDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
  privateCrossModuleCouplingDetected,
} from "../version";
import { PhaseE2NoSecondAssistantStack } from "../phase-e2/contracts";
import { PhaseE6NoSecondToolRegistry, PhaseE6ReusesPlatformToolRegistry } from "../phase-e6/contracts";
import {
  PhaseE7NoSecondKnowledgeGraph,
  PhaseE7NoSecondMemoryStore,
  PhaseE7ReusesPlatformMemory,
} from "../phase-e7/contracts";
import {
  PhaseE8NoSecondWorkflowFramework,
  PhaseE8ReusesPlatformWorkflowEngine,
} from "../phase-e8/contracts";
import {
  PhaseE9NoEngineOwnershipDuplication,
  PhaseE9NoSecondIntelligenceRegistry,
} from "../phase-e9/contracts";
import {
  PhaseE4DoesNotOwnExternalSor,
  PhaseE4NoVendorHardDependency,
} from "../phase-e4/contracts";
import {
  NoMandatorySapM365CopilotDependency,
  VendorNeutralLogicalArchitecture,
} from "../phase-e0/contracts";

export type ArchitectureAuditFinding = {
  check: string;
  duplicateDetected: boolean;
  intentionalUnderCertifiedOwnership: boolean;
  passed: boolean;
  detail: string;
};

export function runArchitectureOwnershipAudit(): {
  findings: ArchitectureAuditFinding[];
  passed: boolean;
} {
  const findings: ArchitectureAuditFinding[] = [
    {
      check: "duplicate_assistant_stack",
      duplicateDetected: Boolean(implementsOwnAiStack) || !PhaseE2NoSecondAssistantStack,
      intentionalUnderCertifiedOwnership: false,
      passed: !implementsOwnAiStack && PhaseE2NoSecondAssistantStack,
      detail: "Ask composes platform AI runtime; implementsOwnAiStack=false",
    },
    {
      check: "duplicate_kg",
      duplicateDetected: duplicateKnowledgeGraphDetected || !PhaseE7NoSecondKnowledgeGraph,
      intentionalUnderCertifiedOwnership: false,
      passed: !duplicateKnowledgeGraphDetected && PhaseE7NoSecondKnowledgeGraph,
      detail: "Platform KG ownership preserved",
    },
    {
      check: "duplicate_memory_store",
      duplicateDetected: duplicateMemoryFrameworkDetected || !PhaseE7NoSecondMemoryStore,
      intentionalUnderCertifiedOwnership: false,
      passed:
        !duplicateMemoryFrameworkDetected &&
        PhaseE7NoSecondMemoryStore &&
        PhaseE7ReusesPlatformMemory,
      detail: "Platform Kernel Memory ownership preserved",
    },
    {
      check: "duplicate_tool_registry",
      duplicateDetected:
        duplicateEngineeringToolFrameworkDetected || !PhaseE6NoSecondToolRegistry,
      intentionalUnderCertifiedOwnership: false,
      passed:
        !duplicateEngineeringToolFrameworkDetected &&
        PhaseE6NoSecondToolRegistry &&
        PhaseE6ReusesPlatformToolRegistry,
      detail: "Platform Intelligence Tool Registry reused",
    },
    {
      check: "duplicate_workflow_engine",
      duplicateDetected: duplicateWorkflowEngineDetected || !PhaseE8NoSecondWorkflowFramework,
      intentionalUnderCertifiedOwnership: false,
      passed:
        !duplicateWorkflowEngineDetected &&
        PhaseE8NoSecondWorkflowFramework &&
        PhaseE8ReusesPlatformWorkflowEngine,
      detail: "Platform Workflow/Event Bus ownership preserved",
    },
    {
      check: "duplicate_intelligence_registry_engine",
      duplicateDetected:
        !PhaseE9NoSecondIntelligenceRegistry || !PhaseE9NoEngineOwnershipDuplication,
      intentionalUnderCertifiedOwnership: false,
      passed: PhaseE9NoSecondIntelligenceRegistry && PhaseE9NoEngineOwnershipDuplication,
      detail: "PI/AI/II/PC engines retain ownership; E9 routes only",
    },
    {
      check: "provider_specific_domain_coupling",
      duplicateDetected: !VendorNeutralLogicalArchitecture || !PhaseE4NoVendorHardDependency,
      intentionalUnderCertifiedOwnership: false,
      passed:
        VendorNeutralLogicalArchitecture &&
        PhaseE4NoVendorHardDependency &&
        NoMandatorySapM365CopilotDependency &&
        !privateCrossModuleCouplingDetected,
      detail: "Domain contracts vendor-neutral; adapters only",
    },
    {
      check: "external_sor_ownership_leakage",
      duplicateDetected: !PhaseE4DoesNotOwnExternalSor,
      intentionalUnderCertifiedOwnership: false,
      passed: PhaseE4DoesNotOwnExternalSor,
      detail: "Connectors never take external SoR ownership",
    },
    {
      check: "duplicate_shared_domain_ownership",
      duplicateDetected:
        duplicateAssetOwnershipDetected ||
        duplicateProjectOwnershipDetected ||
        duplicateSpatialOwnershipDetected,
      intentionalUnderCertifiedOwnership: false,
      passed:
        !duplicateAssetOwnershipDetected &&
        !duplicateProjectOwnershipDetected &&
        !duplicateSpatialOwnershipDetected,
      detail: "Shared asset/project/spatial ownership flags clean",
    },
  ];

  return {
    findings,
    passed: findings.every((f) => f.passed && !f.duplicateDetected),
  };
}
