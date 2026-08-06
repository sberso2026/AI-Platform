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

export default function KnowledgeIntelligencePage() {
  const [query, setQuery] = useState("valve leak risk finding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse["data"] | null>(null);

  async function runSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
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

  return (
    <section data-testid="knowledge-search-ready">
      <div data-testid="project-intelligence-knowledge-ready">
        <p className="text-sm font-medium text-cyan-700">Knowledge Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Unified intelligence search</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Graph-backed hybrid search across Document, Meeting, Findings, Reporting Intelligence and
          Engineering Core. Results are citation-aware references — never duplicated business
          records. Retrieval uses the Platform AI Runtime only.
        </p>

        <form className="mt-8 max-w-2xl space-y-3" onSubmit={runSearch} aria-label="Knowledge search">
          <label className="block text-sm font-medium text-slate-800" htmlFor="knowledge-query">
            Search query
          </label>
          <input
            id="knowledge-query"
            data-testid="knowledge-search-input"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            data-testid="knowledge-search-submit"
            className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-60"
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert" data-testid="knowledge-search-error">
            {error}
          </p>
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
            ["Unified search", "Hybrid vector + lexical + metadata filters"],
            ["Knowledge graph", "Relationship refs across PI and Core"],
            ["Impact analysis", "Depends-on and impacted-by traversal"],
            ["Citations", "Drill-down to owning feature evidence"],
            ["Related items", "Neighbor discovery without ownership clone"],
            ["AI retrieval", "Platform AI Runtime grounded answers only"],
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
