import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import type { EngineeringInformationRef, InformationAuthorityPolicy } from "./types";

export const A10A_POLICY_ID = "INF-AUTH-DESIGN-CRITERIA";
export const A10A_SOURCE_A_ID = "info-ref-design-criteria-working";
export const A10A_SOURCE_B_ID = "info-ref-design-criteria-governed";
export const A10A_SOURCE_C_ID = "info-ref-design-criteria-superseded";
export const A10A_DOC_A = "doc-str-dc-working";
export const A10A_DOC_B = "doc-str-dc-revb";
export const A10A_DOC_C = "doc-str-dc-superseded";
export const A10A_MECH_LOAD_ID = "info-ref-mech-operating-load";
export const A10A_AMBIGUOUS_A = "info-ref-ambiguous-a";
export const A10A_AMBIGUOUS_B = "info-ref-ambiguous-b";

function now() {
  return "2026-09-30T18:00:00.000Z";
}

export function structuralDesignCriteriaRefs(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): EngineeringInformationRef[] {
  const base = {
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    sourceObjectType: "document" as const,
    informationType: "DESIGN_CRITERIA" as const,
    sourceKind: "DOCUMENT" as const,
    discipline: "STRUCTURAL",
    responsibleDiscipline: "STRUCTURAL",
    lifecycleStage: "FEED",
    purpose: "FOR_ENGINEERING_REVIEW" as const,
    createdBy: "eng-admin",
    createdAt: now(),
    updatedAt: now(),
  };
  return [
    {
      ...base,
      id: A10A_SOURCE_A_ID,
      sourceObjectId: A10A_DOC_A,
      eligibility: "WORKING",
      sourceFacts: {
        revision: "A",
        revisionAuthority: "DOCUMENT_REVISION",
        superseded: false,
        stale: false,
        createdBy: "engineer-a1",
        createdAt: "2026-09-01T00:00:00.000Z",
        sourceSystem: "engineering_documents",
      },
    },
    {
      ...base,
      id: A10A_SOURCE_B_ID,
      sourceObjectId: A10A_DOC_B,
      eligibility: "ELIGIBLE_AUTHORITATIVE",
      sourceFacts: {
        revision: "B",
        revisionAuthority: "DOCUMENT_REVISION",
        superseded: false,
        stale: false,
        createdBy: "eng-admin",
        createdAt: "2026-09-15T00:00:00.000Z",
        sourceSystem: "engineering_documents",
        reviewId: "rev-str-dc-feed",
      },
    },
    {
      ...base,
      id: A10A_SOURCE_C_ID,
      sourceObjectId: A10A_DOC_C,
      eligibility: "ACCEPTED_REFERENCE",
      sourceFacts: {
        revision: "0",
        revisionAuthority: "DOCUMENT_REVISION",
        superseded: true,
        supersedesSourceObjectId: A10A_DOC_B,
        stale: false,
        createdBy: "engineer-a1",
        createdAt: "2026-08-01T00:00:00.000Z",
        sourceSystem: "engineering_documents",
      },
    },
  ];
}

export function mechanicalLoadRef(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): EngineeringInformationRef {
  return {
    id: A10A_MECH_LOAD_ID,
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    sourceObjectType: "dataset",
    sourceObjectId: "ds-mech-operating-load",
    informationType: "LOAD_DATA",
    sourceKind: "DATASET",
    discipline: "MECHANICAL",
    responsibleDiscipline: "MECHANICAL",
    lifecycleStage: "FEED",
    purpose: "FOR_DESIGN_INPUT",
    eligibility: "ELIGIBLE_AUTHORITATIVE",
    sourceFacts: {
      revision: "1",
      revisionAuthority: "NONE",
      superseded: false,
      stale: false,
      sourceSystem: "vendor_dataset",
      createdAt: "2026-09-10T00:00:00.000Z",
    },
    createdBy: "mech-lead",
    createdAt: now(),
    updatedAt: now(),
  };
}

export function ambiguousAuthorityRefs(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): EngineeringInformationRef[] {
  const shared = {
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    sourceObjectType: "document" as const,
    informationType: "DESIGN_CRITERIA" as const,
    sourceKind: "DOCUMENT" as const,
    discipline: "STRUCTURAL",
    responsibleDiscipline: "STRUCTURAL",
    lifecycleStage: "FEED",
    purpose: "FOR_ENGINEERING_REVIEW" as const,
    eligibility: "ELIGIBLE_AUTHORITATIVE" as const,
    createdBy: "eng-admin",
    createdAt: now(),
    updatedAt: now(),
  };
  return [
    {
      ...shared,
      id: A10A_AMBIGUOUS_A,
      sourceObjectId: "doc-ambiguous-a",
      sourceFacts: { revision: "A", revisionAuthority: "DOCUMENT_REVISION", superseded: false, stale: false, createdAt: now() },
    },
    {
      ...shared,
      id: A10A_AMBIGUOUS_B,
      sourceObjectId: "doc-ambiguous-b",
      sourceFacts: { revision: "A", revisionAuthority: "DOCUMENT_REVISION", superseded: false, stale: false, createdAt: now() },
    },
  ];
}

export function designCriteriaPolicy(
  version: string,
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): InformationAuthorityPolicy {
  return {
    id: `pol-${A10A_POLICY_ID}-${version}`,
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    policyId: A10A_POLICY_ID,
    policyVersion: version,
    informationType: "DESIGN_CRITERIA",
    purpose: "FOR_ENGINEERING_REVIEW",
    discipline: "STRUCTURAL",
    lifecycleStage: "FEED",
    eligibleSourceKinds: ["DOCUMENT"],
    eligibleSourceObjectTypes: ["document"],
    requireAuthoritativeSource: true,
    createdBy: "eng-admin",
    createdAt: now(),
  };
}

export function mechanicalLoadPolicy(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): InformationAuthorityPolicy {
  return {
    id: "pol-INF-AUTH-MECH-LOAD-v1",
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    policyId: "INF-AUTH-MECH-LOAD",
    policyVersion: "v1",
    informationType: "LOAD_DATA",
    purpose: "FOR_DESIGN_INPUT",
    discipline: "MECHANICAL",
    eligibleSourceKinds: ["DATASET", "DOCUMENT", "EXTERNAL_REFERENCE"],
    eligibleSourceObjectTypes: ["dataset", "document", "external_reference"],
    requireAuthoritativeSource: true,
    createdBy: "eng-admin",
    createdAt: now(),
  };
}

export function missingAuthorityPolicy(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): InformationAuthorityPolicy {
  return {
    id: "pol-INF-AUTH-MATERIAL-v1",
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    policyId: "INF-AUTH-MATERIAL",
    policyVersion: "v1",
    informationType: "MATERIAL_PROPERTY",
    purpose: "FOR_DESIGN_INPUT",
    eligibleSourceKinds: ["DOCUMENT", "DATASET"],
    eligibleSourceObjectTypes: ["document", "dataset"],
    requireAuthoritativeSource: true,
    createdBy: "eng-admin",
    createdAt: now(),
  };
}
