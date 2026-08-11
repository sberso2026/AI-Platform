"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input } from "@rtb/ui";
import { Bot, Send, User } from "lucide-react";
import { cn } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  buildAskHref,
  useEngineeringContext,
} from "@/hooks/use-engineering-context";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { ENGINEERING_PROJECT_FILTER_KEY } from "@/hooks/use-engineering-project-filter";

type EvidenceItem = {
  sourceId: string;
  sourceType: string;
  title: string;
  sourceLocation: string;
  excerpt: string;
  authorityStatus?: string;
  revision?: string | null;
  conflicting?: boolean;
  supersededWarning?: boolean;
  provenance?: string;
};

type WhyPayload = {
  finding?: string;
  keyEvidence?: Array<{
    sourceId: string;
    title: string;
    provenance: string;
    authorityStatus: string;
  }>;
  ruleOrToolBasis?: string[];
  assumptions?: string[];
  uncertaintyAndLimitations?: string[];
  authorityState?: string;
};

type SuggestedAction = {
  action: string;
  rationale: string;
  requiresHumanReview?: boolean;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  evidence?: EvidenceItem[];
  evidenceState?: string;
  scope?: string;
  limitations?: string[];
  retrievalMode?: string;
  abstained?: boolean;
  why?: WhyPayload | null;
  basis?: Array<{ kind: string; statement: string }>;
  assumptions?: Array<{ statement: string }>;
  recommendedNextActions?: SuggestedAction[];
  authorityStatus?: string | null;
  explanationStatus?: string | null;
  memoryChips?: {
    previousSimilarWork?: boolean;
    relevantPrecedent?: boolean;
    previousDecision?: boolean;
    lessons?: boolean;
    whyWasThisDone?: boolean;
  } | null;
}

const SCOPE_OPTIONS = [
  { id: "workspace", label: "All Engineering" },
  { id: "project", label: "Current Project" },
  { id: "asset", label: "Current Asset/Object" },
  { id: "document", label: "Current Document" },
] as const;

/**
 * Ask Engineering OS — E2–E8 grounded evidence, Why?, tools, memory context, and governed work proposals.
 */
