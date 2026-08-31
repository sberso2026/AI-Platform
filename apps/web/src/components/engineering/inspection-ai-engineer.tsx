"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, EmptyState, SectionHeader } from "@rtb/ui";
import { hostedGet, selectedProjectId, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

type EngineerClaim = { kind: string; text: string };
type EngineerCitation = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  asOf?: string;
  label: string;
};

type EngineerAnswer = {
  answer: string;
  summary: string;
  intent: string;
  facts: string[];
  interpretations: string[];
  unknowns: string[];
  limitations: string[];
  evidenceRefs: EngineerCitation[];
  inspectionRefs: EngineerCitation[];
  claims: EngineerClaim[];
  confidenceBasis: string;
  starterQuestions: string[];
  navigation: { label: string; path: string }[];
  aiAvailable: boolean;
  aiProvider?: string;
  aiModel?: string;
  directorRunId?: string;
  overlaySkippedReason?: string;
  promptKey?: string;
  promptVersion?: string;
  refused: boolean;
  advisory: true;
  mutationEnabled: false;
  profile?: {
    contextAssemblyMs?: number;
    modelMs?: number;
    toolMs?: number;
    totalMs?: number;
  };
};

const DEFAULT_STARTERS = [
  "Summarize this inspection.",
  "What defects are recorded?",
  "What condition information is recorded?",
  "What evidence is registered?",
  "What information is missing?",
  "Compare inspection history for this target.",
  "Draft a non-authoritative report narrative from the snapshot.",
];

const CLAIM_STYLES: Record<string, string> = {
  FACT: "border-slate-200 bg-white text-slate-800",
  DETERMINISTIC_RESULT: "border-slate-200 bg-slate-50 text-slate-800",
  AI_INTERPRETATION: "border-violet-200 bg-violet-50 text-violet-950",
  UNKNOWN: "border-amber-200 bg-amber-50 text-amber-950",
  LIMITATION: "border-slate-200 bg-slate-100 text-slate-700",
};

export function InspectionEngineerEntry({
  sessionId,
  reportId,
  targetKind,
  targetCanonicalId,
  projectId,
  commandCentre,
}: {
  sessionId?: string;
  reportId?: string;
  targetKind?: string;
  targetCanonicalId?: string;
  projectId?: string;
  commandCentre?: boolean;
}) {
  const params = new URLSearchParams();
  if (sessionId) params.set("sessionId", sessionId);
  if (reportId) params.set("reportId", reportId);
  if (targetKind) params.set("targetKind", targetKind);
  if (targetCanonicalId) params.set("targetCanonicalId", targetCanonicalId);
  if (projectId) params.set("projectId", projectId);
  if (commandCentre) params.set("commandCentre", "1");
  const query = params.toString();
  return (
    <Link
      href={query ? `/engineering/apps/inspection-intelligence/engineer?${query}` : "/engineering/apps/inspection-intelligence/engineer"}
      data-testid="inspection-engineer-open"
      className="text-cyan-700 hover:underline"
    >
      Ask AI Inspection Engineer
    </Link>
  );
}

