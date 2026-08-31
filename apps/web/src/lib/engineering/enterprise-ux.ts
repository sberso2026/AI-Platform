/**
 * EOS-UX-2 presentation helpers — display only.
 * Does not change stored status values, entitlements, or domain models.
 */

export type OperationalErrorCopy = {
  title: string;
  description: string;
  diagnostic: string | null;
};

const ERROR_RULES: Array<{ match: RegExp; title: string; description: string }> = [
  {
    match: /action[_\s-]?mismatch/i,
    title: "Cannot load this record",
    description: "This page requested data you are not authorized to view in the current context.",
  },
  {
    match: /licence_not_found|license_not_found|licence_missing|license_missing/i,
    title: "You do not have access to this application",
    description: "A licence is required for this application on the current plan.",
  },
  {
    match: /application_not_in_plan|application_not_installed/i,
    title: "This feature is not included in your current plan",
    description: "The application is not included or installed for this workspace.",
  },
  {
    match: /feature_not_enabled|feature_not_found/i,
    title: "This feature is not included in your current plan",
    description: "The requested capability is not enabled for your organisation.",
  },
  {
    match: /seat_not_assigned/i,
    title: "You do not have access to this application",
    description: "A licence is active, but no seat has been assigned to your account.",
  },
  {
    match: /subscription_not_found|subscription_missing|subscription_inactive|subscription_suspended|subscription_cancelled|subscription_expired/i,
    title: "You do not have access to this application",
    description: "There is no active subscription that includes this application.",
  },
  {
    match: /workspace_not_entitled|workspace_not_assigned/i,
    title: "You do not have access to this application",
    description: "The selected workspace is not entitled to use this application.",
  },
  {
    match: /forbidden|not authorized|access denied|403/i,
    title: "You do not have access to this application",
    description: "Authorization denied for this route. Direct URL access remains enforced.",
  },
  {
    match: /not_found|record is unavailable|404/i,
    title: "The requested record is unavailable",
    description: "It may have been removed, or it is outside the current workspace.",
  },
  {
    match: /snapshot_\d+|load_failed|failed to load|cannot load/i,
    title: "Cannot load this page",
    description: "Operational data could not be loaded. Try again, or return to Command Centre.",
  },
];

export function humanizeOperationalError(raw: string | null | undefined): OperationalErrorCopy {
  const diagnostic = (raw ?? "").trim() || null;
  if (!diagnostic) {
    return {
      title: "Cannot load this page",
      description: "Operational data could not be loaded. Try again, or return to Command Centre.",
      diagnostic: null,
    };
  }
  for (const rule of ERROR_RULES) {
    if (rule.match.test(diagnostic)) {
      return { title: rule.title, description: rule.description, diagnostic };
    }
  }
  return {
    title: "Cannot load this page",
    description: "An operational error occurred while loading this view.",
    diagnostic,
  };
}

export function withProjectHref(href: string, projectId: string | null | undefined): string {
  if (!projectId || projectId === "all") return href;
  const [pathAndQuery, hash] = href.split("#");
  const url = new URL(pathAndQuery, "http://local.invalid");
  if (!url.searchParams.get("projectId")) {
    url.searchParams.set("projectId", projectId);
  }
  return `${url.pathname}${url.search}${hash ? `#${hash}` : ""}`;
}

export function formatOperationalDate(value: unknown): string {
  if (value == null || value === "") return "—";
  const text = String(value);
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso ? iso[1] : text;
}

export function pickExistingField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim() && String(value) !== "—") {
      return String(value);
    }
  }
  return "—";
}

export type AskStarter = { id: string; label: string; q: string };

export function contextualAskStarters(input: {
  objectType?: string | null;
  projectId?: string | null;
}): AskStarter[] {
  const type = (input.objectType ?? "").toLowerCase();
  if (type === "asset") {
    return [
      { id: "condition", label: "Explain recorded condition", q: "Explain this asset condition from recorded evidence." },
      { id: "inspections", label: "Summarise inspections", q: "Summarize inspections and defects recorded for this asset." },
      { id: "risks", label: "Related risks", q: "What recorded risks relate to this asset?" },
    ];
  }
  if (type === "inspection" || type === "session") {
    return [
      { id: "findings", label: "Summarise findings", q: "Summarize recorded inspection findings and defects." },
      { id: "actions", label: "Outstanding actions", q: "What corrective actions remain open from this inspection?" },
      { id: "evidence", label: "Evidence status", q: "What evidence is recorded for this inspection?" },
    ];
  }
  if (type === "defect") {
    return [
      { id: "defect", label: "Explain this defect", q: "Explain this defect from recorded inspection evidence." },
      { id: "action", label: "Related actions", q: "What corrective actions are recorded for this defect?" },
    ];
  }
  if (type === "document") {
    return [
      { id: "doc", label: "Summarise this document", q: "Summarize this document from recorded content and provenance." },
      { id: "status", label: "Revision status", q: "What is the recorded revision and authority status of this document?" },
    ];
  }
  if (type === "model") {
    return [
      { id: "model", label: "Model identity", q: "Summarize this model identity, revision, and source system from recorded data." },
      { id: "results", label: "Recorded results", q: "What results or change reviews are recorded for this model?" },
    ];
  }
  if (type === "project" || input.projectId) {
    return [
      { id: "attention", label: "What needs attention?", q: "What needs my attention on this project?" },
      { id: "changes", label: "What changed?", q: "What changed recently on this project?" },
      { id: "risks", label: "Critical risks", q: "Summarize critical engineering risks for this project." },
      { id: "tqs", label: "Open TQs", q: "Show open technical queries for this project." },
    ];
  }
  return [
    { id: "attention", label: "What needs attention?", q: "What needs my attention?" },
    { id: "changes", label: "What changed?", q: "What changed recently?" },
    { id: "risks", label: "Summarise critical risks", q: "Summarize critical engineering risks." },
    { id: "tqs", label: "Show overdue TQs", q: "Show overdue technical queries." },
  ];
}

export function describeAskContext(input: {
  objectType?: string | null;
  objectId?: string | null;
  projectId?: string | null;
}): string {
  const type = (input.objectType ?? "").toLowerCase();
  if (type === "asset" && input.objectId) return `Asset ${input.objectId}`;
  if (type === "inspection" && input.objectId) return `Inspection ${input.objectId}`;
  if (type === "defect" && input.objectId) return `Defect ${input.objectId}`;
  if (type === "document" && input.objectId) return `Document ${input.objectId}`;
  if (type === "model" && input.objectId) return `Model ${input.objectId}`;
  if (input.projectId) return `Project ${input.projectId}`;
  return "Workspace";
}
