/**
 * AI Executive Summary — Platform AI Runtime drafts; human review before publish.
 */
export type ExecutiveSummaryCitation = {
  source:
    | "document_intelligence"
    | "meeting_intelligence"
    | "findings_intelligence"
    | "engineering_core";
  refId: string;
  excerpt?: string;
};

export type ExecutiveSummaryDraft = {
  kind: "reporting_intelligence.executive_summary_draft";
  status: "draft";
  narrative: string;
  citations: readonly ExecutiveSummaryCitation[];
  model: string;
  promptVersion: string;
  traceId: string;
  generatedAt: string;
  humanReviewRequired: true;
  mayPublishWithoutHuman: false;
  usesPlatformAiRuntime: true;
  implementsPrivateAiClient: false;
};

export type ExecutiveSummaryPublished = {
  kind: "reporting_intelligence.executive_summary_published";
  status: "published";
  narrative: string;
  citations: readonly ExecutiveSummaryCitation[];
  publishedBy: string;
  publishedAt: string;
  draftTraceId: string;
  auditEventType: "project_intelligence.reporting.executive_summary.published";
};

export function generateExecutiveSummaryDraft(input: {
  metricsSummary: string;
  citations: readonly ExecutiveSummaryCitation[];
  traceId: string;
  model?: string;
  promptVersion?: string;
  now?: string;
}): ExecutiveSummaryDraft {
  if (!input.citations.length) {
    throw new Error("Executive summary requires citations from live sources");
  }
  return {
    kind: "reporting_intelligence.executive_summary_draft",
    status: "draft",
    narrative: `Executive overview (draft): ${input.metricsSummary} Citations retained from originating features. Human review required before publish.`,
    citations: input.citations,
    model: input.model ?? "platform-ai-runtime/executive-summary-v1",
    promptVersion: input.promptVersion ?? "reporting-exec-summary-v1",
    traceId: input.traceId,
    generatedAt: input.now ?? new Date().toISOString(),
    humanReviewRequired: true,
    mayPublishWithoutHuman: false,
    usesPlatformAiRuntime: true,
    implementsPrivateAiClient: false,
  };
}

export function publishExecutiveSummary(input: {
  draft: ExecutiveSummaryDraft;
  reviewerUserId: string;
  now?: string;
}): ExecutiveSummaryPublished {
  if (!input.reviewerUserId.trim()) {
    throw new Error("Human reviewer identity is required to publish AI executive summary");
  }
  if (input.draft.mayPublishWithoutHuman !== false || input.draft.humanReviewRequired !== true) {
    throw new Error("AI executive summary cannot be published without human review");
  }
  if (input.draft.implementsPrivateAiClient !== false) {
    throw new Error("Private AI client is forbidden for executive summaries");
  }
  if (!input.draft.citations.length) {
    throw new Error("Published executive summary must retain citations");
  }
  return {
    kind: "reporting_intelligence.executive_summary_published",
    status: "published",
    narrative: input.draft.narrative,
    citations: input.draft.citations,
    publishedBy: input.reviewerUserId,
    publishedAt: input.now ?? new Date().toISOString(),
    draftTraceId: input.draft.traceId,
    auditEventType: "project_intelligence.reporting.executive_summary.published",
  };
}
