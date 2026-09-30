import { requiredDimensionsFor } from "./catalog";
import type {
  DeliverableAssessment,
  DeliverableAssuranceSignal,
  DeliverableCanonicalFacts,
  DeliverableDefinition,
  DeliverableExpectation,
  DeliverableMaturityProfile,
  DeliverableReadiness,
  LifecycleCompleteness,
  MaturityDimension,
  MaturityDimensionResult,
  MaturityDimensionState,
  MaturityPurpose,
} from "./types";

function dim(
  dimension: MaturityDimension,
  state: MaturityDimensionState,
  expected: string,
  actual: string,
  explanation: string,
  refs: MaturityDimensionResult["evidenceRefs"] = [],
  sourceCompleteness: LifecycleCompleteness = "COMPLETE",
): MaturityDimensionResult {
  return { dimension, state, expected, actual, explanation, evidenceRefs: refs, sourceCompleteness };
}

export function evaluateDeliverableDimensions(input: {
  definition: DeliverableDefinition;
  purpose: MaturityPurpose;
  profile: DeliverableMaturityProfile;
  facts: DeliverableCanonicalFacts;
}): MaturityDimensionResult[] {
  const required = new Set(requiredDimensionsFor(input.purpose, input.profile));
  const facts = input.facts;
  const source: LifecycleCompleteness = facts.failed ? "FAILED" : facts.truncated ? "PARTIAL" : "COMPLETE";

  const content = !facts.primaryPresent
    ? dim("CONTENT", "NOT_SATISFIED", "required primary canonical artifact", "missing", "Required primary artifact is not bound. This is not a technical defect Finding.", [], source)
    : dim("CONTENT", "SATISFIED", "required primary canonical artifact", `${facts.boundCount} bound`, "Required canonical artifact(s) are bound. Content maturity is not engineering correctness.", [], source);

  const trace = !input.definition.traceabilityRequired
    ? dim("TRACEABILITY", "NOT_APPLICABLE", "configured requirement links", "not required", "Traceability is not required for this definition.", [], source)
    : facts.requirementLinked
      ? dim("TRACEABILITY", "SATISFIED", "configured requirement links", "present", "Configured requirement links are present. Identical traceability is not required for every deliverable.", [], source)
      : dim("TRACEABILITY", "NOT_SATISFIED", "configured requirement links", "absent", "Configured requirement trace is missing.", [], source);

  const coord = !input.definition.coordinationRequired
    ? dim("COORDINATION", "NOT_APPLICABLE", "configured interface coordination", "not required", "Coordination is not required for this definition.", [], source)
    : !facts.contributingIdentified
      ? dim("COORDINATION", "NOT_SATISFIED", "contributing disciplines identified", "missing", "Contributing disciplines are not identified.", [], source)
      : facts.interfacesComplete
        ? dim("COORDINATION", "SATISFIED", "required interface information complete", "complete", "Configured interface information is complete. Document count is not coordination.", [], source)
        : dim("COORDINATION", "NOT_SATISFIED", "required interface information complete", "incomplete", "Configured interface information is incomplete. Missing data is not invented.", [], source);

  const review = !input.definition.reviewRequired
    ? dim("REVIEW", "NOT_APPLICABLE", "canonical Review Package", "not required", "Review is not required for this definition. Review still owns Findings.", [], source)
    : !facts.reviewPresent
      ? dim("REVIEW", "NOT_SATISFIED", "canonical Review Package", "absent", "Required Review Package is absent.", [], source)
      : facts.reviewComplete
        ? dim("REVIEW", "SATISFIED", "required Review completed", "complete", "Required Review is complete. That is not technical correctness.", [], source)
        : dim("REVIEW", "PARTIAL", "required Review completed", "underway or incomplete", "Review is present but not complete.", [], source);

  const needsConfig = input.definition.configurationRequired || input.purpose === "FOR_BASELINE" || input.purpose === "FOR_CONSTRUCTION_USE";
  const config = !needsConfig
    ? dim("CONFIGURATION", "NOT_APPLICABLE", "applicable frozen baseline", "not required for this purpose", "Configuration is not required for this purpose. Filenames are not IFC/As-Built authority.", [], source)
    : facts.baselineFrozen
      ? dim("CONFIGURATION", "SATISFIED", "applicable frozen baseline", "frozen", "An applicable frozen Configuration Baseline is present.", [], source)
      : dim("CONFIGURATION", "NOT_SATISFIED", "applicable frozen baseline", "absent or not frozen", "Required frozen Configuration Baseline is not present.", [], source);

  const support = !input.definition.analysisRequired
    ? dim("SUPPORTING_EVIDENCE", "NOT_APPLICABLE", "configured analysis/decision evidence", "not required", "Supporting analysis is not required for this definition.", [], source)
    : facts.analysisStale
      ? dim("SUPPORTING_EVIDENCE", "NOT_SATISFIED", "valid non-stale reviewed analysis", "stale", "Required Analysis Result is stale.", [], source)
      : !facts.analysisPresent
        ? dim("SUPPORTING_EVIDENCE", "NOT_SATISFIED", "valid non-stale reviewed analysis", "absent", "Required Analysis Result is not bound.", [], source)
        : facts.analysisValid && facts.analysisReviewed
          ? dim("SUPPORTING_EVIDENCE", "SATISFIED", "valid non-stale reviewed analysis", "valid and reviewed", "Required Analysis Result is valid and reviewed. No LLM calculation is used.", [], source)
          : dim("SUPPORTING_EVIDENCE", "NOT_SATISFIED", "valid non-stale reviewed analysis", "unreviewed or invalid", "Required Analysis Result is not reviewed or not valid.", [], source);

  const rows = [content, trace, coord, review, config, support];
  return rows.map((row) => {
    if (!required.has(row.dimension) && row.state !== "NOT_APPLICABLE") {
      return { ...row, state: "NOT_APPLICABLE", explanation: `${row.explanation} Dimension is not required for ${input.purpose}.` };
    }
    if (facts.failed && row.state !== "NOT_APPLICABLE") {
      return { ...row, state: "UNKNOWN", sourceCompleteness: "FAILED", explanation: `${row.explanation} Source harvest failed.` };
    }
    if (facts.truncated && row.state === "SATISFIED") {
      return { ...row, sourceCompleteness: "PARTIAL" };
    }
    return { ...row, sourceCompleteness: source };
  });
}

