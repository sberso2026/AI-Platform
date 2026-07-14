import { createHash } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { MeetingMinutesStatus } from "./types";

export type MinutesVersionSnapshot = {
  versionNumber: number;
  status: MeetingMinutesStatus;
  bodyMarkdown: string;
  bodyJson: Record<string, unknown>;
  contentHash: string;
  issuedAt?: string | null;
  supersededBy?: string | null;
};

export type MinutesSection = {
  key: string;
  title: string;
  items: string[];
};

export const MINUTES_IMMUTABLE_STATUSES = ["approved", "issued"] as const satisfies readonly MeetingMinutesStatus[];

export function hashMinutesContent(bodyMarkdown: string, bodyJson: Record<string, unknown>): string {
  return createHash("sha256")
    .update(bodyMarkdown)
    .update("\0")
    .update(JSON.stringify(bodyJson))
    .digest("hex");
}

export function assertMinutesVersionMutable(version: Pick<MinutesVersionSnapshot, "status" | "issuedAt">): void {
  if (
    (MINUTES_IMMUTABLE_STATUSES as readonly string[]).includes(version.status)
    || version.issuedAt
  ) {
    throw new MeetingIntelligenceError(
      "minutes_immutable_version",
      "Approved or issued minutes versions are immutable; create a new version",
      409,
      { status: version.status },
    );
  }
}

export function assertCanIssueMinutes(status: MeetingMinutesStatus): void {
  if (status !== "approved") {
    throw new MeetingIntelligenceError(
      "minutes_review_invalid",
      "Only approved minutes can be issued",
      409,
      { status },
    );
  }
}

export function assertNoAutoIssue(actorKind: "human" | "ai" | "system"): void {
  if (actorKind !== "human") {
    throw new MeetingIntelligenceError(
      "meeting_ai_cannot_approve",
      "Minutes cannot be auto-issued; a human actor is required",
      403,
      { actorKind },
    );
  }
}

export function nextMinutesVersionNumber(currentVersion: number): number {
  return Math.max(1, currentVersion) + 1;
}

export function canTransitionMinutesStatus(
  from: MeetingMinutesStatus,
  to: MeetingMinutesStatus,
): boolean {
  const allowed: Record<MeetingMinutesStatus, readonly MeetingMinutesStatus[]> = {
    draft: ["generated", "review_pending", "superseded", "archived"],
    generated: ["review_pending", "changes_requested", "superseded", "archived"],
    review_pending: ["approved", "changes_requested", "superseded"],
    changes_requested: ["draft", "generated", "review_pending", "superseded"],
    approved: ["issued", "superseded"],
    issued: ["superseded", "archived"],
    superseded: ["archived"],
    archived: [],
  };
  return allowed[from].includes(to);
}

export function assertMinutesStatusTransition(from: MeetingMinutesStatus, to: MeetingMinutesStatus): void {
  if (!canTransitionMinutesStatus(from, to)) {
    throw new MeetingIntelligenceError(
      "minutes_review_invalid",
      "Minutes status transition is not allowed",
      409,
      { from, to },
    );
  }
}

export function buildDeterministicMinutesSections(input: {
  title: string;
  transcriptLines: readonly string[];
  proposalSummaries: readonly { type: string; title: string }[];
}): { sections: MinutesSection[]; markdown: string; bodyJson: Record<string, unknown> } {
  const decisions = input.proposalSummaries.filter((p) => p.type === "decision").map((p) => p.title);
  const actions = input.proposalSummaries.filter((p) => p.type === "action").map((p) => p.title);
  const risks = input.proposalSummaries.filter((p) => p.type === "risk").map((p) => p.title);
  const issues = input.proposalSummaries.filter((p) => p.type === "issue").map((p) => p.title);
  const other = input.proposalSummaries
    .filter((p) => !["decision", "action", "risk", "issue"].includes(p.type))
    .map((p) => `[${p.type}] ${p.title}`);

  const summaryLines = input.transcriptLines.slice(0, 12);
  const sections: MinutesSection[] = [
    { key: "summary", title: "Summary", items: summaryLines.length ? summaryLines : ["No transcript content"] },
    { key: "decisions", title: "Decisions", items: decisions.length ? decisions : ["None recorded"] },
    { key: "actions", title: "Actions", items: actions.length ? actions : ["None recorded"] },
    { key: "risks", title: "Risks", items: risks.length ? risks : ["None recorded"] },
    { key: "issues", title: "Issues", items: issues.length ? issues : ["None recorded"] },
    { key: "other", title: "Other items", items: other.length ? other : ["None recorded"] },
  ];

  const markdown = [
    `# Minutes: ${input.title}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      ...section.items.map((item) => `- ${item}`),
      "",
    ]),
  ].join("\n").trimEnd();

  const bodyJson = {
    title: input.title,
    sections,
    generatedBy: "deterministic",
    autoIssued: false,
  };

  return { sections, markdown, bodyJson };
}
