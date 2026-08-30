/**
 * Inspection History is a projection over canonical inspection_* rows.
 * It is not Asset Intelligence history, Twin state history, PI project history,
 * Engineering Core audit, or a second event store.
 */
export type HistoryIndicatorDoc = {
  id: string;
  title: string;
  inputs: readonly string[];
  rule: string;
  comparability: string;
  unknownBehavior: string;
  provenance: string;
};

export const II_HISTORY_INDICATORS = [
  {
    id: "inspections_completed_over_period",
    title: "Inspections completed over period",
    inputs: ["inspection_sessions.id", "inspection_sessions.status", "inspection_sessions.completed_at"],
    rule: "Count sessions whose status is completed, submitted, reviewed, approved, verified, or closed, and whose completed_at (else updated_at) falls in the requested period when a period is supplied.",
    comparability: "Uses recorded session timestamps only. Missing completed_at is not inferred as completed.",
    unknownBehavior: "Sessions without a usable timestamp are period_unknown, not completed.",
    provenance: "inspection_sessions.id",
  },
  {
    id: "inspections_awaiting_verification",
    title: "Inspections awaiting verification",
    inputs: ["inspection_verifications.id", "inspection_verifications.status", "inspection_sessions.id"],
    rule: "Count pending verification rows and distinct sessions that have them.",
    comparability: "Pending is recorded process state, not an automatic fail.",
    unknownBehavior: "No pending row means none recorded, not verified.",
    provenance: "inspection_verifications.id, inspection_sessions.id",
  },
  {
    id: "open_defects_over_time",
    title: "Open defects over time",
    inputs: ["inspection_defects.id", "inspection_defects.status", "inspection_defects.created_at"],
    rule: "Count defects whose recorded status is not closed or cancelled, grouped by UTC day of created_at.",
    comparability: "Uses current recorded status, not a reconstructed status timeline.",
    unknownBehavior: "Missing status is unknown_status. Missing created_at is undated.",
    provenance: "inspection_defects.id",
  },
  {
    id: "repeat_defects_by_target",
    title: "Repeat defects by target",
    inputs: [
      "inspection_defects.id",
      "inspection_defects.taxonomy.defectCategory",
      "inspection_defects.title",
      "inspection_sessions.targets",
    ],
    rule: "Group defects that share the same InspectionTarget canonical identity plus recorded defectCategory (else title). Repeats require two or more sessions.",
    comparability: "Same target kind+canonicalId. Category/title must be recorded; text is not interpreted as a failure mode.",
    unknownBehavior: "Missing target or category/title is not a repeat.",
    provenance: "inspection_defects.id, inspection_sessions.id",
  },
  {
    id: "outstanding_corrective_actions",
    title: "Outstanding inspection corrective actions",
    inputs: ["inspection_corrective_actions.id", "inspection_corrective_actions.status"],
    rule: "Count process records whose status is not closed or cancelled.",
    comparability: "Inspection process records only. Not Engineering Core actions.",
    unknownBehavior: "Missing status is unknown, not outstanding.",
    provenance: "inspection_corrective_actions.id",
  },
  {
    id: "recorded_condition_rating_trend",
    title: "Recorded condition-rating trend",
    inputs: [
      "inspection_condition_ratings.scheme_id",
      "inspection_condition_ratings.payload",
      "inspection_condition_ratings.session_id",
      "inspection_sessions.started_at",
    ],
    rule: "Order ratings with the same scheme_id by session started_at (else generated timestamp). Numeric scores are listed; ordinals are listed as recorded codes.",
    comparability: "Same scheme_id required. Mixed schemes are not compared. Deterioration rate is not computed from ordinals.",
    unknownBehavior: "Unrated sessions stay unrated. Missing observed value is unknown_value.",
    provenance: "inspection_condition_ratings.rating_id",
  },
  {
    id: "evidence_completeness",
    title: "Evidence registration completeness",
    inputs: ["inspection_sessions.id", "inspection_sessions.status", "inspection_evidence.session_id"],
    rule: "In-progress or completed sessions with zero registered evidence vs those with at least one evidence row.",
    comparability: "Registration count only. File bytes remain in Platform Files.",
    unknownBehavior: "Zero evidence is unset, not a failed result.",
    provenance: "inspection_sessions.id, inspection_evidence.id",
  },
] as const satisfies readonly HistoryIndicatorDoc[];

export type HistoryFilter = {
  targetKind?: string;
  targetCanonicalId?: string;
  planId?: string;
  sessionId?: string;
  from?: string;
  to?: string;
  inspectionType?: string;
};

export type HistoryTarget = {
  id?: string;
  kind?: string;
  canonicalId?: string;
  snapshot?: { label?: string; capturedAt?: string };
};

function targetsOf(row: Record<string, unknown>): HistoryTarget[] {
  return Array.isArray(row.targets) ? (row.targets as HistoryTarget[]) : [];
}

function sessionAt(row: Record<string, unknown>): string {
  return String(row.started_at ?? row.completed_at ?? row.created_at ?? row.updated_at ?? "");
}

export function sessionMatchesHistoryFilter(
  session: Record<string, unknown>,
  filter: HistoryFilter,
  inspectionType?: string,
): boolean {
  if (filter.sessionId && String(session.id) !== filter.sessionId) return false;
  if (filter.planId && String(session.plan_id ?? "") !== filter.planId) return false;
  if (filter.inspectionType && inspectionType !== filter.inspectionType) return false;
  const at = sessionAt(session);
  if (filter.from && (!at || at < filter.from)) return false;
  if (filter.to && (!at || at > filter.to)) return false;
  if (filter.targetKind || filter.targetCanonicalId) {
    const match = targetsOf(session).some((target) => {
      if (filter.targetKind && target.kind !== filter.targetKind) return false;
      if (filter.targetCanonicalId && target.canonicalId !== filter.targetCanonicalId) return false;
      return true;
    });
    if (!match) return false;
  }
  return true;
}

export function projectInspectionHistory(input: {
  sessions: Array<Record<string, unknown>>;
  plans?: Array<Record<string, unknown>>;
  templates?: Array<Record<string, unknown>>;
  filter?: HistoryFilter;
}) {
  const plans = new Map((input.plans ?? []).map((row) => [String(row.id), row]));
  const templates = new Map((input.templates ?? []).map((row) => [String(row.id), row]));
  const filter = input.filter ?? {};
  const rows = input.sessions
    .filter((session) => {
      const plan = plans.get(String(session.plan_id ?? ""));
      const template = templates.get(String(plan?.template_id ?? ""));
      const inspectionType = String(template?.pack_id ?? plan?.frequency ?? "");
      return sessionMatchesHistoryFilter(session, filter, inspectionType || undefined);
    })
    .sort((a, b) => sessionAt(b).localeCompare(sessionAt(a)))
    .map((session) => {
      const plan = plans.get(String(session.plan_id ?? ""));
      const template = templates.get(String(plan?.template_id ?? ""));
      return {
        sessionId: String(session.id),
        planId: session.plan_id ? String(session.plan_id) : undefined,
        planTitle: plan?.title ? String(plan.title) : undefined,
        inspectionType: template?.pack_id ? String(template.pack_id) : undefined,
        status: String(session.status ?? "unknown"),
        startedAt: session.started_at ? String(session.started_at) : undefined,
        completedAt: session.completed_at ? String(session.completed_at) : undefined,
        createdAt: session.created_at ? String(session.created_at) : undefined,
        actorUnknown: true,
        targets: targetsOf(session),
        provenance: {
          sessionId: String(session.id),
          planId: session.plan_id ? String(session.plan_id) : undefined,
        },
      };
    });
  return {
    projection: "inspection_history_over_canonical_sessions",
    not: [
      "asset_intelligence_history",
      "digital_twin_state_history",
      "project_intelligence_history",
      "engineering_core_audit",
      "knowledge_graph",
    ],
    rows,
  };
}

export function buildTargetTimeline(input: {
  sessions: Array<Record<string, unknown>>;
  observations?: Array<Record<string, unknown>>;
  measurements?: Array<Record<string, unknown>>;
  evidence?: Array<Record<string, unknown>>;
  defects?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  correctiveActions?: Array<Record<string, unknown>>;
  assessments?: Array<Record<string, unknown>>;
  conditionRatings?: Array<Record<string, unknown>>;
  verifications?: Array<Record<string, unknown>>;
}) {
  const sessionIds = new Set(input.sessions.map((row) => String(row.id)));
  const events: Array<{
    at: string;
    kind: string;
    id: string;
    sessionId: string;
    summary: string;
  }> = [];
  const push = (
    kind: string,
    rows: Array<Record<string, unknown>> | undefined,
    at: (row: Record<string, unknown>) => string,
    summary: (row: Record<string, unknown>) => string,
  ) => {
    for (const row of rows ?? []) {
      const sessionId = String(row.session_id ?? row.id ?? "");
      if (!sessionIds.has(sessionId) && kind !== "session") continue;
      events.push({
        at: at(row) || "unknown",
        kind,
        id: String(row.id ?? row.rating_id ?? ""),
        sessionId: kind === "session" ? String(row.id) : sessionId,
        summary: summary(row),
      });
    }
  };
  push("session", input.sessions, sessionAt, (row) => `session ${String(row.status ?? "unknown")}`);
  push("observation", input.observations, (row) => String(row.recorded_at ?? ""), (row) => String(row.checklist_item_type ?? "observation"));
  push("measurement", input.measurements, (row) => String(row.recorded_at ?? ""), (row) => `${String(row.measurement_type)} = ${JSON.stringify(row.observed_value)}`);
  push("evidence", input.evidence, (row) => String((row.provenance as { capturedAt?: string } | undefined)?.capturedAt ?? row.created_at ?? ""), (row) => String(row.kind ?? "evidence"));
  push("defect", input.defects, (row) => String(row.created_at ?? row.updated_at ?? ""), (row) => `${String(row.title ?? row.id)} (${String(row.status ?? "unknown")})`);
  push("recommendation", input.recommendations, (row) => String(row.created_at ?? row.updated_at ?? ""), (row) => String(row.action ?? "recommendation"));
  push("corrective_action", input.correctiveActions, (row) => String(row.updated_at ?? row.created_at ?? ""), (row) => `${String(row.description ?? row.id)} (${String(row.status ?? "unknown")})`);
  push("assessment", input.assessments, (row) => String(row.created_at ?? ""), (row) => String(row.title ?? "assessment"));
  push("condition_rating", input.conditionRatings, (row) => {
    const payload = row.payload && typeof row.payload === "object" ? (row.payload as { assessedAt?: string }) : {};
    return String(payload.assessedAt ?? row.created_at ?? "");
  }, (row) => `${String(row.scheme_id ?? "scheme")} ${String(row.review_state ?? "")}`.trim());
  push("verification", input.verifications, (row) => String(row.updated_at ?? row.created_at ?? ""), (row) => `${String(row.kind)} ${String(row.status)}`);
  return events
    .filter((event) => event.at && event.at !== "unknown")
    .sort((a, b) => a.at.localeCompare(b.at));
}

function numericObserved(row: Record<string, unknown>): number | undefined {
  const value = row.observed_value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

export function computeChangeOverTime(input: {
  sessions: Array<Record<string, unknown>>;
  defects: Array<Record<string, unknown>>;
  measurements: Array<Record<string, unknown>>;
  conditionRatings: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  verifications: Array<Record<string, unknown>>;
}) {
  const sessionAtById = new Map(input.sessions.map((row) => [String(row.id), sessionAt(row)]));
  const ratingsByScheme: Record<string, Array<{ at: string; ratingId: string; sessionId: string; ordinalCode?: string; numericScore?: number }>> = {};
  for (const row of input.conditionRatings) {
    const payload = row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : {};
    const observed = payload.observed && typeof payload.observed === "object"
      ? (payload.observed as { ordinalCode?: string; numericScore?: number })
      : {};
    const scheme = String(row.scheme_id ?? payload.schemeId ?? "unknown_scheme");
    const sessionId = String(row.session_id ?? "");
    ratingsByScheme[scheme] ??= [];
    ratingsByScheme[scheme].push({
      at: String((payload as { assessedAt?: string }).assessedAt ?? sessionAtById.get(sessionId) ?? ""),
      ratingId: String(row.rating_id ?? row.id ?? ""),
      sessionId,
      ordinalCode: observed.ordinalCode,
      numericScore: typeof observed.numericScore === "number" ? observed.numericScore : undefined,
    });
  }
  for (const series of Object.values(ratingsByScheme)) {
    series.sort((a, b) => a.at.localeCompare(b.at));
  }

  const measurementSeries: Record<string, Array<{ at: string; id: string; sessionId: string; value?: number; unit?: string; comparable: boolean }>> = {};
  for (const row of input.measurements) {
    const key = `${String(row.measurement_type)}|${String(row.unit ?? "")}`;
    const value = numericObserved(row);
    measurementSeries[key] ??= [];
    measurementSeries[key].push({
      at: String(row.recorded_at ?? sessionAtById.get(String(row.session_id ?? "")) ?? ""),
      id: String(row.id),
      sessionId: String(row.session_id ?? ""),
      value,
      unit: row.unit ? String(row.unit) : undefined,
      comparable: value !== undefined && Boolean(row.recorded_at),
    });
  }
  const measurementDeltas: Array<{ key: string; delta: number; elapsedMs: number; provenanceIds: string[]; note: string }> = [];
  for (const [key, series] of Object.entries(measurementSeries)) {
    const comparable = series.filter((point) => point.comparable && point.value !== undefined).sort((a, b) => a.at.localeCompare(b.at));
    if (comparable.length < 2) continue;
    const first = comparable[0];
    const last = comparable[comparable.length - 1];
    const elapsedMs = new Date(last.at).getTime() - new Date(first.at).getTime();
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) continue;
    measurementDeltas.push({
      key,
      delta: (last.value as number) - (first.value as number),
      elapsedMs,
      provenanceIds: [first.id, last.id],
      note: "Deterministic numeric delta for like-for-like measurement_type and unit. Not a deterioration rate and not a causal claim.",
    });
  }

  const repeats: Array<{ key: string; count: number; defectIds: string[]; sessionIds: string[] }> = [];
  const grouped = new Map<string, { defectIds: string[]; sessionIds: Set<string> }>();
  for (const defect of input.defects) {
    const session = input.sessions.find((row) => String(row.id) === String(defect.session_id));
    const target = session ? targetsOf(session)[0] : undefined;
    const taxonomy = defect.taxonomy && typeof defect.taxonomy === "object"
      ? (defect.taxonomy as { defectCategory?: string })
      : {};
    const identity = taxonomy.defectCategory || String(defect.title ?? "").trim().toLowerCase();
    if (!target?.kind || !target.canonicalId || !identity) continue;
    const key = `${target.kind}:${target.canonicalId}:${identity}`;
    const bucket = grouped.get(key) ?? { defectIds: [], sessionIds: new Set<string>() };
    bucket.defectIds.push(String(defect.id));
    bucket.sessionIds.add(String(defect.session_id));
    grouped.set(key, bucket);
  }
  for (const [key, bucket] of grouped) {
    if (bucket.sessionIds.size < 2) continue;
    repeats.push({ key, count: bucket.defectIds.length, defectIds: bucket.defectIds, sessionIds: [...bucket.sessionIds] });
  }

  return {
    conditionRatingHistory: ratingsByScheme,
    defectCurrentStates: input.defects.map((row) => ({
      id: String(row.id),
      status: row.status ? String(row.status) : "unknown",
      sessionId: String(row.session_id ?? ""),
      note: "Current recorded status only. Defect transition events are not a reconstructed timeline.",
    })),
    measurementHistory: measurementSeries,
    measurementDeltas,
    correctiveActionCurrentStates: input.correctiveActions.map((row) => ({
      id: String(row.id),
      status: row.status ? String(row.status) : "unknown",
      sessionId: String(row.session_id ?? ""),
    })),
    evidenceVerificationHistory: {
      evidenceIds: input.evidence.map((row) => String(row.id)),
      verificationIds: input.verifications.map((row) => String(row.id)),
    },
    repeatDefects: repeats,
  };
}

const COMPLETED = new Set(["completed", "submitted", "reviewed", "approved", "verified", "closed"]);
const CLOSED_DEFECT = new Set(["closed", "cancelled"]);
const CLOSED_CA = new Set(["closed", "cancelled"]);
const IN_PROGRESS = new Set(["assigned", "started", "paused"]);

export function computeHistoryIntelligence(input: {
  sessions: Array<Record<string, unknown>>;
  defects: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  verifications: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  conditionRatings: Array<Record<string, unknown>>;
  from?: string;
  to?: string;
}) {
  const inPeriod = (at: string | undefined) => {
    if (!at) return false;
    if (input.from && at < input.from) return false;
    if (input.to && at > input.to) return false;
    return true;
  };
  const completed = input.sessions.filter((row) => COMPLETED.has(String(row.status ?? "")));
  const completedDated = completed.filter((row) => inPeriod(String(row.completed_at ?? row.updated_at ?? "")));
  const periodUnknown = completed.filter((row) => !String(row.completed_at ?? row.updated_at ?? "")).length;
  const pending = input.verifications.filter((row) => row.status === "pending");
  const openByDay: Record<string, number> = {};
  let unknownStatus = 0;
  let undated = 0;
  for (const row of input.defects) {
    if (!row.status) {
      unknownStatus += 1;
      continue;
    }
    if (CLOSED_DEFECT.has(String(row.status))) continue;
    const day = String(row.created_at ?? "").slice(0, 10);
    if (!day) {
      undated += 1;
      continue;
    }
    openByDay[day] = (openByDay[day] ?? 0) + 1;
  }
  const change = computeChangeOverTime({
    sessions: input.sessions,
    defects: input.defects,
    measurements: [],
    conditionRatings: input.conditionRatings,
    correctiveActions: input.correctiveActions,
    evidence: input.evidence,
    verifications: input.verifications,
  });
  const inPlay = input.sessions.filter((row) => IN_PROGRESS.has(String(row.status)) || COMPLETED.has(String(row.status)));
  const evidenceBySession = new Map<string, number>();
  for (const row of input.evidence) {
    const id = String(row.session_id ?? "");
    evidenceBySession.set(id, (evidenceBySession.get(id) ?? 0) + 1);
  }
  return {
    indicators: II_HISTORY_INDICATORS,
    inspectionsCompletedOverPeriod: {
      value: completedDated.length,
      periodUnknown,
      provenanceIds: completedDated.map((row) => String(row.id)),
    },
    inspectionsAwaitingVerification: {
      pendingVerifications: pending.length,
      sessions: new Set(pending.map((row) => String(row.session_id))).size,
      verificationIds: pending.map((row) => String(row.id)),
    },
    openDefectsOverTime: { byDay: openByDay, unknownStatus, undated },
    repeatDefectsByTarget: change.repeatDefects,
    outstandingCorrectiveActions: {
      value: input.correctiveActions.filter((row) => row.status && !CLOSED_CA.has(String(row.status))).length,
      provenanceIds: input.correctiveActions
        .filter((row) => row.status && !CLOSED_CA.has(String(row.status)))
        .map((row) => String(row.id)),
    },
    recordedConditionRatingTrend: change.conditionRatingHistory,
    evidenceCompleteness: {
      sessionsConsidered: inPlay.length,
      withoutRegisteredEvidence: inPlay.filter((row) => (evidenceBySession.get(String(row.id)) ?? 0) === 0).length,
      note: "Zero registered evidence is unset, not a failed result.",
    },
  };
}
