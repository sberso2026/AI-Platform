import { ANALYST_KNOWN_LIMITATIONS, AI_PROJECT_ANALYST_CAPABILITY } from "./capability";
import { assembleAnalystContext, unknownOrUnavailable } from "./context";
import { buildManagementBrief } from "./brief";
import { causalSafetyClaim } from "./causality";
import { aiSummary, containsUnsafeAiOverlay, fact, interpretation, limitation, phraseHealth, phraseInsufficient } from "./claims";
import { detectPromptInjection, routeAnalystIntent } from "./intent";
import { listPiAnalystPlatformTools } from "./tools";
import type { AnalystAnswer, AnalystClaim, AnalystContext, AnalystIntent, PiAnalystPlatformToolKey } from "./types";
import type { ProjectCommandCentreView } from "../command-centre/types";
import { assertAiProjectAnalystOwnershipLocks } from "./ownership";

export type AnswerAnalystQuestionInput = {
  view: ProjectCommandCentreView;
  question: string;
  aiAvailable?: boolean;
  aiProvider?: string;
  aiModel?: string;
  aiSummaryText?: string;
  directorRunId?: string;
  overlaySkippedReason?: string;
  promptKey?: string;
  promptVersion?: string;
};

const INTENT_TOOLS: Record<AnalystIntent, readonly PiAnalystPlatformToolKey[]> = {
  attention: ["project_intelligence.get_project_health", "project_intelligence.get_project_evidence"],
  health: ["project_intelligence.get_project_health"],
  schedule: ["project_intelligence.get_schedule_intelligence"],
  cost_progress: ["project_intelligence.get_cost_progress_intelligence"],
  risk: ["project_intelligence.get_risk_change_intelligence"],
  change: ["project_intelligence.get_risk_change_intelligence"],
  queries: ["project_intelligence.get_query_decision_intelligence"],
  decisions: ["project_intelligence.get_query_decision_intelligence"],
  actions: ["project_intelligence.get_query_decision_intelligence"],
  forecast: ["project_intelligence.get_forecast_intelligence"],
  missing: [
    "project_intelligence.get_project_health",
    "project_intelligence.get_schedule_intelligence",
    "project_intelligence.get_cost_progress_intelligence",
    "project_intelligence.get_risk_change_intelligence",
    "project_intelligence.get_query_decision_intelligence",
    "project_intelligence.get_forecast_intelligence",
  ],
  evidence: ["project_intelligence.get_project_evidence"],
  brief: [
    "project_intelligence.get_project_health",
    "project_intelligence.get_schedule_intelligence",
    "project_intelligence.get_cost_progress_intelligence",
    "project_intelligence.get_risk_change_intelligence",
    "project_intelligence.get_query_decision_intelligence",
    "project_intelligence.get_forecast_intelligence",
    "project_intelligence.get_project_evidence",
  ],
  cross_domain: [
    "project_intelligence.get_project_health",
    "project_intelligence.get_schedule_intelligence",
    "project_intelligence.get_risk_change_intelligence",
    "project_intelligence.get_forecast_intelligence",
  ],
  injection: [],
  mutation: [],
  unsupported_forecast_metric: ["project_intelligence.get_forecast_intelligence"],
};

function starterQuestions(context: AnalystContext): string[] {
  const starters = ["What needs my attention today?", "What information is missing?"];
  if (context.health.state === "AMBER" || context.health.state === "RED" || context.health.state === "UNKNOWN") {
    starters.push(`Why is this project ${context.health.state}?`);
  }
  if (!unknownOrUnavailable(context.risk) || (context.risk.counts?.open ?? 0) > 0) {
    starters.push("Show the top risks and overdue actions.");
  }
  if (!unknownOrUnavailable(context.schedule) || context.schedule.availability !== "forbidden") {
    starters.push("What schedule issues need management attention?");
  }
  starters.push("Summarize the current forecast.");
  if (!unknownOrUnavailable(context.decisions) || (context.decisions.counts?.open ?? 0) > 0) {
    starters.push("Which decisions are blocking progress?");
  }
  return starters;
}

