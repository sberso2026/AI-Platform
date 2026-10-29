import type { BuildingCodeAdoptionContext, UsLocalAmendment } from "@rtb/types";
import { BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE, LOCAL_AMENDMENT_VALUE_GUESSED, US_JURISDICTION_AND_STANDARD_SEPARATE } from "@rtb/types";

export const GOVERNED_US_LOCAL_AMENDMENT_CATALOG: readonly UsLocalAmendment[] = [];

export function assertBuildingCodeAndSteelStandardSeparate(buildingCodeFamily: string, steelStandardCode: string): void {
  if (!BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE) throw new Error("building code and steel standard must remain separate");
  if (!buildingCodeFamily?.trim() || !steelStandardCode?.trim()) {
    throw new Error("building code and steel standard identities are required and distinct");
  }
  if (buildingCodeFamily === steelStandardCode) {
    throw new Error("building code is not a substitute for an AISC steel specification");
  }
}

export function assertJurisdictionAndStandardSeparate(jurisdiction: string, steelStandardCode: string): void {
  if (!US_JURISDICTION_AND_STANDARD_SEPARATE) throw new Error("jurisdiction and standard must remain separate");
  if (!jurisdiction?.trim() || jurisdiction === steelStandardCode) {
    throw new Error("jurisdiction is not a substitute for an AISC steel specification");
  }
}

export function assertLocalAmendmentNotGuessed(amendment: UsLocalAmendment | null): void {
  if (LOCAL_AMENDMENT_VALUE_GUESSED) throw new Error("local amendment values must not be guessed");
  if (amendment && amendment.ruleOverrides.length > 0) {
    throw new Error("local amendment values must not be guessed");
  }
}

export function assertAmendmentCompatibleWithAdoption(
  adoption: BuildingCodeAdoptionContext | null,
  amendment: UsLocalAmendment | null,
): void {
  assertLocalAmendmentNotGuessed(amendment);
  if (!adoption || !amendment) return;
  if (amendment.baseCodeRef !== adoption.buildingCodeFamily) {
    throw new Error("LOCAL_AMENDMENT_CONFLICT: amendment base code does not match the adoption context");
  }
  if (amendment.editionCompatibility !== adoption.buildingCodeEdition) {
    throw new Error("LOCAL_AMENDMENT_CONFLICT: amendment tied to wrong base-code edition");
  }
}
