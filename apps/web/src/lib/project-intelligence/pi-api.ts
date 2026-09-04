import { parseApiJsonResponse } from "../api/parse-json-response";

export const PI_DATASETS = [
  "overview",
  "schedule",
  "cost",
  "risk-change",
  "decisions",
  "reports",
  "analyst",
  "engineering",
  "forecast",
  "projects",
] as const;

export type PiDataset = (typeof PI_DATASETS)[number];

export const PI_UNAVAILABLE: Record<PiDataset, string> = {
  overview: "Project Intelligence Overview is temporarily unavailable.",
  schedule: "Schedule Intelligence is temporarily unavailable.",
  cost: "Cost & Progress Intelligence is temporarily unavailable.",
  "risk-change": "Risk & Change Intelligence is temporarily unavailable.",
  decisions: "Query & Decision Intelligence is temporarily unavailable.",
  reports: "Project Intelligence Reports are temporarily unavailable.",
  analyst: "Ask Project Intelligence is temporarily unavailable.",
  engineering: "Engineering Intelligence is temporarily unavailable.",
  forecast: "Forecast Intelligence is temporarily unavailable.",
  projects: "Project list is temporarily unavailable.",
};

export class PiLoadError extends Error {
  readonly name = "PiLoadError";
  readonly dataset: PiDataset;
  readonly requestId: string | null;
  readonly status: number;
  readonly code: string | null;

  constructor(
    message: string,
    init: {
      dataset: PiDataset;
      requestId: string | null;
      status: number;
      code: string | null;
    },
  ) {
    super(message);
    this.dataset = init.dataset;
    this.requestId = init.requestId;
    this.status = init.status;
    this.code = init.code;
  }
}

export async function fetchPiJson<T>(
  url: string,
  dataset: PiDataset,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const parsed = await parseApiJsonResponse<T>(response);
  if (!parsed.ok) {
    throw new PiLoadError(PI_UNAVAILABLE[dataset], {
      dataset,
      requestId: parsed.requestId,
      status: parsed.status,
      code: parsed.errorCode,
    });
  }
  return parsed.data as T;
}

export function isPiJsonParseLeak(message: string | null | undefined): boolean {
  if (!message) return false;
  return /Unexpected token|DOCTYPE|<\s*html|Internal Server Error/i.test(message);
}
