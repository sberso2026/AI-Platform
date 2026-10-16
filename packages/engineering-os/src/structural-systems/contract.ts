/**
 * EOS-D1F-0 fail-closed structural-system architecture guards.
 * These functions reject ungoverned handoffs. They do not analyse a structure.
 */

import type {
  D1fAnalysisAssumption,
  D1fAnalysisResultAuthorityState,
  D1fBindingCurrency,
  D1fCoordinateTransform,
  D1fEntityRef,
  D1fMemberActionEffect,
  D1fMemberMapping,
  D1fMemberScopeResult,
  D1fSignConvention,
  D1fSupportRestraint,
  D1fSystemAggregation,
  D1fTenancy,
} from "@rtb/types";
import {
  AI_ANALYSIS_ASSUMPTION_APPROVAL_AUTHORITY,
  AI_COORDINATE_TRANSFORM_AUTHORITY,
  AI_MEMBER_CONNECTIVITY_AUTHORITY,
  D1F_ACTION_EFFECT_VALUES_INVENTED,
  D1F_CONNECTIVITY_INFERRED_BY_LLM,
  D1F_CONNECTIVITY_INFERRED_FROM_PROXIMITY_ONLY,
  D1F_GENERIC_MAX_ABSOLUTE_EQUALS_GOVERNING_ENGINEERING_CASE,
  D1F_MAPPING_AUTHORITIES,
  D1F_MEMBER_RELEASES_INFERRED,
  D1F_ONE_TO_ONE_MEMBER_MAPPING_ASSUMED,
  D1F_SIGN_CONVENTION_ASSUMED_FROM_SOLVER_NAME,
  D1F_SUPPORTED_DESIGN_BINDINGS,
  D1F_SUPPORT_CONDITION_GUESSED,
  IMPLICIT_SOLVER_UNIT_ASSUMPTION_ALLOWED,
  NEW_RUN_REPLACES_OLD_RESULT_IN_PLACE,
  STALE_ANALYSIS_RESULT_REUSE_ALLOWED,
  STALE_MEMBER_BINDING_REUSE_ALLOWED,
  UI_ORIENTATION_DEFINES_ENGINEERING_AXIS,
  UNITLESS_ANALYSIS_RESULT_ALLOWED,
} from "@rtb/types";

function reject(message: string): never {
  throw new Error(message);
}

export function assertStructuralSystemTenancy(row: D1fTenancy): void {
  if (!row.tenantId || !row.workspaceId || !row.projectId) {
    reject("tenant, workspace, and project authorization context are required");
  }
}

export function assertEntityRolesDistinct(entities: readonly D1fEntityRef[]): void {
  const byId = new Map<string, string>();
  for (const entity of entities) {
    assertStructuralSystemTenancy(entity);
    const prior = byId.get(entity.entityId);
    if (prior && prior !== entity.role) {
      reject("physical member, analytical element, and design member are not interchangeable");
    }
    byId.set(entity.entityId, entity.role);
  }
}

export function assertMemberMapping(mapping: D1fMemberMapping): void {
  if (D1F_ONE_TO_ONE_MEMBER_MAPPING_ASSUMED || mapping.exclusiveOneToOneAssumed) {
    reject("one-to-one member mapping must not be assumed");
  }
  if (mapping.physicalMemberIds.length === 0 || mapping.analyticalElementIds.length === 0) {
    reject("unsupported member mapping rejected");
  }
  if (mapping.authority === "UNCONFIRMED_CANDIDATE") {
    reject("AI candidate mapping cannot become authoritative automatically");
  }
  if (!(D1F_MAPPING_AUTHORITIES as readonly string[]).includes(mapping.authority)) {
    reject("unsupported member mapping rejected");
  }
  if (AI_MEMBER_CONNECTIVITY_AUTHORITY || D1F_CONNECTIVITY_INFERRED_BY_LLM || D1F_CONNECTIVITY_INFERRED_FROM_PROXIMITY_ONLY) {
    reject("connectivity must not be inferred");
  }
  if (mapping.designMemberIds.length > 0) {
    if (!mapping.designBindingTarget || !(D1F_SUPPORTED_DESIGN_BINDINGS as readonly string[]).includes(mapping.designBindingTarget)) {
      reject("unsupported member mapping rejected");
    }
  }
}

