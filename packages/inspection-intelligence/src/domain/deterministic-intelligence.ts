/**
 * Deterministic Inspection Intelligence views over canonical inspection_* rows.
 * Not a health score, probability, or second truth model.
 */
export type DeterministicIndicatorDoc = {
  id: string;
  title: string;
  inputs: readonly string[];
  rule: string;
  unknownBehavior: string;
  provenance: string;
};

export const II_DETERMINISTIC_INDICATORS = [
  {
    id: "open_defect_count",
    title: "Open inspection defects",
    inputs: ["inspection_defects.id", "inspection_defects.status"],
    rule: "Count defects whose status is not closed or cancelled.",
    unknownBehavior: "Rows with missing status are counted as unknown_status, not as open or healthy.",
    provenance: "inspection_defects.id",
  },
  {
    id: "defects_by_recorded_severity",
    title: "Defects by recorded severity",
    inputs: ["inspection_defects.id", "inspection_defects.taxonomy.severity"],
    rule: "Group by taxonomy.severity when that canonical field is present.",
    unknownBehavior: "Missing taxonomy.severity is unknown, never inferred from title/description.",
    provenance: "inspection_defects.id",
  },
  {
    id: "unverified_defects",
    title: "Unverified defects",
    inputs: [
      "inspection_defects.id",
      "inspection_defects.status",
      "inspection_verifications.kind",
      "inspection_verifications.subject_id",
      "inspection_verifications.status",
    ],
    rule: "Defects in awaiting_verification, or with no passed verification of kind defect.",
    unknownBehavior: "Absence of a verification row is unset, not failed.",
    provenance: "inspection_defects.id, inspection_verifications.id",
  },
  {
    id: "outstanding_corrective_actions",
    title: "Outstanding inspection corrective actions",
    inputs: ["inspection_corrective_actions.id", "inspection_corrective_actions.status"],
    rule: "Count process records whose status is not closed or cancelled.",
    unknownBehavior: "These are inspection process records, not Engineering Core actions.",
    provenance: "inspection_corrective_actions.id",
  },
  {
    id: "evidence_completeness",
    title: "Evidence registration completeness",
    inputs: ["inspection_sessions.id", "inspection_sessions.status", "inspection_evidence.session_id"],
    rule: "In-progress sessions with zero registered evidence vs those with at least one evidence row.",
    unknownBehavior: "Zero evidence is unset, not a failed inspection result.",
    provenance: "inspection_sessions.id, inspection_evidence.id",
  },
  {
    id: "condition_rating_distribution",
    title: "Recorded condition ratings",
    inputs: [
      "inspection_condition_ratings.rating_id",
      "inspection_condition_ratings.scheme_id",
      "inspection_condition_ratings.payload",
    ],
    rule: "Count ratings by recorded scheme and observed ordinal/numeric value.",
    unknownBehavior: "Sessions with no rating remain unrated. Missing values are not converted to good/pass.",
    provenance: "inspection_condition_ratings.rating_id, inspection_condition_ratings.session_id",
  },
  {
    id: "inspections_awaiting_verification",
    title: "Inspections awaiting verification",
    inputs: ["inspection_verifications.id", "inspection_verifications.status", "inspection_sessions.id"],
    rule: "Count pending verification rows and distinct sessions that have them.",
    unknownBehavior: "No pending row means none recorded, not automatically verified.",
    provenance: "inspection_verifications.id, inspection_sessions.id",
  },
] as const satisfies readonly DeterministicIndicatorDoc[];

const CLOSED_DEFECT = new Set(["closed", "cancelled"]);
const CLOSED_CA = new Set(["closed", "cancelled"]);
const IN_PROGRESS_SESSION = new Set(["assigned", "started", "paused"]);

export type DeterministicIntelligenceInput = {
  defects: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  verifications: Array<Record<string, unknown>>;
  sessions: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  conditionRatings: Array<Record<string, unknown>>;
};