export function InspectionAiEngineerView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const reportId = searchParams.get("reportId") ?? "";
  const targetKind = searchParams.get("targetKind") ?? "";
  const targetCanonicalId = searchParams.get("targetCanonicalId") ?? "";
  const commandCentre = searchParams.get("commandCentre") === "1";
  const [sessions, setSessions] = useState<InspectionRow[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<EngineerAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hostedGet<InspectionRow[]>("sessions")
      .then((rows) => {
        if (!cancelled) setSessions(Array.isArray(rows) ? rows : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to list sessions");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ask = useCallback(
    async (nextQuestion: string) => {
      if (!nextQuestion.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/engineering/inspection-intelligence/engineer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            question: nextQuestion.trim(),
            sessionId: sessionId || undefined,
            reportId: reportId || undefined,
            targetKind: targetKind || undefined,
            targetCanonicalId: targetCanonicalId || undefined,
            projectId: selectedProjectId(),
            commandCentre: commandCentre || undefined,
          }),
        });
        const body = (await response.json()) as { data?: EngineerAnswer; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? `Engineer request failed (${response.status})`);
        setAnswer(body.data ?? null);
      } catch (err) {
        setAnswer(null);
        setError(err instanceof Error ? err.message : "Engineer unavailable");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, reportId, targetKind, targetCanonicalId, commandCentre],
  );

  const starters = answer?.starterQuestions?.length ? answer.starterQuestions : DEFAULT_STARTERS;
  const contextBound = Boolean(sessionId || reportId || (targetKind && targetCanonicalId));

  return (
    <div data-testid="inspection-intelligence-engineer" className="space-y-8">
      <p
        className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950"
        data-testid="engineer-advisory-banner"
      >
        Advisory only. AI Inspection Engineer output is not a professional certification, approval, or
        remaining-life prediction. Canonical inspection truth remains hosted inspection records and
        deterministic Inspection Intelligence.
      </p>

      <label className="block max-w-md text-sm text-slate-700">
        Inspection session
        <select
          data-testid="engineer-session-select"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          value={sessionId}
          onChange={(event) => {
            const next = event.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (next) params.set("sessionId", next);
            else params.delete("sessionId");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
          }}
        >
          <option value="">No session bound</option>
          {sessions.map((session) => (
            <option key={String(session.id)} value={String(session.id)}>
              {String(session.status)} · {String(session.id).slice(0, 8)}
            </option>
          ))}
        </select>
      </label>

      {!contextBound ? (
        <EmptyState
          title="Optional inspection context"
          description="Select a session, or open Engineer from a session, defect, history, or report. Questions still answer from records you can already read."
          data-testid="engineer-context-empty"
        />
      ) : null}

      <div className="space-y-3" data-testid="engineer-starters">
        <SectionHeader title="Starter questions" description="Prompts stay within recorded inspection facts." />
        <div className="flex flex-wrap gap-2">
          {starters.map((starter) => (
            <button
              key={starter}
              type="button"
              data-testid="engineer-starter"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
              onClick={() => {
                setQuestion(starter);
                void ask(starter);
              }}
            >
              {starter}
            </button>
          ))}
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(question);
          }}
        >
          <label className="block flex-1 text-sm text-slate-700">
            Question
            <textarea
              data-testid="engineer-question-input"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              rows={3}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>
          <button
            type="submit"
            data-testid="engineer-ask"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            disabled={loading}
          >
            {loading ? "Asking…" : "Ask"}
          </button>
        </form>
      </div>

      {error ? <EmptyState title="Engineer unavailable" description={error} data-testid="engineer-error" /> : null}

      {answer ? (
        <div className="space-y-4" data-testid="engineer-answer">
          {answer.aiAvailable ? (
            <p className="text-xs text-slate-500" data-testid="engineer-ai-available">
              Platform AI Director overlay: {answer.aiProvider ?? "routed"} / {answer.aiModel ?? "policy model"}
              {answer.directorRunId ? ` · run ${answer.directorRunId}` : ""}
              {answer.promptKey ? ` · prompt ${answer.promptKey}` : ""}
              {answer.promptVersion ? `@${answer.promptVersion}` : ""}
            </p>
          ) : (
            <p
              className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950"
              data-testid="engineer-ai-unavailable"
            >
              Deterministic Inspection Intelligence answered this question. The Platform AI Director overlay is
              unavailable{answer.overlaySkippedReason ? ` (${answer.overlaySkippedReason})` : ""}.
            </p>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-800">
              <p data-testid="engineer-answer-text">{answer.summary}</p>
              <p className="text-xs text-slate-500" data-testid="engineer-confidence-basis">
                {answer.confidenceBasis}
              </p>
              <ul data-testid="engineer-claims" className="space-y-2">
                {answer.claims.map((claim, index) => (
                  <li
                    key={`${claim.kind}-${index}`}
                    data-testid={`engineer-claim-${claim.kind}`}
                    className={`rounded-md border px-3 py-2 ${CLAIM_STYLES[claim.kind] ?? CLAIM_STYLES.FACT}`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide">{claim.kind}</span>
                    <p className="mt-1">{claim.text}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card data-testid="engineer-citations">
            <CardHeader>
              <CardTitle>Source references</CardTitle>
            </CardHeader>
            <CardContent>
              {answer.inspectionRefs.length === 0 ? (
                <p className="text-sm text-slate-600">No inspection source identifiers were attached.</p>
              ) : (
                <ul className="space-y-1 text-sm text-slate-700">
                  {answer.inspectionRefs.map((cite) => (
                    <li key={`${cite.entityType}:${cite.entityId}`} data-testid={`engineer-citation-${cite.entityId}`}>
                      {cite.label} · {cite.sourceDomain}/{cite.entityType}
                      {cite.asOf ? ` · as of ${cite.asOf}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="engineer-unknowns">
            UNKNOWN: {answer.unknowns.join("; ") || "none recorded"}
          </p>
          <p className="text-xs text-slate-500" data-testid="engineer-limitations">
            Limitations: {answer.limitations.join("; ")}
          </p>
          <div className="flex flex-wrap gap-3 text-sm" data-testid="engineer-navigation">
            {answer.navigation.map((item) => (
              <Link key={item.path} href={item.path} className="text-cyan-800 underline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
