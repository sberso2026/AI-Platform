import type { SteelHumanRuleConfirmation, StructuralStandardContext } from "@rtb/types";
import {
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  SILENT_STANDARD_EDITION_INFERENCE,
} from "@rtb/types";
import { assertGovernedStandardContext, nationalAnnexRequired } from "../../structural-domain/binding";
import { governedProvenance } from "../../structural-domain/catalog";

export const AU_STEEL_PROFILE_ID = "au-steel-as4100-intended" as const;
export const AU_STEEL_NATIONAL_ANNEX = "NOT_APPLICABLE" as const;

export function createAuSteelStandardProfile(input?: {
  contextId?: string;
  edition?: string;
  amendment?: string;
  confirmation?: SteelHumanRuleConfirmation | null;
}): StructuralStandardContext {
  if (SILENT_STANDARD_EDITION_INFERENCE) throw new Error("standard edition must not be inferred silently");
  const confirmedEdition = input?.confirmation?.edition?.trim() || null;
  const confirmedAmendment = input?.confirmation?.amendment?.trim() || null;
  const edition = input?.edition?.trim() || confirmedEdition || AU_STEEL_UNKNOWN_STANDARD_TOKEN;
  const amendment = input?.amendment?.trim() || confirmedAmendment || AU_STEEL_UNKNOWN_STANDARD_TOKEN;
  const context: StructuralStandardContext = {
    contextId: input?.contextId ?? AU_STEEL_PROFILE_ID,
    jurisdictionProfileRef: "australia",
    standardFamily: "AS",
    standardCode: "AS 4100",
    edition,
    amendment,
    nationalAnnexRef: null,
    effectiveFrom: "1970-01-01",
    effectiveTo: null,
    discipline: "structural",
    materialScope: "steel",
    calculationScope: "AU_TENSION",
    sourceReference: "INTENDED_STANDARD_PROFILE=AS4100; edition/amendment not independently confirmed unless engineer confirmation is attached",
    approvalStatus: "REFERENCE",
    validationState: confirmedEdition ? "ENGINEER_CONFIRMED_IDENTITY" : "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    provenanceRef: governedProvenance({
      jurisdiction: "australia",
      standard: "AS 4100",
      calculationMethod: "AU_TENSION",
      version: "au-tension-1.0.0",
      validationState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    }),
    lifecycle: "ACTIVE",
  };
  assertGovernedStandardContext(context);
  if (nationalAnnexRequired(context) || context.nationalAnnexRef) {
    throw new Error("steel design fail closed: National Annex is NOT_APPLICABLE for AU steel");
  }
  return context;
}

export function assertAuSteelStandardProfile(context: StructuralStandardContext): void {
  assertGovernedStandardContext(context);
  if (context.jurisdictionProfileRef !== "australia") throw new Error("steel design fail closed: unsupported jurisdiction");
  if (context.standardFamily !== "AS" || context.standardCode !== "AS 4100") {
    throw new Error("steel design fail closed: standard-profile mismatch");
  }
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
  if (SILENT_STANDARD_EDITION_INFERENCE) throw new Error("standard edition must not be inferred silently");
  if (context.nationalAnnexRef) throw new Error("steel design fail closed: National Annex is NOT_APPLICABLE for AU steel");
}