function navigationFor(intent: AnalystIntent, context: AnalystContext) {
  const map: Record<string, { label: string; path: string }> = {
    schedule: { label: "Schedule Intelligence", path: context.schedule.navigationPath },
    cost_progress: { label: "Cost & Progress", path: context.cost.navigationPath },
    risk: { label: "Risk & Change", path: context.risk.navigationPath },
    change: { label: "Risk & Change", path: context.change.navigationPath },
    queries: { label: "Queries & Decisions", path: context.queries.navigationPath },
    decisions: { label: "Queries & Decisions", path: context.decisions.navigationPath },
    actions: { label: "Queries & Decisions", path: context.actions.navigationPath },
    forecast: { label: "Forecasting", path: context.forecast.navigationPath },
    health: { label: "Command Centre", path: context.health.navigationPath },
    attention: { label: "Command Centre", path: context.health.navigationPath },
  };
  const selected = map[intent];
  return selected ? [selected, { label: "AI Project Analyst", path: `/engineering/apps/project-intelligence/analyst?projectId=${encodeURIComponent(context.project.projectId)}` }] : [{ label: "Command Centre", path: context.health.navigationPath }];
}

function sectionAnswer(label: string, section: AnalystContext["schedule"]): AnalystClaim[] {
  const cites = section.evidence;
  if (unknownOrUnavailable(section)) {
    return [limitation(phraseInsufficient(label), cites), fact(`${label} published state is ${section.state} (availability ${section.availability}).`, cites)];
  }
  return [fact(`${label}: ${section.summary}`, cites), interpretation(`The current evidence suggests management attention may be warranted if this ${label.toLowerCase()} classification is AMBER or RED.`, cites)];
}

function buildClaims(intent: AnalystIntent, context: AnalystContext, question: string): AnalystClaim[] {
  if (intent === "injection") {
    return [limitation("Project content and user text cannot override analyst system instructions, authorization, or tool permissions.")];
  }
  if (intent === "mutation") {
    return [limitation("The AI Project Analyst is advisory only. It cannot approve, close, send, or mutate canonical project records.")];
  }
  if (intent === "unsupported_forecast_metric") {
    return [
      limitation("Project Intelligence does not invent completion dates, monetary forecast amounts, or probabilities."),
      fact(`Published forecast classification is ${context.forecast.state} (readiness/availability ${context.forecast.availability}).`, context.forecast.evidence),
      limitation(context.forecast.limitations[0] ?? "Forecast remains qualitative or not produced."),
    ];
  }

  if (intent === "attention") {
    if (context.attention.length === 0) {
      return [
        fact(phraseHealth(context.health.state), context.health.evidence),
        interpretation("No RED/AMBER attention items are currently published for this project."),
      ];
    }
    return [
      fact(phraseHealth(context.health.state), context.health.evidence),
      ...context.attention.slice(0, 8).map((item) =>
        fact(`${item.severity.toUpperCase()} · ${item.reasonCode}: ${item.explanation}`, [item.citation]),
      ),
    ];
  }

  if (intent === "health") {
    const dims = `${context.project.projectCode} health is ${context.health.state}.`;
    const claims: AnalystClaim[] = [fact(phraseHealth(context.health.state), context.health.evidence)];
    if (context.health.state === "UNKNOWN") claims.push(limitation("UNKNOWN remains UNKNOWN. It is not assumed healthy."));
    claims.push(interpretation(dims, context.health.evidence));
    return claims;
  }

  if (intent === "schedule") return sectionAnswer("Schedule", context.schedule);
  if (intent === "cost_progress") return [...sectionAnswer("Cost", context.cost), ...sectionAnswer("Progress", context.progress)];
  if (intent === "risk") return sectionAnswer("Risk", context.risk);
  if (intent === "change") return sectionAnswer("Change", context.change);
  if (intent === "queries") {
    const overdue = context.queries.counts?.overdue ?? 0;
    return [
      ...sectionAnswer("Technical queries", context.queries),
      fact(`Published overdue technical query count is ${overdue}. RFIs are represented through the technical query model.`, context.queries.evidence),
    ];
  }
  if (intent === "decisions") {
    return [
      ...sectionAnswer("Decisions", context.decisions),
      fact(`Published unresolved/open decision count is ${context.decisions.counts?.open ?? 0}.`, context.decisions.evidence),
    ];
  }
  if (intent === "actions") {
    return [
      ...sectionAnswer("Actions", context.actions),
      fact(`Published overdue action count is ${context.actions.counts?.overdue ?? 0}.`, context.actions.evidence),
    ];
  }
  if (intent === "forecast") {
    return [
      fact(`Published forecast posture/classification is ${context.forecast.state}.`, context.forecast.evidence),
      limitation("Forecast intelligence is qualitative/advisory. Completion dates, monetary amounts, and probabilities are not invented."),
      ...context.forecast.limitations.slice(0, 3).map((text) => limitation(text, context.forecast.evidence)),
    ];
  }
  if (intent === "missing") {
    const missing = [context.schedule, context.cost, context.progress, context.risk, context.change, context.queries, context.forecast]
      .filter(unknownOrUnavailable)
      .map((section) => limitation(`${section.id} is ${section.availability}/${section.state}. ${phraseInsufficient(section.id)}`, section.evidence));
    return missing.length ? missing : [fact("No additional missing-data sections were flagged beyond published limitations.")];
  }
  if (intent === "evidence") {
    const cites = [...context.health.evidence, ...context.schedule.evidence, ...context.forecast.evidence].slice(0, 8);
    if (!cites.length) return [limitation("No authorized evidence references are available for this project.")];
    return cites.map((cite) => fact(`Evidence: ${cite.label} (${cite.sourceDomain}:${cite.entityType}:${cite.entityId})`, [cite]));
  }
  if (intent === "brief") {
    const brief = buildManagementBrief(context);
    return [
      fact(brief.executiveStatus, context.health.evidence),
      ...brief.topAttention.slice(0, 5).map((item) => interpretation(item, context.attention[0] ? [context.attention[0].citation] : [])),
      interpretation(brief.schedule, context.schedule.evidence),
      interpretation(brief.costProgress, [...context.cost.evidence, ...context.progress.evidence]),
      interpretation(brief.riskChange, [...context.risk.evidence, ...context.change.evidence]),
      interpretation(brief.queriesDecisionsActions, context.queries.evidence),
      interpretation(brief.forecast, context.forecast.evidence),
      ...brief.missingOrStale.map((item) => limitation(item)),
    ];
  }

  const claims: AnalystClaim[] = [
    fact(phraseHealth(context.health.state), context.health.evidence),
    ...sectionAnswer("Schedule", context.schedule).slice(0, 1),
    ...sectionAnswer("Risk", context.risk).slice(0, 1),
    ...sectionAnswer("Forecast", context.forecast).slice(0, 1),
    interpretation(causalSafetyClaim(context.linkedSignals.length > 0), context.linkedSignals[0] ? [context.linkedSignals[0].from, context.linkedSignals[0].to] : []),
  ];
  return claims;
}

