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
    match: /invite_email_rate_limited|over_email_send_rate_limit|email rate limit/i,
    title: "Invite email was not sent",
    description: "The Auth mailer rate limit was exceeded. Retry later. Do not issue a temporary password as the external invite path.",
  },
  {
    match: /email_not_confirmed|confirm your email/i,
    title: "Activation is incomplete",
    description: "The user must open the confirmation or invite link from their inbox before signing in.",
  },
  {
    match: /workspace_required|workspace not found|wrong workspace/i,
    title: "Wrong workspace",
    description: "The user is authenticated but is not in the intended workspace. Check Users → workspace membership.",
  },
  {
    match: /document_storage_unavailable|file not found/i,
    title: "Document access denied",
    description: "The document is missing, outside this workspace, or storage is unavailable. Direct URLs remain scoped.",
  },
  {
    match: /invalid_transition|technical_query_update_failed/i,
    title: "Technical query could not be updated",
    description: "The TQ status change is not allowed. Use a valid respond/close transition.",
  },
  {
    match: /inspection_workflow_failed/i,
    title: "Inspection step failed",
    description: "The inspection workflow action was rejected. Check session state and required fields (body/notes).",
  },
  {
    match: /not enough authorised evidence|insufficient evidence|ai_retrieval/i,
    title: "AI retrieval did not find authorised evidence",
    description: "Engineering AI abstained or returned no provenance. Confirm the project has authorised records in this workspace.",
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
  documentNumber?: string | null;
  documentTitle?: string | null;
  revision?: string | null;
  projectLabel?: string | null;
  assetLabel?: string | null;
}): string {
  const type = (input.objectType ?? "").toLowerCase();
  if (type === "document") {
    const parts = [
      input.documentNumber?.trim() || null,
      input.documentTitle?.trim() || null,
      input.revision?.trim() ? `Revision ${input.revision.trim()}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Current Document";
  }
  if (type === "asset") return input.assetLabel?.trim() || "Current Asset/Object";
  if (type === "inspection") return "Current Inspection";
  if (type === "defect") return "Current Defect";
  if (type === "model") return "Current Model";
  if (input.projectId || type === "project") return input.projectLabel?.trim() || "Current Project";
  return "All Engineering";
}

export function formatEvidenceSection(sectionPath?: string | null, figureLabel?: string | null): string | null {
  const figure = figureLabel?.replace(/\s+/g, " ").trim();
  if (figure) {
    const number = figure.match(/([0-9]+(?:\.[0-9]+)*)/)?.[1];
    return number ? `Figure ${number}` : figure;
  }
  const raw = (sectionPath ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return null;
  const clause = raw.match(/\b(\d+(?:\.\d+){1,4})\b/);
  if (clause) return `Section ${clause[1]}`;
  const fig = raw.match(/(?:figure|fig\.?)\s*([0-9.]+)/i);
  if (fig) return `Figure ${fig[1]}`;
  return raw.slice(0, 72);
}

export function presentAskAnswer(input: {
  content: string;
  excerpt?: string | null;
  whyFinding?: string | null;
  abstained?: boolean;
  query?: string | null;
}): { answer: string; why: string } {
  const raw = input.content.replace(/\*\*/g, "").trim();
  if (input.abstained) {
    return {
      answer: raw.replace(/\s+/g, " ").split(/(?<=\.)\s/)[0] || raw,
      why: "No authorised excerpt in the current document supports this question.",
    };
  }
  const block = (label: string) => {
    const match = raw.match(new RegExp(`(?:^|\\n)${label}\\s*\\n([\\s\\S]+?)(?=\\n(?:ANSWER|BASIS|SOURCE|WHY|LIMITATION|LIMITATIONS)\\b|$)`, "i"));
    return match?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  };
  const answerBlock = block("ANSWER");
  const basisBlock = block("BASIS") || block("WHY");
  if (answerBlock) {
    return {
      answer: answerBlock,
      why: basisBlock || input.whyFinding?.replace(/\s+/g, " ").trim() || "",
    };
  }
  const stripped = raw.replace(/\s+/g, " ");
  const answerMatch = stripped.match(/answer:\s*(.+?)(?=\swhy:|\ssources|\slimitations|$)/i);
  const whyMatch = stripped.match(/why[?:]?\s*(.+?)(?=\ssources|\slimitations|$)/i);
  const generated = (answerMatch?.[1] ?? stripped).trim();
  const answer = generated.length > 280
    ? (generated.match(/^(.+?[.!?])(?:\s|$)/)?.[1] ?? generated.slice(0, 240).trim())
    : generated;
  const why = (basisBlock || input.whyFinding || whyMatch?.[1] || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
  return { answer, why };
}

export function isInternalAskMeta(value: string): boolean {
  return /retrieval_only|generationProvider|chunk=|scope document|evidence state|openai|hybrid|lexical_fallback/i.test(value);
}
