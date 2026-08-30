import type { AnalystIntent } from "./types";

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) instructions/i,
  /ignore (the |your )?system prompt/i,
  /disregard (your )?system (prompt|instructions)/i,
  /you are now/i,
  /send this externally/i,
  /email this to/i,
  /reveal other tenant/i,
  /show (me )?(all )?other (tenant|workspace|project) data/i,
  /override (authorization|tool permissions|guardrails)/i,
];

const MUTATION_PATTERNS = [
  /approve (the )?(change|decision|forecast|schedule|cost)/i,
  /close (the )?(risk|action|tq|rfi)/i,
  /send (this )?(to|externally)/i,
  /update (the )?(progress|budget|baseline)/i,
  /respond to (the )?(tq|rfi)/i,
  /issue (an? )?instruction/i,
  /commit (the )?(change|baseline)/i,
];

const UNSUPPORTED_FORECAST = [
  /completion (date|probability)/i,
  /when will (the |this )?project finish/i,
  /when (is|does) (the |this )?project (finish|complete)/i,
  /will finish \d+/i,
  /days late/i,
  /monte carlo/i,
  /cost forecast amount/i,
  /monetary forecast/i,
  /\d+\s*%\s*(probability|confidence|complete)/i,
];

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectMutationRequest(text: string): boolean {
  return MUTATION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectUnsupportedForecastMetric(text: string): boolean {
  return UNSUPPORTED_FORECAST.some((pattern) => pattern.test(text));
}

export function routeAnalystIntent(question: string): AnalystIntent {
  const q = question.toLowerCase();
  if (detectPromptInjection(question)) return "injection";
  if (detectMutationRequest(question)) return "mutation";
  if (detectUnsupportedForecastMetric(question)) return "unsupported_forecast_metric";
  if (/\bcaused\b|cause the schedule|because of this change/.test(q)) return "cross_domain";
  if (/\bbrief\b|executive status|management summary|summarise the project|summarize the project/.test(q)) return "brief";
  if (/what needs (my )?attention|top attention|needs management attention/.test(q)) return "attention";
  if (/why is (this |the )?project|overall health|project (red|amber|green|unknown)/.test(q)) return "health";
  if (/schedule/.test(q)) return "schedule";
  if (/cost|progress|earned value/.test(q)) return "cost_progress";
  if (/\brisks?\b/.test(q)) return "risk";
  if (/\bchanges?\b/.test(q)) return "change";
  if (/\btqs?\b|\brfis?\b|overdue query|technical quer/.test(q)) return "queries";
  if (/decision/.test(q)) return "decisions";
  if (/actions?|overdue action/.test(q)) return "actions";
  if (/forecast/.test(q)) return "forecast";
  if (/missing|unavailable|stale|insufficient|what information/.test(q)) return "missing";
  if (/evidence|support this finding|cited/.test(q)) return "evidence";
  if (/caused|because of|due to the change/.test(q)) return "cross_domain";
  if (/\bconnector\b|external context|\bemail\b|outlook|microsoft 365/.test(q)) return "external_context";
  return "cross_domain";
}