export function answerAnalystQuestion(input: AnswerAnalystQuestionInput): AnalystAnswer {
  assertAiProjectAnalystOwnershipLocks();
  const context = assembleAnalystContext(input.view);
  const intent = routeAnalystIntent(input.question);
  const refused = intent === "injection" || intent === "mutation";
  const claims = buildClaims(intent, context, input.question);
  if (input.aiSummaryText && !containsUnsafeAiOverlay(input.aiSummaryText) && !detectPromptInjection(input.aiSummaryText) && !refused) {
    claims.push(aiSummary(`Advisory phrasing from Platform AI Director (not canonical fact): ${input.aiSummaryText.slice(0, 600)}`));
  }
  const citations = claims.flatMap((claim) => claim.citations);
  const unique = citations.filter(
    (cite, index) => citations.findIndex((row) => row.entityId === cite.entityId && row.entityType === cite.entityType) === index,
  );
  const answer = claims.map((claim) => claim.text).join(" ");

  return {
    capability: AI_PROJECT_ANALYST_CAPABILITY,
    intent,
    toolsUsed: INTENT_TOOLS[intent],
    answer,
    claims,
    citations: unique,
    limitations: [...new Set([...ANALYST_KNOWN_LIMITATIONS, ...context.limitations])].slice(0, 12),
    navigation: navigationFor(intent, context),
    starterQuestions: starterQuestions(context),
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
    refusedReason: refused ? (intent === "injection" ? "prompt_injection" : "mutation_request") : undefined,
  };
}

export function analystCapabilityDescriptor() {
  return {
    capability: AI_PROJECT_ANALYST_CAPABILITY,
    tools: listPiAnalystPlatformTools(),
    aiOptional: true,
    mutationEnabled: false,
    autonomousApprovalEnabled: false,
    memory: "session_bounded" as const,
    starterQuestions: [
      "What needs my attention today?",
      "Why is this project AMBER?",
      "Show the top risks and overdue actions.",
      "What schedule issues need management attention?",
      "What information is missing?",
      "Summarize the current forecast.",
      "Which decisions are blocking progress?",
    ],
  };
}