export function assertSupportRestraint(support: D1fSupportRestraint): void {
  assertStructuralSystemTenancy(support);
  if (D1F_SUPPORT_CONDITION_GUESSED || support.stiffnessCalculated) {
    reject("support conditions must not be guessed and stiffness is not calculated");
  }
  if (support.authority !== "EXPLICIT_GOVERNED_MODEL" && support.authority !== "HUMAN_CONFIRMED") {
    reject("support condition must be explicit or human-confirmed");
  }
}

export function assertMemberReleaseExplicit(input: { inferred: boolean; authority: string }): void {
  if (D1F_MEMBER_RELEASES_INFERRED || input.inferred) {
    reject("member releases must not be inferred");
  }
  if (input.authority !== "EXPLICIT_GOVERNED_MODEL" && input.authority !== "HUMAN_CONFIRMED") {
    reject("member releases must be explicit or human-confirmed");
  }
}

export function assertCoordinateTransform(transform: D1fCoordinateTransform | null): void {
  if (AI_COORDINATE_TRANSFORM_AUTHORITY || UI_ORIENTATION_DEFINES_ENGINEERING_AXIS) {
    reject("coordinate transforms are not an AI or UI authority");
  }
  if (!transform?.transformId || !transform.methodRef || !transform.version || !transform.provenanceRef) {
    reject("missing coordinate transform fails closed");
  }
  if (transform.authority !== "EXPLICIT_DETERMINISTIC") {
    reject("coordinate transform must be explicit and deterministic");
  }
  if (transform.fromSystem === transform.toSystem && transform.methodRef === "UI_ORIENTATION") {
    reject("UI orientation does not define an engineering axis");
  }
}

export function assertSignConvention(convention: D1fSignConvention | null): void {
  if (D1F_SIGN_CONVENTION_ASSUMED_FROM_SOLVER_NAME) {
    reject("sign convention must not be assumed from a solver name");
  }
  if (!convention || convention.solverNameAssumed) {
    reject("missing sign convention fails closed");
  }
  const required = [
    convention.forceSign,
    convention.momentSign,
    convention.localAxisOrientation,
    convention.memberEndConvention,
    convention.solverConvention,
    convention.designMethodConvention,
  ];
  if (required.some((value) => !value)) reject("missing sign convention fails closed");
}

export function assertExplicitUnit(unit: string | null | undefined): void {
  if (UNITLESS_ANALYSIS_RESULT_ALLOWED || IMPLICIT_SOLVER_UNIT_ASSUMPTION_ALLOWED) {
    reject("unitless or implicit solver units are not allowed");
  }
  if (!unit || unit.trim() === "" || unit === "SOLVER_DEFAULT") {
    reject("missing units fail closed");
  }
}

export function assertGovernedActionEffect(effect: D1fMemberActionEffect): void {
  if (D1F_ACTION_EFFECT_VALUES_INVENTED || effect.invented) {
    reject("action effect values must not be invented");
  }
  if (effect.value == null || !Number.isFinite(effect.value)) {
    reject("missing required action effect fails closed");
  }
  assertExplicitUnit(effect.unit);
  if (!effect.location?.kind) reject("missing result location fails closed");
  if (!effect.signConventionRef) reject("missing sign convention fails closed");
  if (!effect.coordinateTransformRef) reject("missing coordinate transform fails closed");
  if (!effect.provenanceRef || !effect.sourceResultId) reject("missing action provenance fails closed");
  if (effect.sourceAuthorityState !== "VERIFIED_GOVERNED") {
    reject("unverified imported result cannot become governed silently");
  }
}

