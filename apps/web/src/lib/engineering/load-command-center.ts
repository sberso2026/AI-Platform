import {
  asRecordArray,
  parseApiJsonResponse,
  type ParsedApiJson,
} from "../api/parse-json-response";

export function withProjectQuery(endpoint: string, projectId: string | null): string {
  if (!projectId) return endpoint;
  const url = new URL(endpoint, "http://local.invalid");
  url.searchParams.set("projectId", projectId);
  return `${url.pathname}${url.search}`;
}

export const COMMAND_CENTER_DATASETS = [
  "dashboard",
  "timeline",
  "activity",
  "decisions",
  "risks",
] as const;

export type CommandCenterDataset = (typeof COMMAND_CENTER_DATASETS)[number];

export type DatasetLoadState = "loading" | "loaded" | "failed";

export type DatasetLoad<T> = {
  status: DatasetLoadState;
  data: T | null;
  errorCode: string | null;
  errorMessage: string | null;
  requestId: string | null;
};

export type CommandCenterSnapshot = {
  dashboard: DatasetLoad<Record<string, unknown>>;
  timeline: DatasetLoad<Record<string, unknown>[]>;
  activity: DatasetLoad<Record<string, unknown>[]>;
  decisions: DatasetLoad<Record<string, unknown>[]>;
  risks: DatasetLoad<Record<string, unknown>[]>;
};

const DATASET_LABELS: Record<CommandCenterDataset, string> = {
  dashboard: "Engineering KPIs",
  timeline: "Engineering Timeline",
  activity: "Recent Engineering Activity",
  decisions: "Engineering Decisions",
  risks: "Risk Assessments",
};

export const COMMAND_CENTER_USER_ERROR =
  "Some Engineering Command Center data could not be loaded.";

export function emptyDatasetLoad<T>(status: DatasetLoadState = "loading"): DatasetLoad<T> {
  return {
    status,
    data: null,
    errorCode: null,
    errorMessage: null,
    requestId: null,
  };
}

export function kpiDisplayValue(
  dataset: DatasetLoad<unknown>,
  value: number | string | undefined,
): string | number {
  if (dataset.status === "loading") return "—";
  if (dataset.status === "failed") return "Unavailable";
  if (value === undefined || value === null || value === "") return 0;
  return value;
}

export function kpiState(
  dataset: DatasetLoad<unknown>,
  numericValue: number | undefined,
): "loading" | "loaded-zero" | "loaded-value" | "failed" {
  if (dataset.status === "loading") return "loading";
  if (dataset.status === "failed") return "failed";
  return numericValue === 0 ? "loaded-zero" : "loaded-value";
}

export function boundedCommandCenterMessage(parsed: ParsedApiJson): string {
  if (parsed.ok) return "";
  return COMMAND_CENTER_USER_ERROR;
}

function fromParsed<T>(parsed: ParsedApiJson, mapData: (data: unknown) => T | null): DatasetLoad<T> {
  if (!parsed.ok) {
    return {
      status: "failed",
      data: null,
      errorCode: parsed.errorCode,
      errorMessage: boundedCommandCenterMessage(parsed),
      requestId: parsed.requestId,
    };
  }
  return {
    status: "loaded",
    data: mapData(parsed.data),
    errorCode: null,
    errorMessage: null,
    requestId: parsed.requestId,
  };
}

export function failedDatasets(snapshot: CommandCenterSnapshot): Array<{
  dataset: CommandCenterDataset;
  label: string;
  requestId: string | null;
  errorCode: string | null;
}> {
  return COMMAND_CENTER_DATASETS.filter((key) => snapshot[key].status === "failed").map((key) => ({
    dataset: key,
    label: DATASET_LABELS[key],
    requestId: snapshot[key].requestId,
    errorCode: snapshot[key].errorCode,
  }));
}

export function snapshotHasFailure(snapshot: CommandCenterSnapshot): boolean {
  return COMMAND_CENTER_DATASETS.some((key) => snapshot[key].status === "failed");
}

export async function loadCommandCenter(
  fetchImpl: typeof fetch,
  projectId: string | null,
): Promise<CommandCenterSnapshot> {
  const [dashboard, timeline, activity, decisions, risks] = await Promise.all([
    fetchImpl(withProjectQuery("/api/engineering/dashboard", projectId)).then((r) =>
      parseApiJsonResponse<Record<string, unknown>>(r),
    ),
    fetchImpl(withProjectQuery("/api/engineering/timeline", projectId)).then((r) =>
      parseApiJsonResponse(r),
    ),
    fetchImpl(withProjectQuery("/api/engineering/activity", projectId)).then((r) =>
      parseApiJsonResponse(r),
    ),
    fetchImpl(withProjectQuery("/api/engineering/decisions", projectId)).then((r) =>
      parseApiJsonResponse(r),
    ),
    fetchImpl(withProjectQuery("/api/engineering/risks", projectId)).then((r) =>
      parseApiJsonResponse(r),
    ),
  ]);

  return {
    dashboard: fromParsed(dashboard, (data) =>
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : null,
    ),
    timeline: fromParsed(timeline, (data) => asRecordArray(data)),
    activity: fromParsed(activity, (data) => asRecordArray(data)),
    decisions: fromParsed(decisions, (data) => asRecordArray(data)),
    risks: fromParsed(risks, (data) => asRecordArray(data)),
  };
}
