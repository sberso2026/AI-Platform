import type {
  EosAiCapabilityRecord,
  EosDisciplinePackDeclaration,
  EosEngineeringOutputClass,
  EosEngineeringStandardRecord,
  EosGlobalPolicyInheritance,
  EosGlobalProvenanceContract,
  EosJurisdictionProfile,
  EosRegionalDeploymentPolicy,
} from "@rtb/types";
import {
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_ENGINEERING_OUTPUT_CLASSES,
  EOS_EU_ONLY_ARCHITECTURE,
  EOS_GLOBAL_FIRST_ARCHITECTURE,
  EOS_GLOBAL_POLICY_INHERITANCE,
  EOS_HUMAN_AUTHORITY_ROLES,
  EOS_MACHINE_AUTHORITY_ROLES,
} from "@rtb/types";
import { EOS_DEFAULT_REGIONAL_DEPLOYMENT, EOS_JURISDICTION_PROFILES } from "./catalogs";

export const EOS_OUTPUT_TRANSITIONS: Record<EosEngineeringOutputClass, readonly EosEngineeringOutputClass[]> = {
  INFORMATIONAL: ["INFORMATIONAL", "AI_SUGGESTION", "ENGINEERING_FINDING"],
  AI_SUGGESTION: ["AI_SUGGESTION", "ENGINEERING_FINDING", "DESIGN_OPTION", "REVIEW_FINDING"],
  ENGINEERING_FINDING: ["ENGINEERING_FINDING", "REVIEW_FINDING", "DESIGN_OPTION"],
  DETERMINISTIC_RESULT: ["DETERMINISTIC_RESULT", "ENGINEERING_CALCULATION", "REVIEW_FINDING"],
  ENGINEERING_CALCULATION: ["ENGINEERING_CALCULATION", "REVIEW_FINDING"],
  DESIGN_OPTION: ["DESIGN_OPTION", "REVIEW_FINDING"],
  REVIEW_FINDING: ["REVIEW_FINDING", "APPROVED_ENGINEERING_OUTPUT"],
  APPROVED_ENGINEERING_OUTPUT: ["APPROVED_ENGINEERING_OUTPUT", "ISSUED_DELIVERABLE"],
  ISSUED_DELIVERABLE: ["ISSUED_DELIVERABLE"],
};

export function isEuOnlyArchitecture(): boolean {
  return EOS_EU_ONLY_ARCHITECTURE;
}

export function isGlobalFirstArchitecture(): boolean {
  return EOS_GLOBAL_FIRST_ARCHITECTURE && !EOS_EU_ONLY_ARCHITECTURE;
}

export function extendJurisdictionCatalog(
  extra: EosJurisdictionProfile,
  existing: readonly EosJurisdictionProfile[] = EOS_JURISDICTION_PROFILES,
): EosJurisdictionProfile[] {
  if (!extra.jurisdictionId?.trim()) throw new Error("jurisdictionId is required");
  if (existing.some((row) => row.jurisdictionId === extra.jurisdictionId)) {
    throw new Error(`jurisdiction ${extra.jurisdictionId} already registered`);
  }
  return [...existing, extra];
}

export function assertStandardJurisdictionConfigurable(record: EosEngineeringStandardRecord): void {
  if (!record.jurisdiction?.trim()) throw new Error("engineering standards must declare a jurisdiction profile");
  if (!record.standardFamily?.trim()) throw new Error("engineering standards must declare a family");
}

export function assertAiCapabilityRecord(record: EosAiCapabilityRecord): void {
  if (!record.intendedPurpose?.trim()) throw new Error("AI capability intendedPurpose is required");
  if (typeof record.humanOversightRequired !== "boolean") {
    throw new Error("AI capability humanOversightRequired is required");
  }
  if (record.autonomousActionAllowed !== false || EOS_AUTONOMOUS_ENGINEERING_APPROVAL !== false) {
    throw new Error("autonomous engineering approval is forbidden");
  }
  if (record.engineeringImpact !== "none" && record.humanOversightRequired !== true) {
    throw new Error("human oversight is required when engineering impact is present");
  }
}

export function assertHumanAuthoritySeparate(
  actor: (typeof EOS_HUMAN_AUTHORITY_ROLES)[number] | (typeof EOS_MACHINE_AUTHORITY_ROLES)[number],
): "human" | "machine" {
  if ((EOS_HUMAN_AUTHORITY_ROLES as readonly string[]).includes(actor)) return "human";
  if ((EOS_MACHINE_AUTHORITY_ROLES as readonly string[]).includes(actor)) return "machine";
  throw new Error("unknown authority role");
}

export function assertOutputTransition(from: EosEngineeringOutputClass, to: EosEngineeringOutputClass): void {
  if (!(EOS_ENGINEERING_OUTPUT_CLASSES as readonly string[]).includes(from)) throw new Error("unknown output class");
  if (!EOS_OUTPUT_TRANSITIONS[from].includes(to)) {
    throw new Error(`output class ${from} cannot become ${to} without governed workflow`);
  }
  if (from === "AI_SUGGESTION" && (to === "APPROVED_ENGINEERING_OUTPUT" || to === "ISSUED_DELIVERABLE")) {
    throw new Error("AI output cannot become approved engineering output without human review");
  }
}

export function createRegionalDeploymentPolicy(
  patch: Partial<EosRegionalDeploymentPolicy> = {},
): EosRegionalDeploymentPolicy {
  const policy = { ...EOS_DEFAULT_REGIONAL_DEPLOYMENT, ...patch };
  if (policy.requiredRegion === "eu-eea" && policy.allowedRegions.length === 1) {
    return policy;
  }
  if (policy.requiredRegion === "eu-eea" && !patch.allowedRegions) {
    throw new Error("EU hosting is optional and must not be implied as the global required region");
  }
  return policy;
}

export function inheritDisciplineGlobalPolicies(
  pack: EosDisciplinePackDeclaration,
): EosDisciplinePackDeclaration & { inheritedPolicies: readonly EosGlobalPolicyInheritance[] } {
  if (!pack.disciplineId?.trim()) throw new Error("disciplineId is required");
  return { ...pack, inheritedPolicies: EOS_GLOBAL_POLICY_INHERITANCE };
}

export function createProvenanceRecord(
  patch: Partial<EosGlobalProvenanceContract> & Pick<EosGlobalProvenanceContract, "timestamp" | "validationState" | "approvalState">,
): EosGlobalProvenanceContract {
  return {
    sourceEvidence: patch.sourceEvidence ?? null,
    sourceRevision: patch.sourceRevision ?? null,
    model: patch.model ?? null,
    tool: patch.tool ?? null,
    solver: patch.solver ?? null,
    version: patch.version ?? null,
    promptOrTemplate: patch.promptOrTemplate ?? null,
    timestamp: patch.timestamp,
    jurisdiction: patch.jurisdiction ?? null,
    standard: patch.standard ?? null,
    calculationMethod: patch.calculationMethod ?? null,
    confidence: patch.confidence ?? null,
    validationState: patch.validationState,
    humanReviewer: patch.humanReviewer ?? null,
    approvalState: patch.approvalState,
  };
}
