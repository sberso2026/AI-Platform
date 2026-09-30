import { composeInformationFreshness, freshnessAllowsAuthoritativeUse } from "./freshness";
import type {
  EngineeringInformationRef,
  InformationApplicability,
  InformationAuthorityPolicy,
  InformationAuthorityResolution,
  InformationAuthorityState,
  InformationCandidateExplanation,
  InformationResolutionOutcome,
  ResolveInformationInput,
} from "./types";

function scopeMatches(ref: EngineeringInformationRef, scope: InformationApplicability, discipline?: string | null, lifecycle?: string | null): boolean {
  if (ref.projectId !== scope.projectId) return false;
  if (scope.systemId && ref.systemId && ref.systemId !== scope.systemId) return false;
  if (scope.assetId && ref.assetId && ref.assetId !== scope.assetId) return false;
  if (scope.discipline && ref.discipline && ref.discipline !== scope.discipline) return false;
  if (discipline && ref.discipline && ref.discipline !== discipline && ref.responsibleDiscipline !== discipline) {
    // Consumer discipline may differ from responsible/source discipline.
  }
  if (lifecycle && ref.lifecycleStage && ref.lifecycleStage !== lifecycle) return false;
  if (scope.lifecycleStage && ref.lifecycleStage && ref.lifecycleStage !== scope.lifecycleStage) return false;
  if (scope.configurationBaselineId && ref.configurationBaselineId && ref.configurationBaselineId !== scope.configurationBaselineId) {
    return false;
  }
  return true;
}

function policyScore(policy: InformationAuthorityPolicy, input: ResolveInformationInput): number {
  let score = 0;
  if (policy.projectId === input.projectId) score += 8;
  else if (policy.projectId == null) score += 2;
  else return -1;
  if (policy.informationType !== input.informationType) return -1;
  if (policy.purpose !== input.purpose) return -1;
  if (policy.discipline && input.discipline && policy.discipline !== input.discipline) return -1;
  if (policy.discipline && input.discipline && policy.discipline === input.discipline) score += 2;
  if (policy.systemId && input.systemId && policy.systemId !== input.systemId) return -1;
  if (policy.systemId && input.systemId && policy.systemId === input.systemId) score += 2;
  if (policy.lifecycleStage && input.lifecycleStage && policy.lifecycleStage !== input.lifecycleStage) return -1;
  if (policy.lifecycleStage && input.lifecycleStage && policy.lifecycleStage === input.lifecycleStage) score += 2;
  if (input.policyVersion && policy.policyVersion !== input.policyVersion) return -1;
  return score;
}

