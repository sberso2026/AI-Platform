import type { AnalysisInputManifestV1 } from "../analysis-intelligence/types";
import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "../digital-thread/types";
import type { LifecycleCriterionDefinition, LifecycleEvidence } from "../lifecycle-intelligence/types";
import type { EngineeringInformationRef, InformationAuthorityResolution } from "./types";

export function composeDeliverableInformationAuthority(input: {
  bound: boolean;
  resolution: InformationAuthorityResolution | null;
}): {
  authorityVisible: boolean;
  freshness: string | null;
  authorityState: string | null;
  outcome: string | null;
  reviewComplete: false;
  configurationReady: false;
  approved: false;
  maturityUpgraded: false;
} {
  return {
    authorityVisible: Boolean(input.bound && input.resolution),
    freshness: input.resolution?.freshness ?? null,
    authorityState: input.resolution?.authorityState ?? null,
    outcome: input.resolution?.outcome ?? null,
    reviewComplete: false,
    configurationReady: false,
    approved: false,
    maturityUpgraded: false,
  };
}

export const AUTHORITATIVE_INFORMATION_CRITERION: LifecycleCriterionDefinition = {
  criterionId: "A10A-INF-001",
  criterionVersion: "v1",
  type: "AUTHORITATIVE_INFORMATION_REQUIRED",
  gateId: "FEED_EXIT",
  name: "Authoritative design criteria for FEED",
  description: "Required design-criteria source is authoritative and current for FEED engineering review. Not engineering approval.",
  enabled: true,
  informationType: "DESIGN_CRITERIA",
  informationPurpose: "FOR_ENGINEERING_REVIEW",
};

export function withInformationLifecycleEvidence(
  evidence: LifecycleEvidence,
  resolution: InformationAuthorityResolution,
): LifecycleEvidence {
  return {
    ...evidence,
    information: [
      {
        informationType: resolution.informationType,
        purpose: resolution.purpose,
        outcome: resolution.outcome,
        authoritative: resolution.outcome === "RESOLVED",
        freshness: resolution.freshness,
        policyConfigured: Boolean(resolution.policyId),
      },
    ],
  };
}

export type AnalysisInformationAuthorityPin = {
  informationRefId: string;
  informationType: string;
  purpose: string;
  outcome: string;
  policyId: string | null;
  policyVersion: string | null;
  sourceObjectType: string;
  sourceObjectId: string;
  freshness: string;
};

export function pinAnalysisInformationAuthority(
  manifest: AnalysisInputManifestV1,
  resolution: InformationAuthorityResolution,
  ref: EngineeringInformationRef | null,
): { manifest: AnalysisInputManifestV1; informationAuthorityPins: AnalysisInformationAuthorityPin[] } {
  return {
    manifest,
    informationAuthorityPins: ref
      ? [
          {
            informationRefId: ref.id,
            informationType: resolution.informationType,
            purpose: resolution.purpose,
            outcome: resolution.outcome,
            policyId: resolution.policyId,
            policyVersion: resolution.policyVersion,
            sourceObjectType: ref.sourceObjectType,
            sourceObjectId: ref.sourceObjectId,
            freshness: resolution.freshness,
          },
        ]
      : [],
  };
}

export function enrichSearchHitWithInformation<T extends Record<string, unknown>>(
  hit: T,
  resolution: InformationAuthorityResolution | null,
  ref?: EngineeringInformationRef | null,
): T & {
  informationAuthorityState?: string;
  informationFreshness?: string;
  informationRevision?: string | null;
  informationDiscipline?: string | null;
  informationSourceKind?: string;
} {
  if (!resolution && !ref) return hit;
  return {
    ...hit,
    informationAuthorityState: resolution?.authorityState ?? ref?.eligibility,
    informationFreshness: resolution?.freshness,
    informationRevision: ref?.sourceFacts.revision ?? null,
    informationDiscipline: ref?.responsibleDiscipline ?? ref?.discipline ?? null,
    informationSourceKind: ref?.sourceKind,
  };
}

export function surfaceAssumptionSourceState(resolution: InformationAuthorityResolution | null): {
  sourceFreshness: string | null;
  sourceAuthority: string | null;
  assumptionInvalidated: false;
} {
  return {
    sourceFreshness: resolution?.freshness ?? null,
    sourceAuthority: resolution?.authorityState ?? null,
    assumptionInvalidated: false,
  };
}

export function surfaceDecisionReferencedInformation(resolution: InformationAuthorityResolution | null): {
  staleOrSuperseded: boolean;
  reversed: false;
} {
  const staleOrSuperseded =
    resolution?.outcome === "SOURCE_STALE" ||
    resolution?.outcome === "SOURCE_SUPERSEDED" ||
    resolution?.freshness === "STALE" ||
    resolution?.freshness === "SUPERSEDED";
  return { staleOrSuperseded, reversed: false };
}

export function requirementReferencesAuthoritativeInformation(resolution: InformationAuthorityResolution | null): {
  authoritative: boolean;
  verified: false;
} {
  return { authoritative: resolution?.outcome === "RESOLVED", verified: false };
}

export function interfaceConsumesInformation(resolution: InformationAuthorityResolution | null, responsibleDiscipline: string): {
  resolved: boolean;
  responsibleDiscipline: string;
  ownershipTransferred: false;
  interfaceLifecycleOwned: true;
} {
  return {
    resolved: resolution?.outcome === "RESOLVED",
    responsibleDiscipline,
    ownershipTransferred: false,
    interfaceLifecycleOwned: true,
  };
}

export function informationThreadGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  ref: EngineeringInformationRef;
  sourceType: string;
  sourceId: string;
}): ThreadGraphInput {
  const node = (objectType: string, objectId: string, extra: Partial<ThreadCatalogNode> = {}): ThreadCatalogNode => ({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectType,
    objectId,
    ...extra,
  });
  const link = (relationship: string, fromType: string, fromId: string, toType: string, toId: string): ThreadRelation => ({
    relationship,
    fromType,
    fromId,
    toType,
    toId,
    governed: true,
  });
  return {
    nodes: [
      node("engineering_information", input.ref.id, { objectCode: input.ref.informationType, status: input.ref.eligibility }),
      node(input.sourceType, input.sourceId, { objectCode: input.sourceId, revision: input.ref.sourceFacts.revision }),
      node("requirement", "req-design-basis"),
      node("interface", "if-cr-cv-01"),
      node("analysis_result", "anl-struct"),
      node("decision", "edn-014"),
      node("deliverable_expectation", "str-anl-feed"),
      node("configuration_baseline", "bl-feed-1"),
    ],
    links: [
      link("USES", "engineering_information", input.ref.id, input.sourceType, input.sourceId),
      link("BASED_ON", "requirement", "req-design-basis", input.sourceType, input.sourceId),
      link("DEPENDS_ON", "interface", "if-cr-cv-01", "engineering_information", input.ref.id),
      link("USES", "analysis_result", "anl-struct", "engineering_information", input.ref.id),
      link("SUPPORTED_BY", "decision", "edn-014", input.sourceType, input.sourceId),
      link("USES", "deliverable_expectation", "str-anl-feed", "engineering_information", input.ref.id),
      link("BASELINES", "configuration_baseline", "bl-feed-1", input.sourceType, input.sourceId),
    ],
  };
}