export function readinessFromDimensions(input: {
  dimensions: readonly MaturityDimensionResult[];
  purpose: MaturityPurpose;
  required: readonly MaturityDimension[];
  completeness: LifecycleCompleteness;
  bound: boolean;
  stale?: boolean;
}): DeliverableReadiness {
  if (input.stale) return "STALE";
  if (input.completeness === "FAILED") return "FAILED";
  if (!input.bound) return "INCOMPLETE";
  if (input.completeness === "PARTIAL") return "PARTIAL";
  const applicable = input.dimensions.filter((row) => input.required.includes(row.dimension) && row.state !== "NOT_APPLICABLE");
  if (applicable.some((row) => row.state === "UNKNOWN")) return "FAILED";
  if (applicable.some((row) => row.sourceCompleteness !== "COMPLETE")) return "PARTIAL";
  if (applicable.some((row) => row.state === "NOT_SATISFIED")) return "INCOMPLETE";
  if (applicable.some((row) => row.state === "PARTIAL")) return "PARTIAL";
  if (applicable.every((row) => row.state === "SATISFIED")) {
    return input.purpose === "FOR_ENGINEERING_REVIEW" ? "READY_FOR_REVIEW" : "READY_FOR_CONFIGURED_PURPOSE";
  }
  return "INCOMPLETE";
}

export function completenessFromFacts(facts: DeliverableCanonicalFacts): {
  completeness: LifecycleCompleteness;
  reason: string | null;
} {
  if (facts.failed) return { completeness: "FAILED", reason: facts.failureReason ?? "deliverable_harvest_failed" };
  if (facts.truncated) return { completeness: "PARTIAL", reason: "deliverable_harvest_truncated" };
  return { completeness: "COMPLETE", reason: null };
}

