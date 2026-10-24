import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import {
  A10A_MECH_LOAD_ID,
  A10A_SOURCE_B_ID,
  designCriteriaPolicy,
  mechanicalLoadPolicy,
  mechanicalLoadRef,
  missingAuthorityPolicy,
  structuralDesignCriteriaRefs,
} from "../information-intelligence/fixture";
import type { EngineeringInformationRef, InformationAuthorityPolicy } from "../information-intelligence/types";
import type { EngineeringInformationRequirement } from "./types";

export const A10C_GEO_REF_ID = "info-ref-geo-bearing";
export const A10C_SURVEY_REF_ID = "info-ref-survey-level";
export const A10C_DRAWING_REF_ID = "info-ref-final-drawing";
export const A10C_CALC_REF_ID = "info-ref-final-calc";
export const A10C_MANUAL_REF_ID = "info-ref-vendor-manual";
export const A10C_TEST_REF_ID = "info-ref-commissioning-test";
export const A10C_INTERFACE_ID = "if-cr-cv-01";
export const A10C_SYSTEM_ID = "sys-primary-crushing";
export const A10C_MANAGED_REPO_ID = "repo-project-a-structural-calcs";
export const A10C_INTERFACE_LOAD_REF_ID = "info-ref-iface-equipment-load";
export const A10C_CONSTRUCTION_DRAWING_REF_ID = "info-ref-anchor-bolt-drawing";
export const A10C_CONSTRUCTION_REQUEST_ID = "rfi-anchor-bolt-location";

function now() {
  return "2026-10-01T08:00:00.000Z";
}

function ref(
  id: string,
  informationType: EngineeringInformationRef["informationType"],
  purpose: EngineeringInformationRef["purpose"],
  sourceObjectId: string,
  discipline: string,
): EngineeringInformationRef {
  return {
    id,
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    sourceObjectType: "document",
    sourceObjectId,
    informationType,
    sourceKind: "DOCUMENT",
    discipline,
    responsibleDiscipline: discipline,
    lifecycleStage: "FEED",
    purpose,
    eligibility: "ELIGIBLE_AUTHORITATIVE",
    sourceFacts: { revision: "1", revisionAuthority: "DOCUMENT_REVISION", superseded: false, stale: false, createdAt: now() },
    createdBy: "eng-admin",
    createdAt: now(),
    updatedAt: now(),
  };
}

export function foundationInformationRefs(): EngineeringInformationRef[] {
  return [
    ...structuralDesignCriteriaRefs(),
    mechanicalLoadRef(),
    ref(A10C_GEO_REF_ID, "MATERIAL_PROPERTY", "FOR_DESIGN_INPUT", "geo-bearing-capacity", "GEOTECHNICAL"),
    ref(A10C_SURVEY_REF_ID, "SURVEY_DATA", "FOR_DESIGN_INPUT", "survey-level-feed", "CIVIL"),
  ];
}

export function interfaceLoadRef(): EngineeringInformationRef {
  return { ...mechanicalLoadRef(), id: A10C_INTERFACE_LOAD_REF_ID, purpose: "FOR_COORDINATION", sourceObjectId: "ds-mech-interface-load" };
}

export function constructionDrawingRef(): EngineeringInformationRef {
  return { ...ref(A10C_CONSTRUCTION_DRAWING_REF_ID, "DRAWING", "FOR_CONSTRUCTION_REFERENCE", "dwg-anchor-bolt", "STRUCTURAL"), lifecycleStage: "CONSTRUCTION" };
}

