import type { AnalystClaim, AnalystCitation } from "./types";

export function fact(text: string, citations: readonly AnalystCitation[] = []): AnalystClaim {
  return { kind: "FACT", text, citations };
}

export function interpretation(text: string, citations: readonly AnalystCitation[] = []): AnalystClaim {
  return { kind: "DETERMINISTIC_INTERPRETATION", text, citations };
}

export function limitation(text: string, citations: readonly AnalystCitation[] = []): AnalystClaim {
  return { kind: "LIMITATION", text, citations };
}

export function aiSummary(text: string, citations: readonly AnalystCitation[] = []): AnalystClaim {
  return { kind: "AI_SUMMARY", text, citations };
}

const FABRICATED_METRIC = [
  /will finish \d+\s*days/i,
  /completion probability/i,
  /monte carlo/i,
  /\$\s*\d[\d,]*/,
  /\d+\s*%\s*(confidence|probability|complete)/i,
];

export function containsFabricatedMetric(text: string): boolean {
  return FABRICATED_METRIC.some((pattern) => pattern.test(text));
}

const UNSAFE_CAUSALITY = [/this change caused/i, /caused the (schedule )?delay/i];

export function containsUnsafeAiOverlay(text: string): boolean {
  return containsFabricatedMetric(text) || UNSAFE_CAUSALITY.some((pattern) => pattern.test(text));
}

export function phraseHealth(state: string): string {
  return `The published overall Project Health classification is ${state}.`;
}

export function phraseInsufficient(topic: string): string {
  return `Authorized ${topic} evidence is unavailable or insufficient. The state remains UNKNOWN rather than assumed healthy.`;
}