export function selectAuthorityPolicy(
  policies: InformationAuthorityPolicy[],
  input: ResolveInformationInput,
): InformationAuthorityPolicy | null {
  const ranked = policies
    .map((policy) => ({ policy, score: policyScore(policy, input) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || b.policy.policyVersion.localeCompare(a.policy.policyVersion));
  return ranked[0]?.policy ?? null;
}

function authorityFromEligibility(
  eligibility: EngineeringInformationRef["eligibility"],
  freshness: ReturnType<typeof composeInformationFreshness>,
): InformationAuthorityState {
  if (eligibility === "NOT_APPLICABLE") return "NOT_APPLICABLE";
  if (freshness === "SUPERSEDED") return "SUPERSEDED";
  if (freshness === "STALE") return "STALE";
  if (eligibility === "WORKING") return "WORKING_INFORMATION";
  if (eligibility === "UNVERIFIED") return "UNVERIFIED";
  if (eligibility === "ACCEPTED_REFERENCE") return "ACCEPTED_REFERENCE";
  if (eligibility === "ELIGIBLE_AUTHORITATIVE") return "AUTHORITATIVE_FOR_PURPOSE";
  return "UNKNOWN";
}

export function resolveEngineeringInformationAuthority(input: {
  tenantId: string;
  workspaceId: string;
  refs: EngineeringInformationRef[];
  policies: InformationAuthorityPolicy[];
  request: ResolveInformationInput;
}): InformationAuthorityResolution {
  const started = Date.now();
  const now = input.request.now ?? new Date().toISOString();
  const scope: InformationApplicability = {
    projectId: input.request.projectId,
    systemId: input.request.systemId ?? input.request.scope?.systemId ?? null,
    subsystemId: input.request.scope?.subsystemId ?? null,
    assetId: input.request.assetId ?? input.request.scope?.assetId ?? null,
    discipline: input.request.discipline ?? input.request.scope?.discipline ?? null,
    packageId: input.request.scope?.packageId ?? null,
    lifecycleStage: input.request.lifecycleStage ?? input.request.scope?.lifecycleStage ?? null,
    configurationBaselineId: input.request.configurationBaselineId ?? input.request.scope?.configurationBaselineId ?? null,
  };

  const policy = selectAuthorityPolicy(input.policies, input.request);
  const inScope = input.refs.filter(
    (ref) =>
      ref.tenantId === input.tenantId &&
      ref.workspaceId === input.workspaceId &&
      ref.informationType === input.request.informationType &&
      ref.purpose === input.request.purpose &&
      scopeMatches(ref, scope, input.request.discipline, input.request.lifecycleStage),
  );

  const candidates: InformationCandidateExplanation[] = inScope.map((ref) => {
    const freshness = composeInformationFreshness(ref.sourceFacts, now);
    const ineligibleReasons: string[] = [];
    let considered = true;
    if (!policy) ineligibleReasons.push("policy_not_configured");
    else {
      if (!policy.eligibleSourceKinds.includes(ref.sourceKind)) {
        ineligibleReasons.push(`source_kind_not_eligible:${ref.sourceKind}`);
      }
      if (!policy.eligibleSourceObjectTypes.includes(ref.sourceObjectType)) {
        ineligibleReasons.push(`source_object_type_not_eligible:${ref.sourceObjectType}`);
      }
    }
    if (ref.eligibility === "NOT_APPLICABLE") ineligibleReasons.push("not_applicable");
    if (ref.eligibility === "WORKING") ineligibleReasons.push("working_information_not_authoritative");
    if (ref.sourceFacts.superseded || freshness === "SUPERSEDED") ineligibleReasons.push("source_superseded");
    if (ref.sourceFacts.stale || freshness === "STALE") ineligibleReasons.push("source_stale");
    if (!freshnessAllowsAuthoritativeUse(freshness) && ref.eligibility === "ELIGIBLE_AUTHORITATIVE") {
      ineligibleReasons.push("freshness_blocks_authoritative_use");
    }
    if (ineligibleReasons.length) considered = ref.eligibility === "ELIGIBLE_AUTHORITATIVE";
    return {
      refId: ref.id,
      sourceObjectType: ref.sourceObjectType,
      sourceObjectId: ref.sourceObjectId,
      eligibility: ref.eligibility,
      freshness,
      authorityState: authorityFromEligibility(ref.eligibility, freshness),
      considered,
      ineligibleReasons,
    };
  });

  const eligible = candidates.filter(
    (row) =>
      row.eligibility === "ELIGIBLE_AUTHORITATIVE" &&
      !row.ineligibleReasons.length &&
      freshnessAllowsAuthoritativeUse(row.freshness),
  );

  let outcome: InformationResolutionOutcome;
  let selectedRefId: string | null = null;
  let authorityState: InformationAuthorityState = "UNKNOWN";
  let freshness = candidates[0]?.freshness ?? "UNKNOWN";
  let conflictOrAmbiguity: string | null = null;

  if (!policy) {
    outcome = "POLICY_NOT_CONFIGURED";
  } else if (!inScope.length) {
    outcome = policy.requireAuthoritativeSource ? "NO_AUTHORITATIVE_SOURCE" : "NO_SOURCE";
  } else if (!eligible.length) {
    const staleOnly = candidates.some((row) => row.eligibility === "ELIGIBLE_AUTHORITATIVE" && row.ineligibleReasons.includes("source_stale"));
    const supersededOnly = candidates.some((row) => row.eligibility === "ELIGIBLE_AUTHORITATIVE" && row.ineligibleReasons.includes("source_superseded"));
    if (staleOnly) outcome = "SOURCE_STALE";
    else if (supersededOnly) outcome = "SOURCE_SUPERSEDED";
    else if (policy.requireAuthoritativeSource) outcome = "NO_AUTHORITATIVE_SOURCE";
    else outcome = "NO_ELIGIBLE_SOURCE";
    authorityState = staleOnly ? "STALE" : supersededOnly ? "SUPERSEDED" : "UNKNOWN";
  } else if (eligible.length > 1) {
    outcome = "CONFLICT";
    authorityState = "CONFLICTING_AUTHORITY";
    conflictOrAmbiguity = `${eligible.length} simultaneously eligible sources claim authority for ${input.request.informationType}/${input.request.purpose}. No automatic winner.`;
  } else {
    selectedRefId = eligible[0]!.refId;
    outcome = "RESOLVED";
    authorityState = "AUTHORITATIVE_FOR_PURPOSE";
    freshness = eligible[0]!.freshness;
  }

  if (outcome === "CONFLICT") {
    // AMBIGUOUS is the same governance condition as CONFLICT for A10A: competing authority, not technical contradiction.
  }

  const selected = inScope.find((ref) => ref.id === selectedRefId) ?? null;
  const ineligible = candidates.flatMap((row) => row.ineligibleReasons.map((reason) => `${row.refId}:${reason}`));
  const alternatives = candidates.filter((row) => row.refId !== selectedRefId).map((row) => `${row.sourceObjectType}:${row.sourceObjectId} (${row.eligibility}/${row.freshness})`);

  return {
    id: `res-${input.request.projectId}-${input.request.informationType}-${input.request.purpose}-${policy?.policyVersion ?? "none"}-${now}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.request.projectId,
    informationType: input.request.informationType,
    purpose: input.request.purpose,
    scope,
    outcome: outcome === "CONFLICT" ? "CONFLICT" : outcome,
    authorityState,
    freshness,
    selectedRefId,
    candidateRefIds: candidates.map((row) => row.refId),
    policyId: policy?.policyId ?? null,
    policyVersion: policy?.policyVersion ?? null,
    explanation: {
      whyApplies: selected
        ? `Source ${selected.sourceObjectType}:${selected.sourceObjectId} is the only eligible current source for ${input.request.purpose}. AUTHORITATIVE_FOR_PURPOSE is not engineering approval.`
        : `No unambiguous authoritative source resolved for ${input.request.informationType} / ${input.request.purpose}.`,
      policy: policy ? `${policy.policyId}@${policy.policyVersion}` : "none",
      scope: `${scope.projectId}/${scope.discipline ?? "*"}/${scope.systemId ?? "*"}/${scope.lifecycleStage ?? "*"}`,
      revision: selected?.sourceFacts.revision ?? selected?.sourceFacts.baselineId ?? "source-domain revision not supplied",
      alternatives,
      ineligible,
      conflictOrAmbiguity,
      engineeringApproved: false,
    },
    candidates,
    provenance: {
      resolvedAt: now,
      resolvedBy: input.request.actorId,
      sourceFacts: selected?.sourceFacts ?? null,
    },
    metrics: {
      candidateCount: candidates.length,
      policyEvaluations: 1,
      relationsTraversed: 0,
      durationMs: Date.now() - started,
    },
    createdAt: now,
  };
}

export function rejectCallerSuppliedAuthority(body: Record<string, unknown>): string | null {
  for (const key of ["authoritative", "current", "approved", "sourcePriority"]) {
    if (key in body) return "caller_supplied_authority_rejected";
  }
  return null;
}