export function assertResultPromotion(input: {
  from: D1fAnalysisResultAuthorityState;
  humanVerificationEvidenceId: string | null;
}): void {
  if (input.from === "VERIFIED_GOVERNED") return;
  if (!input.humanVerificationEvidenceId) {
    reject("unverified imported result cannot become governed silently");
  }
  if (input.from === "FAILED_ANALYSIS" || input.from === "INVALID" || input.from === "STALE" || input.from === "INCOMPLETE") {
    reject("non-governed analysis state cannot be promoted by availability");
  }
}

export function assertBindingCurrent(binding: D1fBindingCurrency): void {
  if (STALE_ANALYSIS_RESULT_REUSE_ALLOWED || STALE_MEMBER_BINDING_REUSE_ALLOWED) {
    reject("stale analysis and member bindings must not be reused");
  }
  if (binding.revisionState !== "CURRENT") reject("stale model or result binding rejected");
  if (binding.analysisFingerprint !== binding.boundFingerprint) reject("stale model or result binding rejected");
}

export function assertEnvelopeSelection(input: { automaticMaxAbsolute: boolean; selectionRuleRef: string | null }): void {
  if (D1F_GENERIC_MAX_ABSOLUTE_EQUALS_GOVERNING_ENGINEERING_CASE || input.automaticMaxAbsolute) {
    reject("largest absolute value is not the governing engineering case");
  }
  if (!input.selectionRuleRef) reject("envelope selection rule must be explicit");
}

export function assertAnalysisAssumption(assumption: D1fAnalysisAssumption): void {
  if (AI_ANALYSIS_ASSUMPTION_APPROVAL_AUTHORITY || assumption.valueInvented) {
    reject("analysis assumptions must not be invented or approved by AI");
  }
  if (!assumption.statementRef) reject("analysis assumption requires an explicit statement reference");
}

export function aggregateDeclaredSystemScope(
  requiredMemberIds: readonly string[],
  results: readonly D1fMemberScopeResult[],
): D1fSystemAggregation {
  if (requiredMemberIds.length === 0) {
    return {
      state: "SYSTEM_UNDETERMINED",
      systemAdequacyClaimed: false,
      findings: ["EMPTY_REQUIRED_MEMBER_SET"],
    };
  }
  const byId = new Map(results.map((row) => [row.memberId, row]));
  const findings: string[] = [];
  let failed = false;
  let incomplete = false;
  for (const memberId of requiredMemberIds) {
    const row = byId.get(memberId);
    if (!row || row.disposition === "UNCHECKED") {
      incomplete = true;
      findings.push(`${memberId}:UNCHECKED`);
      continue;
    }
    if (row.disposition === "MISSING_REQUIRED_ACTION") {
      incomplete = true;
      findings.push(...row.findings, `${memberId}:MISSING_REQUIRED_ACTION`);
      continue;
    }
    if (row.disposition === "CHECKED_FAIL") {
      failed = true;
      findings.push(...row.findings);
    }
  }
  if (failed) {
    return { state: "SYSTEM_NOT_SATISFIED", systemAdequacyClaimed: false, findings };
  }
  if (incomplete) {
    return { state: "SYSTEM_EVALUATION_INCOMPLETE", systemAdequacyClaimed: false, findings };
  }
  return {
    state: "SYSTEM_EVALUATION_COMPLETE_FOR_DECLARED_SCOPE",
    systemAdequacyClaimed: false,
    findings,
  };
}

export function recordSuccessorRun<T extends { analysisRunId: string; revisionState: string; resultSetFingerprint: string }>(
  prior: T,
  next: T,
): { prior: T; current: T } {
  if (NEW_RUN_REPLACES_OLD_RESULT_IN_PLACE) reject("historical analysis results must stay immutable");
  if (next.analysisRunId === prior.analysisRunId || next.resultSetFingerprint === prior.resultSetFingerprint) {
    reject("new run must not replace the prior result in place");
  }
  return {
    prior: { ...prior, revisionState: "SUPERSEDED" },
    current: { ...next, revisionState: "CURRENT" },
  };
}
