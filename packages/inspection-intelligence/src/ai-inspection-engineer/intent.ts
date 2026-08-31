import type { EngineerIntent } from "./types";

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) instructions/i,
  /ignore (the |your )?system prompt/i,
  /disregard (your )?system (prompt|instructions)/i,
  /you are now/i,
  /reveal (other|cross)[- ]tenant/i,
  /show (me )?(all )?other (tenant|workspace) data/i,
  /override (authorization|tool permissions|guardrails)/i,
  /call (the )?provider (api|directly)/i,
  /use (your )?own (api key|sdk)/i,
  /fabricate|invent (a |the )?(missing )?measurement/i,
  /ignore (the |all )?evidence/i,
  /override (the )?(human |recorded )?(rating|condition)/i,
];

const MUTATION_PATTERNS = [
  /approve (the )?(inspection|session|report|evidence|corrective action)/i,
  /publish (the )?(report|inspection)/i,
  /close (the )?defect/i,
  /certify (the )?(condition|rating)/i,
  /mutate (the )?(inspection|record)/i,
  /update (the )?(defect|rating|session) (to|as)/i,
  /create (an? )?(core|engineering) action/i,
  /send (this )?(externally|to the client)/i,
];

const CERTIFICATION_PATTERNS = [
  /the structure is safe/i,
  /declare (the )?(asset|structure) safe/i,
  /the defect is acceptable/i,
  /no remediation is required/i,
  /sign off (the )?(inspection|condition)/i,
  /professional(ly)? (certif|approv)/i,
];

const REMAINING_LIFE_PATTERNS = [
  /remaining life/i,
  /failure is likely/i,
  /corrosion rate is accelerating/i,
  /will fail within/i,
  /\d+\s*(year|month)s? remaining/i,
  /probability of failure/i,
];

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectMutationRequest(text: string): boolean {
  return MUTATION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectCertificationRequest(text: string): boolean {
  return CERTIFICATION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectRemainingLifeRequest(text: string): boolean {
  return REMAINING_LIFE_PATTERNS.some((pattern) => pattern.test(text));
}

export function routeEngineerIntent(question: string): EngineerIntent {
  if (detectPromptInjection(question)) return "injection";
  if (detectMutationRequest(question)) return "mutation";
  if (detectCertificationRequest(question)) return "certification";
  if (detectRemainingLifeRequest(question)) return "remaining_life";
  const q = question.toLowerCase();
  if (/draft (a |the )?(report|narrative)|report narrative|assist with (the )?report/.test(q)) return "report_draft";
  if (/history|over time|previous inspection|compare inspection/.test(q)) return "history";
  if (/indicator|open defects over|awaiting verification|evidence completeness/.test(q)) return "indicators";
  if (/condition rating|condition assessment|condition information|unrated/.test(q)) return "condition";
  if (/measurement|observed value|like-for-like/.test(q)) return "measurements";
  if (/\bevidence\b|photo|file id/.test(q)) return "evidence";
  if (/corrective action|\brecommend/.test(q)) return "recommendations";
  if (/defect/.test(q)) return "defects";
  if (/missing|unknown|absent|insufficient|what information/.test(q)) return "missing";
  if (/summarize (the |this )?inspection|inspection summary/.test(q)) return "summary";
  return "question";
}
