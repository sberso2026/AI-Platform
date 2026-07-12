"use client";

import { useState } from "react";

type GroundedAnswer = {
  answer?: string;
  answerStatus: string;
  confidence: number;
  citations: Array<{
    engineeringDocumentId: string;
    documentNumber?: string;
    documentTitle?: string;
    revision: string;
    excerpt: string;
    evidenceScore: number;
    chunkId: string;
    pageStart?: number;
    sectionPath?: string;
  }>;
  warnings: string[];
  retrievalTraceId: string;
};

export default function ProjectIntelligenceDocumentsQueryPage() {
  const [question, setQuestion] = useState("What is the design pressure?");
  const [answer, setAnswer] = useState<GroundedAnswer>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function runQuery(extras: { abstain?: boolean; conflict?: boolean } = {}) {
    setBusy(true);
    setError(undefined);
    try {
      const response = await fetch("/api/engineering/project-intelligence/documents/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, ...extras }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Query failed");
      setAnswer(payload.data);
      setDrawerOpen(Boolean(payload.data?.citations?.length));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section data-testid="project-intelligence-documents-query">
      <p className="text-sm font-medium text-cyan-700">Document intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Query workspace</h2>
      <p className="mt-2 text-slate-600">Grounded answers require citations. Abstention is preferred over unsupported claims.</p>

      <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="pi-document-question">
        Question
      </label>
      <textarea
        id="pi-document-question"
        className="mt-2 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900"
        rows={3}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md bg-cyan-700 px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={busy}
          data-testid="project-intelligence-documents-query-submit"
          onClick={() => runQuery()}
        >
          Ask
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          disabled={busy}
          data-testid="project-intelligence-documents-query-abstain"
          onClick={() => runQuery({ abstain: true })}
        >
          Force abstention
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          disabled={busy}
          data-testid="project-intelligence-documents-query-conflict"
          onClick={() => runQuery({ conflict: true })}
        >
          Force conflict
        </button>
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}

      {answer && (
        <div className="mt-8 rounded-lg border border-slate-200 p-5" data-testid="project-intelligence-documents-answer">
          <p className="text-sm text-slate-500">
            Status: <span data-testid={`project-intelligence-answer-status-${answer.answerStatus}`}>{answer.answerStatus}</span>
            {" · "}confidence {Math.round(answer.confidence * 100)}%
          </p>
          {answer.answer && <p className="mt-3 text-slate-900">{answer.answer}</p>}
          {answer.warnings?.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {answer.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          )}
          <button
            type="button"
            className="mt-4 text-sm text-cyan-700 hover:underline"
            data-testid="project-intelligence-documents-citations-toggle"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? "Hide citations" : "Show citations"}
          </button>
        </div>
      )}

      {drawerOpen && answer && (
        <aside
          className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50/40 p-5"
          data-testid="project-intelligence-documents-citations-drawer"
          aria-label="Citations evidence drawer"
        >
          <h3 className="font-medium text-slate-900">Citations</h3>
          <ul className="mt-3 space-y-3">
            {answer.citations.map((citation) => (
              <li key={citation.chunkId} className="rounded-md border border-slate-200 bg-white p-3 text-sm" data-testid="project-intelligence-citation">
                <p className="font-medium text-slate-900">
                  {citation.documentNumber ?? citation.engineeringDocumentId} rev {citation.revision}
                </p>
                <p className="mt-1 text-slate-600">{citation.excerpt}</p>
                <p className="mt-1 text-xs text-slate-500">
                  score {citation.evidenceScore}
                  {citation.pageStart != null ? ` · page ${citation.pageStart}` : ""}
                  {citation.sectionPath ? ` · ${citation.sectionPath}` : ""}
                </p>
              </li>
            ))}
            {!answer.citations.length && <li className="text-slate-500">No citations for this response.</li>}
          </ul>
        </aside>
      )}
    </section>
  );
}