export function assuranceSignalsFrom(input: {
  definition: DeliverableDefinition;
  facts: DeliverableCanonicalFacts;
  dimensions: readonly MaturityDimensionResult[];
}): DeliverableAssuranceSignal[] {
  const signals: DeliverableAssuranceSignal[] = [];
  if (!input.facts.primaryPresent) {
    signals.push({ conditionType: "EXPECTED_DELIVERABLE_MISSING", explanation: `${input.definition.code} has no bound primary artifact.` });
  }
  const review = input.dimensions.find((row) => row.dimension === "REVIEW");
  if (review?.state === "NOT_SATISFIED") {
    signals.push({ conditionType: "DELIVERABLE_REQUIRED_REVIEW_MISSING", explanation: `${input.definition.code} required Review is missing.` });
  }
  if (input.facts.analysisStale) {
    signals.push({ conditionType: "DELIVERABLE_REFERENCES_STALE_EVIDENCE", explanation: `${input.definition.code} references stale analysis evidence.` });
  }
  const config = input.dimensions.find((row) => row.dimension === "CONFIGURATION");
  if (config?.state === "NOT_SATISFIED") {
    signals.push({ conditionType: "DELIVERABLE_CONFIGURATION_GAP", explanation: `${input.definition.code} lacks an applicable frozen baseline.` });
  }
  const coord = input.dimensions.find((row) => row.dimension === "COORDINATION");
  if (coord?.state === "NOT_SATISFIED") {
    signals.push({ conditionType: "DELIVERABLE_INTERFACE_COORDINATION_GAP", explanation: `${input.definition.code} has incomplete configured interface coordination.` });
  }
  return signals;
}

export function applyWaiverToDimensions(
  dimensions: MaturityDimensionResult[],
  waived: { dimension: MaturityDimension; waiverId: string }[],
): MaturityDimensionResult[] {
  return dimensions.map((row) => {
    const match = waived.find((item) => item.dimension === row.dimension);
    if (!match) return row;
    return { ...row, waived: true, waiverId: match.waiverId };
  });
}

export function buildAssessmentShell(input: {
  id: string;
  expectation: DeliverableExpectation;
  definition: DeliverableDefinition;
  profile: DeliverableMaturityProfile;
  purpose: MaturityPurpose;
  dimensions: MaturityDimensionResult[];
  facts: DeliverableCanonicalFacts;
  fingerprint: string;
  thread: string;
  evidenceSource: DeliverableAssessment["evidenceSource"];
  waiverIds?: string[];
  now?: string;
}): DeliverableAssessment {
  const completeness = completenessFromFacts(input.facts);
  const required = requiredDimensionsFor(input.purpose, input.profile);
  const readiness = readinessFromDimensions({
    dimensions: input.dimensions,
    purpose: input.purpose,
    required,
    completeness: completeness.completeness,
    bound: input.facts.primaryPresent || input.facts.boundCount > 0,
  });
  return {
    id: input.id,
    tenantId: input.expectation.tenantId,
    workspaceId: input.expectation.workspaceId,
    expectationId: input.expectation.id,
    maturityProfileId: input.profile.profileId,
    maturityProfileVersion: input.profile.profileVersion,
    intendedPurpose: input.purpose,
    completeness: completeness.completeness,
    readiness,
    truncated: Boolean(input.facts.truncated),
    stale: false,
    evidenceSource: input.evidenceSource,
    evidenceFingerprint: input.fingerprint,
    dimensions: input.dimensions,
    artifactRefs: input.facts.artifactStates.map((row) => ({
      artifactClass: row.artifactClass,
      artifactId: row.artifactId,
      role: "BOUND",
    })),
    assuranceSignals: assuranceSignalsFrom({ definition: input.definition, facts: input.facts, dimensions: input.dimensions }),
    digitalThread: input.thread,
    waiverIds: input.waiverIds ?? [],
    reason: completeness.reason,
    assessedAt: input.now ?? new Date().toISOString(),
    harvestedAt: input.now ?? new Date().toISOString(),
  };
}
