"use client";

import Link from "next/link";
import { useState } from "react";
import { PROJECT_INTELLIGENCE_VERSION } from "@rtb/project-intelligence/version";

type ReasoningResult = {
  status: "answered" | "abstained";
  answer: string;
  intent: string;
  confidence: number;
  abstained: boolean;
  abstentionReason: string | null;
  deterministic: true;
  citations: Array<{ refId: string; excerpt: string; drillDownPath: string; owner: string }>;
  drillDown: Array<{ refId: string; label: string; path: string; owner: string }>;
  stageTrace: Array<{ stage: string; status: string; detail: string }>;
};

export default function EngineeringReasoningAssistantPage() {
  const [question, setQuestion] = useState("What do we know about the valve leak risk finding?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningResult | null>(null);

  async function run(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engineering/project-intelligence/reasoning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = (await res.json()) as { data?: ReasoningResult; error?: { message?: string } };
      if (!res.ok) {
        setError(body.error?.message ?? "Reasoning failed");
        setResult(null);
        return;
      }
      setResult(body.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reasoning failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section data-testid="engineering-reasoning-assistant-ready">
      <div data-testid="project-intelligence-copilot-ready">
        <p className="text-sm font-medium text-cyan-700">Engineering Reasoning Assistant</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Grounded engineering answers</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Deterministic pipeline over Knowledge Intelligence: intent, permissions, graph traversal,
          hybrid retrieval, ranking, conflict detection, citations, confidence, and abstention.
          Orchestration-only — no duplicated Core records. Project Intelligence {PROJECT_INTELLIGENCE_VERSION}.
        </p>

        <form className="mt-8 max-w-2xl space-y-3" onSubmit={run} aria-label="Reasoning assistant">
          <label className="block text-sm font-medium text-slate-800" htmlFor="reasoning-question">
            Question
          </label>
          <input
            id="reasoning-question"
            data-testid="reasoning-assistant-input"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            data-testid="reasoning-assistant-submit"
            className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-60"
            disabled={loading || !question.trim()}
          >
            {loading ? "Reasoning…" : "Run pipeline"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 space-y-4" data-testid="reasoning-assistant-result">
            <p className="text-xs text-slate-500">
              Intent {result.intent} · confidence {result.confidence.toFixed(3)} · {result.status}
            </p>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">
                {result.abstained ? "Abstained" : "Grounded answer"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {result.abstained ? result.abstentionReason : result.answer}
              </p>
            </div>
            <ol className="space-y-1 text-xs text-slate-600" aria-label="Pipeline stages">
              {result.stageTrace.map((s) => (
                <li key={`${s.stage}-${s.detail}`}>
                  <span className="font-medium text-slate-800">{s.stage}</span> — {s.status}: {s.detail}
                </li>
              ))}
            </ol>
            {result.drillDown.length > 0 && (
              <ul className="space-y-2" aria-label="Evidence drill-down">
                {result.drillDown.map((d) => (
                  <li key={d.refId}>
                    <Link className="text-sm text-cyan-700 hover:underline" href={d.path}>
                      {d.label} ({d.owner})
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="mt-8 text-sm">
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/knowledge"
          >
            Unified knowledge search
          </Link>
        </p>
      </div>
    </section>
  );
}
