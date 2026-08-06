"use client";

import Link from "next/link";
import { useState } from "react";

type SearchHit = {
  refId: string;
  kind: string;
  owner: string;
  title: string;
  snippet: string;
  score: number;
  source: string;
  drillDownPath: string;
  citations: Array<{
    owner: string;
    kind: string;
    refId: string;
    excerpt: string;
    score: number;
    drillDownPath: string;
  }>;
};

type SearchResponse = {
  data?: {
    hits: SearchHit[];
    retrievalTraceId: string;
    hybrid: true;
    duplicateOwnership: false;
    groundedAnswer?: {
      status: string;
      answer: string;
      citations: SearchHit["citations"];
      abstentionReason: string | null;
    };
  };
  error?: { message?: string };
};

type ReasoningResponse = {
  data?: {
    status: "answered" | "abstained";
    answer: string;
    intent: string;
    confidence: number;
    abstained: boolean;
    abstentionReason: string | null;
    retrievalTraceId: string;
    deterministic: true;
    citations: SearchHit["citations"];
    drillDown: Array<{ refId: string; label: string; path: string; owner: string; kind: string }>;
    stageTrace: Array<{ stage: string; status: string; detail: string }>;
    conflicts: Array<{ kind: string; detail: string }>;
    reasoningSteps: Array<{ id: string; premise: string }>;
  };
  error?: { message?: string };
};

export default function KnowledgeIntelligencePage() {
  const [query, setQuery] = useState("valve leak risk finding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse["data"] | null>(null);
  const [reasoning, setReasoning] = useState<ReasoningResponse["data"] | null>(null);

  async function runSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setReasoning(null);
    try {
      const res = await fetch("/api/engineering/project-intelligence/knowledge/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, includeGroundedAnswer: true }),
      });
      const body = (await res.json()) as SearchResponse;
      if (!res.ok) {
        setError(body.error?.message ?? "Search failed");
        setResult(null);
        return;
      }
      setResult(body.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function runReason() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/engineering/project-intelligence/knowledge/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reason", question: query }),
      });
      const body = (await res.json()) as ReasoningResponse;
      if (!res.ok) {
        setError(body.error?.message ?? "Reasoning failed");
        setReasoning(null);
        return;
      }
      setReasoning(body.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reasoning failed");
      setReasoning(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section data-testid="knowledge-search-ready">
      <div data-testid="project-intelligence-knowledge-ready">
        <p className="text-sm font-medium text-cyan-700">Knowledge Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Unified intelligence search</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Graph-backed hybrid search and a deterministic reasoning pipeline: intent → permissions →
          traversal → retrieval → ranking → conflict → grounded answer with citations, confidence,
          abstention, and drill-down. No duplicated business records. Platform AI Runtime only.
        </p>

        <form className="mt-8 max-w-2xl space-y-3" onSubmit={runSearch} aria-label="Knowledge search">
          <label className="block text-sm font-medium text-slate-800" htmlFor="knowledge-query">
            Question / search query
          </label>
          <input
            id="knowledge-query"
            data-testid="knowledge-search-input"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              data-testid="knowledge-search-submit"
              className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-60"
              disabled={loading || !query.trim()}
            >
              {loading ? "Working…" : "Search"}
            </button>
            <button
              type="button"
              data-testid="knowledge-reason-submit"
              className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:opacity-60"
              disabled={loading || !query.trim()}
              onClick={runReason}
            >
              Run reasoning pipeline
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert" data-testid="knowledge-search-error">
            {error}
          </p>
        )}

        {reasoning && (
          <div
            className="mt-8 space-y-4"
            data-testid="knowledge-reasoning-ready"
            aria-label="Deterministic reasoning result"
          >
            <p className="text-xs text-slate-500" data-testid="knowledge-reasoning-meta">
              Intent {reasoning.intent} · confidence {reasoning.confidence.toFixed(3)} · status{" "}
              {reasoning.status} · deterministic={String(reasoning.deterministic)}
            </p>
            <div
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              data-testid="knowledge-reasoning-answer"
            >
              <p className="text-sm font-medium text-slate-900">
                {reasoning.abstained ? "Abstained" : "Grounded answer"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {reasoning.abstained ? reasoning.abstentionReason : reasoning.answer}
              </p>
            </div>
            <ol
              className="space-y-1 text-xs text-slate-600"
              data-testid="knowledge-reasoning-stages"
              aria-label="Reasoning pipeline stages"
            >
              {reasoning.stageTrace.map((s) => (
                <li key={`${s.stage}-${s.detail}`}>
                  <span className="font-medium text-slate-800">{s.stage}</span> — {s.status}:{" "}
                  {s.detail}
                </li>
              ))}
            </ol>
            {reasoning.drillDown.length > 0 && (
              <ul className="space-y-2" aria-label="Evidence drill-down">
                {reasoning.drillDown.map((d) => (
                  <li key={d.refId}>
                    <Link
                      className="text-sm text-cyan-700 hover:underline"
                      href={d.path}
                      data-testid="knowledge-citation-drilldown"
                    >
                      {d.label} ({d.owner})
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6" data-testid="knowledge-search-results">
            <p className="text-xs text-slate-500" data-testid="knowledge-retrieval-trace">
              Trace {result.retrievalTraceId} · hybrid={String(result.hybrid)} ·
              duplicateOwnership={String(result.duplicateOwnership)}
            </p>

            {result.groundedAnswer && (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                data-testid="knowledge-grounded-answer"
              >
                <p className="text-sm font-medium text-slate-900">Grounded answer</p>
                <p className="mt-1 text-sm text-slate-700">
                  {result.groundedAnswer.status === "answered"
                    ? result.groundedAnswer.answer
                    : result.groundedAnswer.abstentionReason}
                </p>
              </div>
            )}

            <ul className="space-y-3" aria-label="Knowledge search hits">
              {result.hits.map((hit) => (
                <li
                  key={hit.refId}
                  className="rounded-md border border-slate-200 px-4 py-3"
                  data-testid="knowledge-search-hit"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-slate-900">{hit.title}</p>
                    <p className="text-xs text-slate-500">
                      {hit.owner}/{hit.kind} · {hit.source} · {hit.score.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{hit.snippet}</p>
                  <Link
                    className="mt-2 inline-block text-sm text-cyan-700 hover:underline"
                    href={hit.drillDownPath}
                    data-testid="knowledge-citation-drilldown"
                  >
                    Open evidence
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <nav
          className="mt-10 grid gap-3 text-sm text-slate-700 sm:grid-cols-2"
          aria-label="Knowledge Intelligence surfaces"
        >
          {[
            ["Deterministic pipeline", "Intent → permissions → graph → hybrid → answer"],
            ["Conflict detection", "Abstain on material opposing evidence"],
            ["Citations + confidence", "Ranked evidence with drill-down paths"],
            ["Unified search", "Hybrid vector + lexical + metadata filters"],
            ["Knowledge graph", "Relationship refs across PI and Core"],
            ["Platform AI Runtime", "No private model client"],
          ].map(([title, detail]) => (
            <div key={title} className="rounded-md border border-slate-200 px-4 py-3">
              <p className="font-medium text-slate-900">{title}</p>
              <p className="mt-1 text-slate-600">{detail}</p>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}