export function computeDeterministicIntelligence(input: DeterministicIntelligenceInput) {
  const unknownStatusDefects = input.defects.filter((row) => !row.status).map((row) => String(row.id));
  const openDefects = input.defects.filter((row) => row.status && !CLOSED_DEFECT.has(String(row.status)));
  const severity: Record<string, number> = {};
  let unknownSeverity = 0;
  const unknownSeverityIds: string[] = [];
  for (const row of input.defects) {
    const taxonomy = row.taxonomy && typeof row.taxonomy === "object" ? (row.taxonomy as { severity?: string }) : {};
    if (!taxonomy.severity) {
      unknownSeverity += 1;
      unknownSeverityIds.push(String(row.id));
      continue;
    }
    severity[taxonomy.severity] = (severity[taxonomy.severity] ?? 0) + 1;
  }

  const passedDefectVerification = new Set(
    input.verifications
      .filter((row) => row.kind === "defect" && row.status === "passed")
      .map((row) => String(row.subject_id)),
  );
  const unverified = input.defects.filter((row) => {
    if (CLOSED_DEFECT.has(String(row.status ?? ""))) return false;
    if (String(row.status) === "awaiting_verification") return true;
    return !passedDefectVerification.has(String(row.id));
  });

  const outstandingCa = input.correctiveActions.filter(
    (row) => row.status && !CLOSED_CA.has(String(row.status)),
  );

  const evidenceBySession = new Map<string, number>();
  for (const row of input.evidence) {
    const sessionId = String(row.session_id ?? "");
    evidenceBySession.set(sessionId, (evidenceBySession.get(sessionId) ?? 0) + 1);
  }
  const inProgress = input.sessions.filter((row) => IN_PROGRESS_SESSION.has(String(row.status)));
  const withoutEvidence = inProgress.filter((row) => (evidenceBySession.get(String(row.id)) ?? 0) === 0);
  const withEvidence = inProgress.filter((row) => (evidenceBySession.get(String(row.id)) ?? 0) > 0);

  const ratingDistribution: Record<string, number> = {};
  for (const row of input.conditionRatings) {
    const payload = row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : {};
    const observed = payload.observed && typeof payload.observed === "object"
      ? (payload.observed as { ordinalCode?: string; numericScore?: number })
      : {};
    const key =
      observed.ordinalCode ??
      (typeof observed.numericScore === "number" ? String(observed.numericScore) : "unknown_value");
    const scheme = String(row.scheme_id ?? payload.schemeId ?? "unknown_scheme");
    const bucket = `${scheme}:${key}`;
    ratingDistribution[bucket] = (ratingDistribution[bucket] ?? 0) + 1;
  }
  const ratedSessionIds = new Set(input.conditionRatings.map((row) => String(row.session_id ?? "")));
  const unratedSessions = input.sessions.filter((row) => !ratedSessionIds.has(String(row.id)));

  const pendingVerifications = input.verifications.filter((row) => row.status === "pending");
  const sessionsAwaiting = new Set(pendingVerifications.map((row) => String(row.session_id)));

  return {
    indicators: II_DETERMINISTIC_INDICATORS,
    openDefectCount: {
      value: openDefects.length,
      unknownStatus: unknownStatusDefects.length,
      provenanceIds: openDefects.map((row) => String(row.id)),
    },
    defectsByRecordedSeverity: {
      counts: severity,
      unknownSeverity,
      unknownProvenanceIds: unknownSeverityIds,
    },
    unverifiedDefects: {
      value: unverified.length,
      provenanceIds: unverified.map((row) => String(row.id)),
    },
    outstandingCorrectiveActions: {
      value: outstandingCa.length,
      provenanceIds: outstandingCa.map((row) => String(row.id)),
      note: "Inspection corrective-action process records. Not Engineering Core actions.",
    },
    evidenceCompleteness: {
      inProgressSessions: inProgress.length,
      withRegisteredEvidence: withEvidence.length,
      withoutRegisteredEvidence: withoutEvidence.length,
      withoutEvidenceSessionIds: withoutEvidence.map((row) => String(row.id)),
      note: "Zero registered evidence is unset, not a failed result.",
    },
    conditionRatingDistribution: {
      counts: ratingDistribution,
      recordedRatings: input.conditionRatings.length,
      unratedSessions: unratedSessions.length,
      unratedSessionIds: unratedSessions.map((row) => String(row.id)).slice(0, 50),
      note: "Unrated remains unrated. No missing-to-good conversion.",
    },
    inspectionsAwaitingVerification: {
      pendingVerifications: pendingVerifications.length,
      sessions: sessionsAwaiting.size,
      verificationIds: pendingVerifications.map((row) => String(row.id)),
      sessionIds: [...sessionsAwaiting],
    },
  };
}
