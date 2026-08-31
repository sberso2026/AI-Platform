import type { EngineerClaim, EngineerCitation } from "./types";

export function fact(text: string, citations: readonly EngineerCitation[] = []): EngineerClaim {
  return { kind: "FACT", text, citations };
}

export function deterministic(text: string, citations: readonly EngineerCitation[] = []): EngineerClaim {
  return { kind: "DETERMINISTIC_RESULT", text, citations };
}

export function interpretation(text: string, citations: readonly EngineerCitation[] = []): EngineerClaim {
  return { kind: "AI_INTERPRETATION", text, citations };
}

export function unknown(text: string, citations: readonly EngineerCitation[] = []): EngineerClaim {
  return { kind: "UNKNOWN", text, citations };
}

export function limitation(text: string, citations: readonly EngineerCitation[] = []): EngineerClaim {
  return { kind: "LIMITATION", text, citations };
}

const UNSAFE_OVERLAY = [
  /the structure is safe/i,
  /the defect is acceptable/i,
  /no remediation is required/i,
  /remaining life/i,
  /failure is likely/i,
  /corrosion rate is accelerating/i,
  /\d+\s*%\s*(confidence|probability)/i,
  /certified/i,
  /approved as canonical/i,
];

export function containsUnsafeAiOverlay(text: string): boolean {
  return UNSAFE_OVERLAY.some((pattern) => pattern.test(text));
}
