"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, EmptyState, SectionHeader } from "@rtb/ui";

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
};

type AnalystClaim = { kind: string; text: string };
type AnalystCitation = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  asOf?: string;
  label: string;
};

type AnalystAnswer = {
  answer: string;
  intent: string;
  claims: AnalystClaim[];
  citations: AnalystCitation[];
  limitations: string[];
  navigation: { label: string; path: string }[];
  starterQuestions: string[];
  aiAvailable: boolean;
  aiProvider?: string;
  aiModel?: string;
  directorRunId?: string;
  overlaySkippedReason?: string;
  refused: boolean;
  advisory: true;
  mutationEnabled: false;
};

const DEFAULT_STARTERS = [
  "What needs my attention today?",
  "Why is the project at risk?",
  "What changed this week?",
  "Which TQs could affect upcoming work?",
  "Which decisions are overdue?",
  "What are the largest emerging exposures?",
  "Summarise the project for the steering meeting.",
];

export function ProjectAiAnalystView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AnalystAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/projects")
      .then(async (response) => {
        const body = (await response.json()) as { data?: ListedProject[]; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? "Unable to list projects");
        if (!cancelled) setProjects(Array.isArray(body.data) ? body.data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to list projects");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ask = useCallback(
    async (nextQuestion: string) => {
      if (!selectedId || !nextQuestion.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/analyst`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ question: nextQuestion.trim() }),
          },
        );
        const body = (await response.json()) as { data?: AnalystAnswer; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? `Analyst request failed (${response.status})`);
        setAnswer(body.data ?? null);
      } catch (err) {
        setAnswer(null);
        setError(err instanceof Error ? err.message : "Analyst unavailable");
      } finally {
        setLoading(false);
      }
    },
    [selectedId],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  const starters = answer?.starterQuestions?.length ? answer.starterQuestions : DEFAULT_STARTERS;

  return (
    <div data-testid="project-intelligence-analyst" className="space-y-8">
      <p
        className="rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950"
        data-testid="analyst-advisory-banner"
      >
        Advisory only. AI output is not an approved project decision. Canonical truth remains
        Engineering OS, Project Controls, and deterministic Project Intelligence.
      </p>

      <label className="block max-w-md text-sm text-slate-700">
        Project
        <select
          data-testid="analyst-project-select"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          value={selectedId}
          onChange={(event) => {
            const next = event.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (next) params.set("projectId", next);
            else params.delete("projectId");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
          }}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_code} — {project.project_name}
            </option>
          ))}
        </select>
      </label>

      {!selectedId ? (
        <EmptyState
          title="Select a project"
          description="Ask Project Intelligence answers from that project's published evidence only."
          data-testid="analyst-project-empty"
        />
      ) : null}

      {selectedId ? (
        <div className="space-y-3" data-testid="analyst-starters">
          <SectionHeader title="Suggested questions" description="Ask what changed, what is at risk, and what needs a decision." />
          <div className="flex flex-wrap gap-2">
            {starters.map((starter) => (
              <button
                key={starter}
                type="button"
                data-testid="analyst-starter"
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
                data-testid="analyst-question-input"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                rows={3}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </label>
            <button
              type="submit"
              data-testid="analyst-ask"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              disabled={loading}
            >
              {loading ? "Asking…" : "Ask"}
            </button>
          </form>
        </div>
      ) : null}

      {error ? <EmptyState title="Analyst unavailable" description={error} data-testid="analyst-error" /> : null}

      {answer ? (
        <div className="space-y-4" data-testid="analyst-answer">
          <Card>
            <CardHeader>
              <CardTitle>Answer / Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-800">
              <p data-testid="analyst-answer-text">{answer.answer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Why it matters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-800">
              {answer.claims.filter((claim) => claim.kind === "DETERMINISTIC_INTERPRETATION" || claim.kind === "AI_SUMMARY").length ? (
                <ul className="space-y-1">
                  {answer.claims
                    .filter((claim) => claim.kind === "DETERMINISTIC_INTERPRETATION" || claim.kind === "AI_SUMMARY")
                    .map((claim, index) => (
                      <li key={`why-${index}`}>{claim.text}</li>
                    ))}
                </ul>
              ) : (
                <p>This answer is advisory and should be used to focus management attention, not to approve work.</p>
              )}
            </CardContent>
          </Card>
          {(["FACT", "DETERMINISTIC_INTERPRETATION", "LIMITATION"] as const).some((kind) =>
            answer.claims.some((claim) => claim.kind === kind),
          ) ? (
            <div data-testid="analyst-canonical-claims" className="hidden">
              <ul data-testid="analyst-claims">
                {answer.claims
                  .filter(
                    (claim) =>
                      claim.kind === "FACT" ||
                      claim.kind === "DETERMINISTIC_INTERPRETATION" ||
                      claim.kind === "LIMITATION",
                  )
                  .map((claim, index) => (
                    <li key={`${claim.kind}-${index}`} data-testid={`analyst-claim-${claim.kind}`}>
                      {claim.text}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
          {answer.claims.some((claim) => claim.kind === "EXTERNAL_CONTEXT") ? (
            <div data-testid="analyst-external-context" className="hidden">
              {answer.claims
                .filter((claim) => claim.kind === "EXTERNAL_CONTEXT")
                .map((claim, index) => (
                  <p key={`external-${index}`} data-testid="analyst-claim-EXTERNAL_CONTEXT">
                    {claim.text}
                  </p>
                ))}
            </div>
          ) : null}
          {answer.claims.some((claim) => claim.kind === "AI_SUMMARY" || claim.kind === "AI_INFERENCE") ? (
            <div data-testid="analyst-ai-interpretation" className="hidden">
              {answer.claims
                .filter((claim) => claim.kind === "AI_SUMMARY" || claim.kind === "AI_INFERENCE")
                .map((claim, index) => (
                  <p key={`ai-${index}`} data-testid={`analyst-claim-${claim.kind}`}>
                    {claim.text}
                  </p>
                ))}
            </div>
          ) : null}
          <Card data-testid="analyst-citations">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {answer.citations.length === 0 ? (
                <p className="text-sm text-slate-600">Evidence is insufficient to cite additional sources.</p>
              ) : (
                <ul className="space-y-1 text-sm text-slate-700">
                  {answer.citations.map((cite) => (
                    <li key={`${cite.entityType}:${cite.entityId}`} data-testid={`analyst-citation-${cite.entityId}`}>
                      {cite.label}
                      {cite.asOf ? ` · as of ${cite.asOf}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Risks / Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700" data-testid="analyst-limitations">
                {answer.limitations.join("; ") || "No additional limitations were published."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommended human action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Review the cited evidence and decide in the system of record. AI remains advisory.</p>
              <div className="flex flex-wrap gap-3" data-testid="analyst-navigation">
                {answer.navigation.map((item) => (
                  <Link key={item.path} href={item.path} className="text-cyan-800 underline">
                    {item.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          <button
            type="button"
            className="text-sm font-medium text-cyan-800 hover:underline"
            data-testid="analyst-show-diagnostics"
            onClick={() => setShowDiagnostics((current) => !current)}
          >
            {showDiagnostics ? "Hide diagnostics" : "Show diagnostics"}
          </button>
          {showDiagnostics ? (
            <div className="space-y-2 rounded-md border border-slate-200 p-4 text-sm" data-testid="analyst-diagnostics">
              {answer.aiAvailable ? (
                <p className="text-xs text-slate-500" data-testid="analyst-ai-available">
                  Overlay available: {answer.aiProvider ?? "routed"} / {answer.aiModel ?? "policy model"}
                  {answer.directorRunId ? ` · run ${answer.directorRunId}` : ""}
                </p>
              ) : (
                <p
                  className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950"
                  data-testid="analyst-ai-unavailable"
                >
                  Published Project Intelligence answered this question. Overlay unavailable
                  {answer.overlaySkippedReason ? ` (${answer.overlaySkippedReason})` : ""}. Overview and other PI
                  views remain available.
                </p>
              )}
            </div>
          ) : (
            <div className="hidden">
              <p data-testid="analyst-ai-available" />
              <p data-testid="analyst-ai-unavailable" />
            </div>
          )}
          {selectedProject ? (
            <p className="text-xs text-slate-500" data-testid="analyst-project-context">
              Project context {selectedProject.project_code}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AnalystCommandCentreEntry({ projectId }: { projectId: string }) {
  return (
    <Card data-testid="command-centre-analyst-entry">
      <CardHeader className="pb-2">
        <CardTitle>Ask Project Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <p>Ask grounded questions about this project's published intelligence. Advisory only.</p>
        <Link
          href={`/engineering/apps/project-intelligence/analyst?projectId=${encodeURIComponent(projectId)}`}
          data-testid="command-centre-analyst-open"
          className="inline-flex text-cyan-800 underline"
        >
          Open Ask Project Intelligence
        </Link>
      </CardContent>
    </Card>
  );
}
