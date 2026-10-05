import type { EosGlobalProvenanceContract, StructuralObjectKind, StructuralStandardContextRef } from "@rtb/types";
import { STRUCTURAL_OBJECT_KINDS } from "@rtb/types";

export const STRUCTURAL_DOMAIN_PACKAGE_DECISION =
  "contracts in @rtb/types structural-domain.ts; D1A registry/guards in @rtb/engineering-os/src/structural-domain; no new package" as const;

export function listStructuralObjectKinds(): StructuralObjectKind[] {
  return [...STRUCTURAL_OBJECT_KINDS];
}

export function emptyStandardContext(jurisdictionProfile = "global-baseline"): StructuralStandardContextRef {
  return {
    jurisdictionProfile,
    standardProfile: "jurisdiction-selected",
    standardFamily: null,
    standardCode: null,
    edition: null,
    amendment: null,
    nationalAnnex: null,
    effectiveDate: null,
  };
}

export function governedProvenance(patch: Partial<EosGlobalProvenanceContract> = {}): EosGlobalProvenanceContract {
  return {
    sourceEvidence: patch.sourceEvidence ?? "human_input",
    sourceRevision: patch.sourceRevision ?? "0",
    model: patch.model ?? null,
    tool: patch.tool ?? null,
    solver: patch.solver ?? null,
    version: patch.version ?? "d1a",
    promptOrTemplate: patch.promptOrTemplate ?? null,
    timestamp: patch.timestamp ?? "2026-10-05T00:00:00.000Z",
    jurisdiction: patch.jurisdiction ?? "global-baseline",
    standard: patch.standard ?? null,
    calculationMethod: patch.calculationMethod ?? null,
    confidence: patch.confidence ?? null,
    validationState: patch.validationState ?? "unvalidated",
    humanReviewer: patch.humanReviewer ?? null,
    approvalState: patch.approvalState ?? "not_approved",
  };
}
