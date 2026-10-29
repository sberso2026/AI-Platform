import { resolveEngineeringInformationAuthority } from "../information-intelligence/resolver";
import type { EngineeringInformationRef, InformationAuthorityPolicy } from "../information-intelligence/types";
import type { EngineeringInformationRequirement, InformationRequirementSatisfaction } from "./types";

export type RequirementSatisfactionResult = {
  requirementId: string;
  satisfied: boolean;
  received: boolean;
  acceptedForPurpose: boolean;
  stale: boolean;
  superseded: boolean;
  conflicted: boolean;
  unmanagedRejected: boolean;
  informationRefId: string | null;
  authorityOutcome: string | null;
  freshness: string | null;
  engineeringApproved: false;
  explanation: string;
};

export function evaluateRequirementSatisfaction(input: {
  requirement: EngineeringInformationRequirement;
  refs: EngineeringInformationRef[];
  policies: InformationAuthorityPolicy[];
  satisfactions: InformationRequirementSatisfaction[];
}): RequirementSatisfactionResult {
  const req = input.requirement;
  const links = input.satisfactions.filter((row) => row.requirementId === req.id);
  if (links.some((row) => row.unmanagedRejected)) {
    return {
      requirementId: req.id,
      satisfied: false,
      received: false,
      acceptedForPurpose: false,
      stale: false,
      superseded: false,
      conflicted: false,
      unmanagedRejected: true,
      informationRefId: null,
      authorityOutcome: null,
      freshness: null,
      engineeringApproved: false,
      explanation: "Unmanaged local files cannot silently satisfy an information requirement. Publish into a managed repository first.",
    };
  }
  const accepted = links.find((row) => row.acceptedForPurpose && !row.rejected);
  const received = links.find((row) => !row.rejected) ?? accepted;
  if (!received) {
    return {
      requirementId: req.id,
      satisfied: false,
      received: false,
      acceptedForPurpose: false,
      stale: false,
      superseded: false,
      conflicted: false,
      unmanagedRejected: false,
      informationRefId: null,
      authorityOutcome: "NO_SOURCE",
      freshness: null,
      engineeringApproved: false,
      explanation: `Required ${req.informationType} for ${req.purpose} has not been provided.`,
    };
  }
  const resolution = resolveEngineeringInformationAuthority({
    tenantId: req.tenantId,
    workspaceId: req.workspaceId,
    refs: input.refs.filter((row) => row.id === received.informationRefId || (row.informationType === req.informationType && row.projectId === req.projectId)),
    policies: input.policies,
    request: {
      projectId: req.projectId,
      informationType: req.informationType,
      purpose: req.purpose,
      discipline: req.providerDiscipline ?? undefined,
      lifecycleStage: req.lifecycleStage ?? undefined,
      systemId: req.systemId ?? undefined,
      actorId: "information-requirement-resolver",
    },
  });
  const stale = resolution.freshness === "STALE" || resolution.freshness === "POTENTIALLY_STALE";
  const superseded = resolution.freshness === "SUPERSEDED" || resolution.outcome === "SOURCE_SUPERSEDED";
  const conflicted = resolution.outcome === "CONFLICT" || resolution.outcome === "AMBIGUOUS";
  const acceptedForPurpose = Boolean(accepted);
  const authoritativeOk = !req.requireAuthoritative || resolution.outcome === "RESOLVED";
  const satisfied = acceptedForPurpose && authoritativeOk && !stale && !superseded && !conflicted;
  return {
    requirementId: req.id,
    satisfied,
    received: true,
    acceptedForPurpose,
    stale,
    superseded,
    conflicted,
    unmanagedRejected: false,
    informationRefId: received.informationRefId,
    authorityOutcome: resolution.outcome,
    freshness: resolution.freshness,
    engineeringApproved: false,
    explanation: acceptedForPurpose
      ? `Accepted for purpose ${req.purpose}. Not engineering approval. Authority outcome ${resolution.outcome}, freshness ${resolution.freshness}.`
      : `Information received but not accepted for purpose. RECEIVED is not ACCEPTED_FOR_PURPOSE.`,
  };
}
