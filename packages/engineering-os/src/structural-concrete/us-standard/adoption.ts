import type { UsConcreteBuildingCodeAdoptionContext, UsConcreteLocalAmendment } from "@rtb/types";
import {
  ACI_UNKNOWN_EDITION_TOKEN,
  DEFAULT_US_CONCRETE_BUILDING_CODE,
  SILENT_US_BUILDING_CODE_EDITION_INFERENCE,
  US_BUILDING_CODE_AND_ACI_CONCRETE_STANDARD_SEPARATE,
  US_CONCRETE_JURISDICTION_AND_STANDARD_SEPARATE,
  US_CONCRETE_LOCAL_AMENDMENT_VALUE_GUESSED,
} from "@rtb/types";

export const GOVERNED_US_CONCRETE_LOCAL_AMENDMENT_CATALOG: readonly UsConcreteLocalAmendment[] = [];

export function assertBuildingCodeAndAciStandardSeparate(buildingCodeFamily: string, aciStandardCode: string): void {
  if (!US_BUILDING_CODE_AND_ACI_CONCRETE_STANDARD_SEPARATE) throw new Error("building code and ACI concrete standard must remain separate");
  if (!buildingCodeFamily?.trim() || !aciStandardCode?.trim()) {
    throw new Error("building code and ACI concrete standard identities are required and distinct");
  }
  if (buildingCodeFamily === aciStandardCode) {
    throw new Error("building code is not a substitute for an ACI concrete specification");
  }
}

export function assertUsConcreteJurisdictionAndStandardSeparate(jurisdiction: string, aciStandardCode: string): void {
  if (!US_CONCRETE_JURISDICTION_AND_STANDARD_SEPARATE) throw new Error("jurisdiction and standard must remain separate");
  if (!jurisdiction?.trim() || jurisdiction === aciStandardCode) {
    throw new Error("jurisdiction is not a substitute for an ACI concrete specification");
  }
}

export function assertNoDefaultUsBuildingCode(): void {
  if (DEFAULT_US_CONCRETE_BUILDING_CODE || SILENT_US_BUILDING_CODE_EDITION_INFERENCE) {
    throw new Error("a default US concrete building code is forbidden");
  }
}

export function assertUsConcreteLocalAmendmentNotGuessed(amendment: UsConcreteLocalAmendment | null): void {
  if (US_CONCRETE_LOCAL_AMENDMENT_VALUE_GUESSED) throw new Error("LOCAL_AMENDMENT_CONFLICT: US concrete local amendment values must not be guessed");
  if (amendment && amendment.ruleOverrides.length > 0) {
    throw new Error("LOCAL_AMENDMENT_CONFLICT: US concrete local amendment values must not be guessed");
  }
}

export function assertUsConcreteAmendmentCompatibleWithAdoption(
  adoption: UsConcreteBuildingCodeAdoptionContext | null,
  amendment: UsConcreteLocalAmendment | null,
): void {
  assertUsConcreteLocalAmendmentNotGuessed(amendment);
  if (!adoption || !amendment) return;
  if (amendment.baseCodeRef !== adoption.buildingCodeFamily) {
    throw new Error("LOCAL_AMENDMENT_CONFLICT: amendment base code does not match the adoption context");
  }
  if (amendment.editionCompatibility !== adoption.buildingCodeEdition) {
    throw new Error("LOCAL_AMENDMENT_CONFLICT: amendment tied to wrong base-code edition");
  }
  if (
    adoption.effectiveDate
    && amendment.effectiveDate
    && adoption.effectiveDate !== amendment.effectiveDate
  ) {
    throw new Error("EFFECTIVE_DATE_CONFLICT: amendment effective date does not match adoption");
  }
}

export function assertAciReferencedEditionCompatible(
  adoption: UsConcreteBuildingCodeAdoptionContext | null,
  aciEdition: string,
): void {
  if (!adoption) return;
  const referenced = adoption.referencedConcreteStandardEdition;
  if (
    referenced !== ACI_UNKNOWN_EDITION_TOKEN
    && aciEdition !== ACI_UNKNOWN_EDITION_TOKEN
    && referenced !== aciEdition
  ) {
    throw new Error("ACI_REFERENCED_EDITION_MISMATCH: adopted building code references a different ACI edition");
  }
}