export function a10cAuthorityPolicies(): InformationAuthorityPolicy[] {
  const base = {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    eligibleSourceKinds: ["DOCUMENT", "DATASET", "EXTERNAL_REFERENCE"] as InformationAuthorityPolicy["eligibleSourceKinds"],
    eligibleSourceObjectTypes: ["document", "dataset", "external_reference"] as InformationAuthorityPolicy["eligibleSourceObjectTypes"],
    requireAuthoritativeSource: true,
    createdBy: "eng-admin",
    createdAt: now(),
  };
  return [
    designCriteriaPolicy("v1"),
    mechanicalLoadPolicy(),
    missingAuthorityPolicy(),
    { ...base, id: "pol-survey-v1", policyId: "INF-AUTH-SURVEY", policyVersion: "v1", informationType: "SURVEY_DATA", purpose: "FOR_DESIGN_INPUT" },
    { ...base, id: "pol-iface-load-v1", policyId: "INF-AUTH-IFACE-LOAD", policyVersion: "v1", informationType: "LOAD_DATA", purpose: "FOR_COORDINATION" },
    { ...base, id: "pol-con-dwg-v1", policyId: "INF-AUTH-CON-DWG", policyVersion: "v1", informationType: "DRAWING", purpose: "FOR_CONSTRUCTION_REFERENCE" },
    { ...base, id: "pol-ho-dwg-v1", policyId: "INF-AUTH-HO-DWG", policyVersion: "v1", informationType: "DRAWING", purpose: "FOR_OPERATIONS_REFERENCE" },
    { ...base, id: "pol-ho-calc-v1", policyId: "INF-AUTH-HO-CALC", policyVersion: "v1", informationType: "CALCULATION", purpose: "FOR_OPERATIONS_REFERENCE" },
    { ...base, id: "pol-ho-manual-v1", policyId: "INF-AUTH-HO-MANUAL", policyVersion: "v1", informationType: "DATASHEET", purpose: "FOR_OPERATIONS_REFERENCE" },
    { ...base, id: "pol-ho-test-v1", policyId: "INF-AUTH-HO-TEST", policyVersion: "v1", informationType: "TEST_DATA", purpose: "FOR_COMMISSIONING" },
  ];
}

export function handoverInformationRefs(): EngineeringInformationRef[] {
  return [
    { ...ref(A10C_DRAWING_REF_ID, "DRAWING", "FOR_OPERATIONS_REFERENCE", "dwg-final", "STRUCTURAL"), lifecycleStage: "COMMISSIONING" },
    { ...ref(A10C_CALC_REF_ID, "CALCULATION", "FOR_OPERATIONS_REFERENCE", "calc-final", "STRUCTURAL"), lifecycleStage: "COMMISSIONING" },
    { ...ref(A10C_MANUAL_REF_ID, "DATASHEET", "FOR_OPERATIONS_REFERENCE", "vendor-manual", "MECHANICAL"), lifecycleStage: "COMMISSIONING" },
    { ...ref(A10C_TEST_REF_ID, "TEST_DATA", "FOR_COMMISSIONING", "comm-test-01", "COMMISSIONING"), lifecycleStage: "COMMISSIONING" },
  ];
}

export function sampleRequirement(
  partial: Partial<EngineeringInformationRequirement> & Pick<EngineeringInformationRequirement, "id" | "requirementType" | "informationType" | "purpose" | "title">,
): EngineeringInformationRequirement {
  return {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    whyRequired: partial.whyRequired ?? partial.title,
    providerKind: "DISCIPLINE",
    providerDiscipline: "STRUCTURAL",
    providerOrg: null,
    providerRole: null,
    consumerKind: "DISCIPLINE",
    consumerDiscipline: "STRUCTURAL",
    consumerOrg: null,
    consumerRole: null,
    systemId: A10C_SYSTEM_ID,
    assetId: null,
    packageId: null,
    interfaceId: null,
    deliverableId: null,
    lifecycleStage: "FEED",
    neededBy: null,
    requiredForObjectType: "FOUNDATION_CALCULATION",
    requiredForObjectId: A10C_SYSTEM_ID,
    workType: "FOUNDATION_CALCULATION",
    acceptanceCriteriaRef: null,
    blocking: true,
    requireAuthoritative: true,
    requireManagedSource: true,
    status: "PLANNED",
    constructionRequestId: null,
    createdBy: "eng-admin",
    createdAt: now(),
    updatedAt: now(),
    ...partial,
  };
}

export { A10A_MECH_LOAD_ID, A10A_SOURCE_B_ID, CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE };
