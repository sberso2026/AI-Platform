import { AI_INSPECTION_ENGINEER_CAPABILITY, ENGINEER_KNOWN_LIMITATIONS } from "./capability";
import { fact, deterministic, interpretation, unknown, limitation, containsUnsafeAiOverlay } from "./claims";
import { deriveUnknowns } from "./context";
import { detectPromptInjection, routeEngineerIntent } from "./intent";
import { assertAiInspectionEngineerOwnershipLocks } from "./ownership";
import { cite, listIiEngineerPlatformTools } from "./tools";
import type {
  EngineerAnswer,
  EngineerClaim,
  EngineerContext,
  EngineerIntent,
  IiEngineerPlatformToolKey,
} from "./types";

export type AnswerEngineerQuestionInput = {
  context: EngineerContext;
  question: string;
  aiAvailable?: boolean;
  aiProvider?: string;
  aiModel?: string;
  aiSummaryText?: string;
  directorRunId?: string;
  overlaySkippedReason?: string;
  promptKey?: string;
  promptVersion?: string;
  profile?: EngineerAnswer["profile"];
};

const INTENT_TOOLS: Record<EngineerIntent, readonly IiEngineerPlatformToolKey[]> = {
  summary: [
    "inspection_intelligence.get_inspection",
    "inspection_intelligence.get_session",
    "inspection_intelligence.get_deterministic_indicators",
  ],
  defects: ["inspection_intelligence.get_defects"],
  condition: ["inspection_intelligence.get_condition_assessment"],
  measurements: ["inspection_intelligence.get_measurements"],
  evidence: ["inspection_intelligence.get_evidence"],
  missing: [
    "inspection_intelligence.get_session",
    "inspection_intelligence.get_evidence",
    "inspection_intelligence.get_condition_assessment",
    "inspection_intelligence.get_deterministic_indicators",
  ],
  recommendations: [
    "inspection_intelligence.get_recommendations",
    "inspection_intelligence.get_corrective_actions",
  ],
  history: ["inspection_intelligence.get_target_history"],
  indicators: ["inspection_intelligence.get_deterministic_indicators"],
  report_draft: ["inspection_intelligence.get_report_snapshot"],
  question: [
    "inspection_intelligence.get_session",
    "inspection_intelligence.get_defects",
    "inspection_intelligence.get_deterministic_indicators",
  ],
  injection: [],
  mutation: [],
  certification: [],
  remaining_life: [],
};

const STARTERS = [
  "Summarize this inspection.",
  "What defects are recorded?",
  "What condition information is recorded?",
  "What evidence is registered?",
  "What information is missing?",
  "Compare inspection history for this target.",
  "Draft a non-authoritative report narrative from the snapshot.",
];

function sessionCite(context: EngineerContext) {
  return context.session
    ? [cite("inspection_session", context.session.id, `session ${context.session.status}`, context.session.startedAt)]
    : [];
}

function buildClaims(intent: EngineerIntent, context: EngineerContext): EngineerClaim[] {
  const session = sessionCite(context);
  const unknowns = deriveUnknowns(context);

  if (intent === "injection") {
    return [limitation("The request was treated as prompt injection and was not executed against inspection records.")];
  }
  if (intent === "mutation") {
    return [
      limitation("AI Inspection Engineer is read-first and advisory. It cannot approve, close, publish, or mutate canonical inspection records."),
    ];
  }
  if (intent === "certification") {
    return [
      limitation("The assistant must not imply professional certification or approval authority."),
      limitation("Allowed interpretation may only note that recorded facts may warrant engineering review."),
    ];
  }
  if (intent === "remaining_life") {
    return [
      limitation("II-5 does not introduce remaining-life, deterioration-rate, or failure-probability models."),
      unknown("Remaining life is UNKNOWN. No approved canonical engineering method is published for this statement."),
    ];
  }

  if (intent === "missing") {
    return unknowns.length
      ? unknowns.map((row) => unknown(row, session))
      : [fact("No additional missing-data flags were derived beyond published limitations.", session)];
  }

  if (intent === "defects") {
    if (!context.defects.length) {
      return [unknown("No inspection defects are recorded for the current context.", session)];
    }
    return context.defects.slice(0, 12).map((row) =>
      fact(`Defect ${row.id}: ${row.summary} (status ${row.status ?? "unknown"}).`, [
        cite("inspection_defect", row.id, row.summary, row.at),
      ]),
    );
  }

  if (intent === "condition") {
    if (!context.conditionRatings.length) {
      return [unknown("No condition rating is recorded. Unrated remains unrated.", session)];
    }
    return [
      ...context.conditionRatings.slice(0, 8).map((row) =>
        fact(`Recorded condition information: ${row.summary}.`, [cite("inspection_condition_rating", row.id, row.summary, row.at)]),
      ),
      interpretation("The recorded rating and related observations may warrant engineering review. This is not a certification that the asset is safe."),
    ];
  }

  if (intent === "measurements") {
    if (!context.measurements.length) {
      return [unknown("No measurements are recorded. Observed values remain UNKNOWN.", session)];
    }
    return context.measurements.slice(0, 12).map((row) =>
      fact(`Measurement ${row.id}: ${row.summary}.`, [cite("inspection_measurement", row.id, row.summary, row.at)]),
    );
  }

  if (intent === "evidence") {
    if (!context.evidence.length) {
      return [unknown("No evidence is registered. Zero evidence is unset, not a failed result.", session)];
    }
    return context.evidence.slice(0, 12).map((row) =>
      fact(`Evidence ${row.id}: ${row.summary}.`, [cite("inspection_evidence", row.id, row.summary, row.at)]),
    );
  }

  if (intent === "recommendations") {
    const recs = context.recommendations.map((row) =>
      fact(`Recommendation ${row.id}: ${row.summary}.`, [cite("inspection_recommendation", row.id, row.summary, row.at)]),
    );
    const actions = context.correctiveActions.map((row) =>
      fact(`Corrective action ${row.id}: ${row.summary} (status ${row.status ?? "unknown"}).`, [
        cite("inspection_corrective_action", row.id, row.summary, row.at),
      ]),
    );
    if (!recs.length && !actions.length) {
      return [unknown("No recommendations or inspection corrective actions are recorded.", session)];
    }
    return [...recs, ...actions];
  }

  if (intent === "history") {
    if (!context.history.length) {
      return [unknown("No inspection-derived history events are available for the selected target. Continuity is not inferred.", session)];
    }
    return [
      fact(`${context.history.length} inspection-derived history events are recorded for the selected target.`, session),
      ...context.history.slice(0, 10).map((row) =>
        fact(`${row.kind}: ${row.summary}.`, [cite(row.kind, row.id, row.summary, row.at)]),
      ),
      limitation("Historical comparison does not invent a deterioration model. Like-for-like numeric deltas exist only when measurement type, unit, and timestamps are comparable."),
    ];
  }

  if (intent === "indicators") {
    return [
      deterministic(
        `Deterministic indicators from recorded inspection rows: open defects ${context.indicators.openDefects ?? "UNKNOWN"} (unknown status ${context.indicators.unknownDefectStatus ?? 0}); outstanding corrective actions ${context.indicators.outstandingCorrectiveActions ?? "UNKNOWN"}; pending verifications ${context.indicators.pendingVerifications ?? "UNKNOWN"}; sessions without registered evidence ${context.indicators.sessionsWithoutEvidence ?? "UNKNOWN"}; unrated sessions ${context.indicators.unratedSessions ?? "UNKNOWN"}.`,
        session,
      ),
      limitation("These counts are derived from recorded statuses only. They are not a health score or probability."),
    ];
  }

  if (intent === "report_draft") {
    if (!context.report) {
      return [unknown("No deterministic report snapshot is bound. A draft narrative cannot be invented.", session)];
    }
    const reportCite = [cite("inspection_reporting_output", context.report.id, context.report.title ?? context.report.reportKey)];
    return [
      fact(
        `Deterministic snapshot ${context.report.id} (${context.report.reportKey}) remains canonical. Authority is ${context.report.authority ?? "unknown"}.`,
        reportCite,
      ),
      interpretation(
        "AI-assisted draft narrative: this wording restates snapshot facts for review. It is not an approved inspection report and must not be auto-published.",
        reportCite,
      ),
      ...(context.report.limitations.length
        ? context.report.limitations.map((row) => unknown(row, reportCite))
        : []),
    ];
  }

  const summaryBits = [
    context.session
      ? `Inspection session ${context.session.id} is recorded as ${context.session.status}${context.session.planTitle ? ` under plan ${context.session.planTitle}` : ""}.`
      : "No inspection session is bound.",
    `Recorded counts: observations ${context.observations.length}, measurements ${context.measurements.length}, evidence ${context.evidence.length}, defects ${context.defects.length}, condition ratings ${context.conditionRatings.length}.`,
  ];
  return [
    fact(summaryBits[0], session),
    deterministic(summaryBits[1], session),
    ...unknowns.slice(0, 4).map((row) => unknown(row, session)),
    interpretation("Recorded inspection facts may warrant human engineering review. This is not a statement that the asset is safe or that remediation is unnecessary."),
  ];
}

export function answerEngineerQuestion(input: AnswerEngineerQuestionInput): EngineerAnswer {
  assertAiInspectionEngineerOwnershipLocks();
  const intent = routeEngineerIntent(input.question);
  const refused =
    intent === "injection" ||
    intent === "mutation" ||
    intent === "certification" ||
    intent === "remaining_life";
  const claims = [...buildClaims(intent, input.context)];
  if (
    input.aiSummaryText &&
    !containsUnsafeAiOverlay(input.aiSummaryText) &&
    !detectPromptInjection(input.aiSummaryText) &&
    !refused
  ) {
    claims.push(
      interpretation(`Advisory phrasing from Platform AI Director (not canonical fact): ${input.aiSummaryText.slice(0, 800)}`),
    );
  }
  const citations = claims.flatMap((claim) => claim.citations);
  const unique = citations.filter(
    (cite, index) => citations.findIndex((row) => row.entityId === cite.entityId && row.entityType === cite.entityType) === index,
  );
  const facts = claims
    .filter((row) => row.kind === "FACT" || row.kind === "DETERMINISTIC_RESULT")
    .map((row) => row.text);
  const interpretations = claims.filter((row) => row.kind === "AI_INTERPRETATION").map((row) => row.text);
  const unknowns = [
    ...input.context.unknowns,
    ...claims.filter((row) => row.kind === "UNKNOWN").map((row) => row.text),
  ].filter((row, index, all) => all.indexOf(row) === index);
  const limitations = [
    ...ENGINEER_KNOWN_LIMITATIONS,
    ...input.context.limitations,
    ...claims.filter((row) => row.kind === "LIMITATION").map((row) => row.text),
  ].filter((row, index, all) => all.indexOf(row) === index);
  const summary = facts[0] ?? claims[0]?.text ?? "No authorized inspection facts are available.";
  const confidenceBasis = unique.length
    ? `Grounded in ${unique.length} inspection source identifier(s) from records the caller can already read. Not a probability.`
    : "Insufficient inspection source identifiers. Statements are UNKNOWN or limitations, not probability.";

  return {
    capability: AI_INSPECTION_ENGINEER_CAPABILITY,
    intent,
    toolsUsed: INTENT_TOOLS[intent],
    answer: claims.map((claim) => `[${claim.kind}] ${claim.text}`).join(" "),
    summary,
    facts,
    interpretations,
    unknowns: unknowns.slice(0, 12),
    limitations: limitations.slice(0, 12),
    evidenceRefs: unique.filter((row) => row.entityType === "inspection_evidence"),
    inspectionRefs: unique,
    claims,
    confidenceBasis,
    starterQuestions: STARTERS,
    navigation: [
      { label: "AI Inspection Engineer", path: "/engineering/apps/inspection-intelligence/engineer" },
      ...(input.context.session
        ? [{ label: "Session", path: `/engineering/apps/inspection-intelligence/sessions/${input.context.session.id}` }]
        : []),
      ...(input.context.report
        ? [{ label: "Report snapshot", path: `/engineering/apps/inspection-intelligence/reports/${input.context.report.id}` }]
        : []),
    ],
    advisory: true,
    readOnly: true,
    mutationEnabled: false,
    autonomousApprovalEnabled: false,
    aiOptional: true,
    aiAvailable: Boolean(input.aiAvailable),
    aiProvider: input.aiProvider,
    aiModel: input.aiModel,
    directorRunId: input.directorRunId,
    overlaySkippedReason: input.overlaySkippedReason,
    promptKey: input.promptKey,
    promptVersion: input.promptVersion,
    refused,
    refusedReason:
      intent === "injection"
        ? "prompt_injection"
        : intent === "mutation"
          ? "mutation_request"
          : intent === "certification"
            ? "certification_authority_refused"
            : intent === "remaining_life"
              ? "remaining_life_model_absent"
              : undefined,
    profile: input.profile,
  };
}

export function engineerCapabilityDescriptor() {
  return {
    capability: AI_INSPECTION_ENGINEER_CAPABILITY,
    tools: listIiEngineerPlatformTools(),
    aiOptional: true,
    mutationEnabled: false,
    autonomousApprovalEnabled: false,
    memory: "session_bounded" as const,
    starterQuestions: STARTERS,
  };
}