export function AskEngineeringShell({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  useExperiencePerf("ask");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { context, initFromDeepLink, setContext } = useEngineeringContext(pathname);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask Engineering OS. Answers are evidence-grounded and advisory. Facts, inferences, and assumptions stay distinct. Missing evidence produces abstention — not invented history.",
    },
  ]);
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [toolAction, setToolAction] = useState<string | null>(null);
  const [toolLength, setToolLength] = useState("");
  const [toolWidth, setToolWidth] = useState("");
  const [toolUnit, setToolUnit] = useState("m");
  const [toolPieceCount, setToolPieceCount] = useState("");
  const [toolPieceLength, setToolPieceLength] = useState("");
  const [compareTitleA, setCompareTitleA] = useState("");
  const [compareTitleB, setCompareTitleB] = useState("");
  const [checkNeedle, setCheckNeedle] = useState("");
  const [activeProposal, setActiveProposal] = useState<{
    proposalId: string;
    actionType: string;
    approvalState: string;
    payloadHash: string;
    title?: string;
    draftText?: string;
    contextFreshnessToken?: string;
  } | null>(null);
  const [proposalDraftEdit, setProposalDraftEdit] = useState("");
  const [proposalBusy, setProposalBusy] = useState(false);
  const [scope, setScope] = useState<string>(
    searchParams.get("scope") ??
      (searchParams.get("documentId")
        ? "document"
        : searchParams.get("assetId")
          ? "asset"
          : searchParams.get("projectId")
            ? "project"
            : "workspace"),
  );

  useEffect(() => {
    initFromDeepLink({
      route: pathname,
      searchParams,
    });
    const q = searchParams.get("q");
    if (q) setInput(q);
  }, [pathname, searchParams, initFromDeepLink]);

  useEffect(() => {
    const projectFromFilter = (() => {
      try {
        const stored = sessionStorage.getItem(ENGINEERING_PROJECT_FILTER_KEY);
        if (!stored || stored === "all") return null;
        return stored;
      } catch {
        return null;
      }
    })();
    if (projectFromFilter && !context.projectId) {
      setContext({
        projectId: projectFromFilter,
        objectType: context.objectType ?? "project",
        objectId: context.objectId ?? projectFromFilter,
      });
      if (scope === "workspace") setScope("project");
    }
  }, [context.projectId, context.objectType, context.objectId, setContext, scope]);

  function applyScope(next: string) {
    setScope(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", next);
    if (next === "workspace") {
      params.delete("projectId");
      params.delete("assetId");
      params.delete("documentId");
      params.delete("objectId");
      params.delete("objectType");
      setContext({ projectId: null, objectId: null, objectType: null });
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function createWorkProposal(kind: string, message: Message) {
    setProposalBusy(true);
    try {
      const res = await fetch("/api/engineering/action-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "create",
          kind,
          title:
            kind === "draft_response"
              ? "Draft response"
              : kind === "prepare_decision"
                ? "Prepare decision"
                : kind === "add_risk"
                  ? "Add risk"
                  : kind === "add_issue"
                    ? "Add issue"
                    : kind === "assign_review"
                      ? "Assign review"
                      : kind === "link_evidence"
                        ? "Link evidence"
                        : "Create action",
          description: message.content.slice(0, 500),
          draftText: kind === "draft_response" || kind === "prepare_decision" ? message.content : undefined,
          projectId: context.projectId || undefined,
          objectType: context.objectType || undefined,
          objectId: context.objectId || undefined,
          evidenceRefs: (message.evidence ?? []).map((e) => e.sourceId).filter(Boolean),
          askQuery: messages.find((m) => m.role === "user")?.content ?? null,
        }),
      });
      const parsed = await parseApiJsonResponse<{
        proposalId: string;
        actionType: string;
        approvalState: string;
        provenance?: { payloadHash?: string };
        proposedPayload?: { title?: string; draftText?: string };
        sourceContext?: { contextFreshnessToken?: string };
      }>(res);
      if (!parsed.ok || !parsed.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: parsed.errorMessage ?? "Could not create governed action proposal.",
            evidenceState: "INSUFFICIENT",
          },
        ]);
        return;
      }
      const data = parsed.data;
      setActiveProposal({
        proposalId: data.proposalId,
        actionType: data.actionType,
        approvalState: data.approvalState,
        payloadHash: data.provenance?.payloadHash ?? "",
        title: data.proposedPayload?.title,
        draftText: String(data.proposedPayload?.draftText ?? ""),
        contextFreshnessToken: data.sourceContext?.contextFreshnessToken,
      });
      setProposalDraftEdit(String(data.proposedPayload?.draftText ?? data.proposedPayload?.title ?? ""));
    } finally {
      setProposalBusy(false);
    }
  }

  async function reviewProposal(op: "approve" | "reject" | "edit" | "execute") {
    if (!activeProposal) return;
    setProposalBusy(true);
    try {
      const body: Record<string, unknown> = {
        op,
        proposalId: activeProposal.proposalId,
        expectedPayloadHash: activeProposal.payloadHash,
        contextFreshnessToken: activeProposal.contextFreshnessToken,
        idempotencyKey: activeProposal.proposalId,
      };
      if (op === "edit") {
        body.proposedPayload = {
          title: activeProposal.title,
          draftText: proposalDraftEdit,
          description: proposalDraftEdit,
          status: "draft",
        };
      }
      if (op === "reject") body.note = "Rejected from Ask review";
      const res = await fetch("/api/engineering/action-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const parsed = await parseApiJsonResponse<{
        proposalId: string;
        actionType: string;
        approvalState: string;
        provenance?: { payloadHash?: string };
        proposedPayload?: { title?: string; draftText?: string };
        domainResultId?: string | null;
        failureReason?: string | null;
        sourceContext?: { contextFreshnessToken?: string };
      }>(res);
      if (!parsed.ok || !parsed.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: parsed.errorMessage ?? "Proposal review failed — no fake completion.",
          },
        ]);
        return;
      }
      const data = parsed.data;
      setActiveProposal({
        proposalId: data.proposalId,
        actionType: data.actionType,
        approvalState: data.approvalState,
        payloadHash: data.provenance?.payloadHash ?? activeProposal.payloadHash,
        title: data.proposedPayload?.title ?? activeProposal.title,
        draftText: String(data.proposedPayload?.draftText ?? proposalDraftEdit),
        contextFreshnessToken:
          data.sourceContext?.contextFreshnessToken ?? activeProposal.contextFreshnessToken,
      });
      if (data.approvalState === "COMPLETED") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Governed work completed via existing domain service (${data.domainResultId ?? "ok"}). Human approval was required — advisory orchestration only.`,
          },
        ]);
        setActiveProposal(null);
      } else if (data.approvalState === "REJECTED") {
        setActiveProposal(null);
      } else if (data.approvalState === "FAILED") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Proposal failed: ${data.failureReason ?? "domain/workflow failure"}. No fake success recorded.`,
          },
        ]);
      }
    } finally {
      setProposalBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const toolInputs: Record<string, unknown> = {};
      const toolUnits: Record<string, string> = {};
      if (toolAction === "analyse") {
        if (toolLength) toolInputs.length = Number(toolLength);
        if (toolWidth) toolInputs.width = Number(toolWidth);
        if (toolUnit) {
          toolUnits.length = toolUnit;
          toolUnits.width = toolUnit;
        }
      } else if (toolAction === "estimate") {
        if (toolPieceCount) toolInputs.pieceCount = Number(toolPieceCount);
        if (toolPieceLength) toolInputs.pieceLength = Number(toolPieceLength);
        if (toolUnit) toolUnits.pieceLength = toolUnit;
      } else if (toolAction === "compare") {
        if (compareTitleA) toolInputs.titleA = compareTitleA;
        if (compareTitleB) toolInputs.titleB = compareTitleB;
      } else if (toolAction === "run_check" || toolAction === "verify") {
        toolInputs.haystack = userMessage.content;
        if (checkNeedle) toolInputs.needle = checkNeedle;
      }

      const res = await fetch("/api/engineering/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          projectId: scope === "workspace" ? undefined : context.projectId || undefined,
          assetId:
            context.objectType === "asset" ? context.objectId || undefined : undefined,
          documentId:
            context.objectType === "document" ? context.objectId || undefined : undefined,
          objectType: context.objectType || undefined,
          objectId: context.objectId || undefined,
          scope,
          sessionId: context.sessionId || undefined,
          agentSlug: "engineering-director",
          toolAction: toolAction || undefined,
          toolInputs: Object.keys(toolInputs).length ? toolInputs : undefined,
          toolUnits: Object.keys(toolUnits).length ? toolUnits : undefined,
        }),
      });
      const parsed = await parseApiJsonResponse<{
        message: string;
        requiresReview?: boolean;
        evidence?: EvidenceItem[];
        evidenceState?: string;
        scope?: string;
        limitations?: string[];
        retrievalMode?: string;
        grounded?: { abstained?: boolean };
        why?: WhyPayload | null;
        basis?: Array<{ kind: string; statement: string }>;
        assumptions?: Array<{ statement: string }>;
        recommendedNextActions?: SuggestedAction[];
        authorityStatus?: string | null;
        explanationStatus?: string | null;
        memoryChips?: Message["memoryChips"];
        meta?: Record<string, unknown>;
      }>(res);

      if (res.status === 403 || res.status === 402) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Ask is unavailable for this workspace (capability or entitlement).",
            evidenceState: "INSUFFICIENT",
            limitations: ["Capability unavailable"],
          },
        ]);
        return;
      }

      if (!parsed.ok || !parsed.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              parsed.errorMessage ??
              "The assistant backend could not complete this request. No fabricated answer was generated.",
            evidenceState: "INSUFFICIENT",
            limitations: ["Provider or API failure"],
          },
        ]);
        return;
      }

      const data = parsed.data;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.requiresReview
            ? `${data.message}\n\nHuman review required — advisory only.`
            : data.message,
          evidence: data.evidence ?? [],
          evidenceState: data.evidenceState,
          scope: data.scope ?? scope,
          limitations: data.limitations ?? [],
          retrievalMode: data.retrievalMode,
          abstained: Boolean(data.grounded?.abstained ?? data.meta?.abstained),
          why: data.why ?? null,
          basis: data.basis ?? [],
          assumptions: data.assumptions ?? [],
          recommendedNextActions: data.recommendedNextActions ?? [],
          authorityStatus: data.authorityStatus ?? null,
          explanationStatus: data.explanationStatus ?? null,
          memoryChips: data.memoryChips ?? null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Request failed",
          evidenceState: "INSUFFICIENT",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const scopeLabel =
    SCOPE_OPTIONS.find((s) => s.id === scope)?.label ??
    (context.projectId ? "Current Project" : "All Engineering");

  const body = (
    <main
      className="flex flex-1 flex-col overflow-hidden"
      data-testid="ask-engineering-os"
      data-retrieval-ready="e8"
    >
      <div
        className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-sm"
        data-testid="ask-context-bar"
      >
        <span className="text-muted-foreground" data-testid="ask-scope-indicator">
          Scope: {scopeLabel}
        </span>
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => applyScope(opt.id)}
            className={cn(
              "rounded-md border px-2 py-1 text-xs",
              scope === opt.id
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
            )}
            data-testid={`ask-scope-${opt.id}`}
          >
            {opt.label}
          </button>
        ))}
        <Link
          className="text-xs text-slate-800 underline-offset-2 hover:underline"
          href={buildAskHref({ projectId: null })}
          onClick={() => {
            setContext({ projectId: null, objectId: null, objectType: null });
            setScope("workspace");
          }}
        >
          Clear context
        </Link>
      </div>

      <div className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2" data-testid="ask-message">
              <div
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <Bot className="mt-1 h-5 w-5 text-muted-foreground" />
                )}
                <Card
                  className={cn(
                    "max-w-[85%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "",
                  )}
                >
                  <CardContent className="whitespace-pre-wrap p-3 text-sm">
                    {message.content}
                  </CardContent>
                </Card>
                {message.role === "user" && (
                  <User className="mt-1 h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {message.role === "assistant" && message.evidenceState ? (
                <div className="space-y-2 pl-8" data-testid="ask-evidence-panel">
                  {message.memoryChips &&
                  (message.memoryChips.previousSimilarWork ||
                    message.memoryChips.relevantPrecedent ||
                    message.memoryChips.previousDecision ||
                    message.memoryChips.lessons ||
                    message.memoryChips.whyWasThisDone) ? (
                    <div
                      className="flex flex-wrap gap-1.5"
                      data-testid="ask-memory-context"
                      aria-label="Relevant engineering memory"
                    >
                      {message.memoryChips.previousSimilarWork ? (
                        <span className="rounded border px-2 py-0.5 text-[11px] text-slate-700">
                          Previous similar work
                        </span>
                      ) : null}
                      {message.memoryChips.relevantPrecedent ? (
                        <span className="rounded border px-2 py-0.5 text-[11px] text-slate-700">
                          Relevant precedent
                        </span>
                      ) : null}
                      {message.memoryChips.previousDecision ? (
                        <span className="rounded border px-2 py-0.5 text-[11px] text-slate-700">
                          Previous decision
                        </span>
                      ) : null}
                      {message.memoryChips.lessons ? (
                        <span className="rounded border px-2 py-0.5 text-[11px] text-slate-700">
                          Lessons
                        </span>
                      ) : null}
                      {message.memoryChips.whyWasThisDone ? (
                        <span className="rounded border px-2 py-0.5 text-[11px] text-slate-700">
                          Why was this done?
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Evidence state: {message.evidenceState}
                    {message.explanationStatus ? ` · ${message.explanationStatus}` : ""}
                    {message.authorityStatus ? ` · ${message.authorityStatus}` : ""}
                    {message.retrievalMode ? ` · ${message.retrievalMode}` : ""}
                    {message.scope ? ` · scope ${message.scope}` : ""}
                  </p>

                  {message.why ? (
                    <div
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                      data-testid="ask-why-panel"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-900"
                        onClick={() =>
                          setExpandedWhy((prev) => ({
                            ...prev,
                            [message.id]: !prev[message.id],
                          }))
                        }
                        data-testid="ask-why-toggle"
                      >
                        <span>Why?</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {expandedWhy[message.id] ? "Hide details" : "Show details"}
                        </span>
                      </button>
                      <p className="mt-1 text-sm text-slate-800" data-testid="ask-why-finding">
                        {message.why.finding}
                      </p>
                      {expandedWhy[message.id] ? (
                        <div className="mt-2 space-y-2 text-xs text-slate-700" data-testid="ask-why-details">
                          {(message.basis?.length ?? 0) > 0 ? (
                            <div>
                              <p className="font-medium">Basis</p>
                              <ul className="mt-1 list-disc space-y-1 pl-4">
                                {message.basis!.map((b) => (
                                  <li key={`${b.kind}-${b.statement}`}>
                                    <span className="font-medium">{b.kind}:</span> {b.statement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {(message.why.ruleOrToolBasis?.length ?? 0) > 0 ? (
                            <div>
                              <p className="font-medium">Rules / models / tools</p>
                              <ul className="mt-1 list-disc space-y-1 pl-4">
                                {message.why.ruleOrToolBasis!.map((r) => (
                                  <li key={r}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {(message.assumptions?.length ?? 0) > 0 ||
                          (message.why.assumptions?.length ?? 0) > 0 ? (
                            <div>
                              <p className="font-medium">Assumptions</p>
                              <ul className="mt-1 list-disc space-y-1 pl-4">
                                {(message.assumptions?.map((a) => a.statement) ??
                                  message.why.assumptions ??
                                  []
                                ).map((a) => (
                                  <li key={a}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          <p className="text-muted-foreground">
                            Authority: {message.why.authorityState ?? message.authorityStatus ?? "ADVISORY"} — no
                            autonomous approval.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs font-medium text-slate-800">Sources</p>
                    {(message.evidence?.length ?? 0) > 0 ? (
                      <ul className="mt-1 space-y-2" data-testid="ask-evidence-list">
                        {message.evidence!.map((ev) => (
                          <li key={`${ev.sourceType}-${ev.sourceId}`}>
                            <Link
                              href={ev.sourceLocation}
                              className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-400"
                              data-testid="ask-evidence-link"
                            >
                              <div className="font-medium text-slate-900">
                                {ev.title}
                                {ev.revision ? ` (rev ${ev.revision})` : ""}
                                {ev.authorityStatus ? ` · ${ev.authorityStatus}` : ""}
                                {ev.provenance === "connector_external" ? " · connector" : ""}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{ev.excerpt}</p>
                              {ev.supersededWarning || ev.conflicting ? (
                                <p className="mt-1 text-xs text-amber-700">
                                  {ev.conflicting
                                    ? "Conflicting evidence"
                                    : "One supporting source is superseded."}
                                </p>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground" data-testid="ask-no-evidence">
                        No clickable sources for this response.
                      </p>
                    )}
                  </div>

                  {(message.limitations?.length ?? 0) > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-slate-800">Limitations / conflicts</p>
                      <ul
                        className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground"
                        data-testid="ask-limitations"
                      >
                        {message.limitations!.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(message.recommendedNextActions?.length ?? 0) > 0 ? (
                    <div data-testid="ask-suggested-actions">
                      <p className="text-xs font-medium text-slate-800">Suggested actions</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
                        {message.recommendedNextActions!.map((a) => (
                          <li key={a.action}>
                            {a.action}
                            {a.requiresHumanReview ? " (human review)" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-1.5" data-testid="ask-work-actions">
                    {(
                      [
                        { id: "create_action", label: "Create action" },
                        { id: "draft_response", label: "Draft response" },
                        { id: "prepare_decision", label: "Prepare decision" },
                        { id: "add_risk", label: "Add risk" },
                        { id: "add_issue", label: "Add issue" },
                        { id: "assign_review", label: "Assign review" },
                        { id: "link_evidence", label: "Link evidence" },
                      ] as const
                    ).map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        disabled={proposalBusy}
                        onClick={() => void createWorkProposal(action.id, message)}
                        className="rounded-md border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-white px-4 py-3"
        data-testid="ask-input-form"
      >
        {activeProposal ? (
          <div
            className="mx-auto mb-3 max-w-3xl rounded-md border border-slate-200 bg-slate-50 p-3"
            data-testid="ask-proposal-review"
          >
            <p className="text-xs font-medium text-slate-900">
              Review proposal · {activeProposal.actionType} · {activeProposal.approvalState}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              AI drafts stay DRAFT until you accept. No autonomous approval.
            </p>
            <textarea
              className="mt-2 w-full rounded-md border px-2 py-1 text-xs"
              rows={3}
              value={proposalDraftEdit}
              onChange={(e) => setProposalDraftEdit(e.target.value)}
              data-testid="ask-proposal-edit"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={proposalBusy}
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => void reviewProposal("edit")}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={proposalBusy || activeProposal.approvalState === "APPROVED"}
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => void reviewProposal("approve")}
                data-testid="ask-proposal-accept"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={proposalBusy || activeProposal.approvalState !== "APPROVED"}
                className="rounded-md border bg-slate-900 px-2 py-1 text-xs text-white"
                onClick={() => void reviewProposal("execute")}
              >
                Execute
              </button>
              <button
                type="button"
                disabled={proposalBusy}
                className="rounded-md border px-2 py-1 text-xs text-red-700"
                onClick={() => void reviewProposal("reject")}
                data-testid="ask-proposal-reject"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-3xl space-y-2">
          <div className="flex flex-wrap gap-2" data-testid="ask-tool-actions">
            {(
              [
                { id: "run_check", label: "Run check" },
                { id: "compare", label: "Compare" },
                { id: "verify", label: "Verify" },
                { id: "estimate", label: "Estimate" },
                { id: "analyse", label: "Analyse" },
              ] as const
            ).map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setToolAction(toolAction === action.id ? null : action.id)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs",
                  toolAction === action.id
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                )}
                data-testid={`ask-tool-${action.id}`}
              >
                {action.label}
              </button>
            ))}
          </div>
          {toolAction ? (
            <div
              className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs sm:grid-cols-2"
              data-testid="ask-tool-inputs"
            >
              <p className="sm:col-span-2 text-muted-foreground">
                Governed tool selected. Provide critical inputs/units — values are never invented.
              </p>
              {(toolAction === "analyse") && (
                <>
                  <Input
                    placeholder="Length"
                    value={toolLength}
                    onChange={(e) => setToolLength(e.target.value)}
                    data-testid="ask-tool-length"
                  />
                  <Input
                    placeholder="Width"
                    value={toolWidth}
                    onChange={(e) => setToolWidth(e.target.value)}
                    data-testid="ask-tool-width"
                  />
                  <Input
                    placeholder="Unit (e.g. m)"
                    value={toolUnit}
                    onChange={(e) => setToolUnit(e.target.value)}
                    data-testid="ask-tool-unit"
                  />
                </>
              )}
              {toolAction === "estimate" && (
                <>
                  <Input
                    placeholder="Piece count"
                    value={toolPieceCount}
                    onChange={(e) => setToolPieceCount(e.target.value)}
                    data-testid="ask-tool-piece-count"
                  />
                  <Input
                    placeholder="Piece length"
                    value={toolPieceLength}
                    onChange={(e) => setToolPieceLength(e.target.value)}
                    data-testid="ask-tool-piece-length"
                  />
                  <Input
                    placeholder="Unit (e.g. m)"
                    value={toolUnit}
                    onChange={(e) => setToolUnit(e.target.value)}
                    data-testid="ask-tool-unit"
                  />
                </>
              )}
              {toolAction === "compare" && (
                <>
                  <Input
                    placeholder="Title A"
                    value={compareTitleA}
                    onChange={(e) => setCompareTitleA(e.target.value)}
                    data-testid="ask-tool-title-a"
                  />
                  <Input
                    placeholder="Title B"
                    value={compareTitleB}
                    onChange={(e) => setCompareTitleB(e.target.value)}
                    data-testid="ask-tool-title-b"
                  />
                </>
              )}
              {(toolAction === "run_check" || toolAction === "verify") && (
                <Input
                  placeholder="Keyword to check in your question/evidence"
                  value={checkNeedle}
                  onChange={(e) => setCheckNeedle(e.target.value)}
                  data-testid="ask-tool-needle"
                  className="sm:col-span-2"
                />
              )}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask from authorised Engineering OS evidence…"
              disabled={isLoading}
              data-testid="ask-input"
              className="text-base"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} data-testid="ask-submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </main>
  );

  if (embedded) return body;

  return (
    <>
      <Header
        title="Ask Engineering OS"
        description="Evidence-based engineering answers with Why?, sources, and abstention"
      />
      {body}
    </>
  );
}

export default function AskEngineeringPageClient() {
  return <AskEngineeringShell />;
}
