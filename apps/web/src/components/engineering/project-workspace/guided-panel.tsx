"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { workspaceHref } from "@/lib/engineering/project-workspace-ia";
import {
  engineerFacingExplanation,
  engineerFacingLifecycleLabel,
  type GuidedGenerationResult,
  type GuidedProposal,
  type NextBestAction,
  type SimplifiedGateReadiness,
  type GuidedTask,
} from "@/lib/engineering/eos3-guided-engineering";

type GuidedView = {
  mode: string;
  experienceLevel: string;
  tasks: GuidedTask[];
  nextActions: NextBestAction[];
  gate: SimplifiedGateReadiness;
  counts: Record<string, number>;
  setup: { description: string; projectType: string; industry: string };
};

const CHANGE_INPUT_PLACEHOLDER =
  "Describe an actual engineering change, such as revised vendor data, changed operating conditions, or updated site information.";

export function GuidedEngineeringPanel({ projectId }: { projectId: string }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [objective, setObjective] = useState("");
  const [whyNeeded, setWhyNeeded] = useState("");
  const [docs, setDocs] = useState("");
  const [generation, setGeneration] = useState<GuidedGenerationResult | null>(null);
  const [proposals, setProposals] = useState<GuidedProposal[]>([]);
  const [view, setView] = useState<GuidedView | null>(null);
  const [utterance, setUtterance] = useState("");
  const [changeResult, setChangeResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<
    "GUIDED" | "ENGINEERING_WORKSPACE" | "GOVERNANCE_WORKSPACE"
  >("GUIDED");

  const loadView = useCallback(async () => {
    const res = await fetch(
      `/api/engineering/projects/${projectId}/workspace?view=guided`,
    );
    const parsed = await parseApiJsonResponse<GuidedView>(res);
    if (parsed.ok && parsed.data) setView(parsed.data);
  }, [projectId]);

  useEffect(() => {
    void loadView();
  }, [loadView]);

  useEffect(() => {
    const existing = view?.setup?.description?.trim();
    if (existing) {
      setObjective(existing);
    }
  }, [view?.setup?.description]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "guided_generate",
          objective,
          whyNeeded: whyNeeded || undefined,
          documentNames: docs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const parsed = await parseApiJsonResponse<{
        timeToFirstValue?: string;
      } & GuidedGenerationResult>(res);
      if (!parsed.ok || !parsed.data) {
        setError(parsed.errorMessage ?? "Could not generate project definition");
        setBusy(false);
        return;
      }
      setGeneration(parsed.data);
      setProposals(parsed.data.proposals ?? []);
      setStep(2);
      await loadView();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function decide(stableObjectId: string, decision: "CONFIRMED" | "REJECTED") {
    await fetch(`/api/engineering/projects/${projectId}/workspace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "guided_accept_proposal",
        stableObjectId,
        decision,
      }),
    });
    setProposals((prev) =>
      prev.map((p) =>
        p.stableObjectId === stableObjectId
          ? { ...p, accepted: decision === "CONFIRMED" }
          : p,
      ),
    );
  }

  async function bulkSafe() {
    const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "guided_bulk_accept_safe",
        proposals,
      }),
    });
    const parsed = await parseApiJsonResponse<{ accepted: string[]; skipped: string[] }>(res);
    if (parsed.ok && parsed.data) {
      setProposals((prev) =>
        prev.map((p) =>
          parsed.data!.accepted.includes(p.stableObjectId)
            ? { ...p, accepted: true }
            : p,
        ),
      );
    }
  }

  async function captureChange() {
    setBusy(true);
    setChangeResult(null);
    const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "guided_natural_change",
        utterance,
      }),
    });
    const parsed = await parseApiJsonResponse<{
      interpretedAs?: string;
      affected?: unknown[];
    }>(res);
    setBusy(false);
    if (parsed.ok && parsed.data?.interpretedAs) {
      setChangeResult(
        `${parsed.data.interpretedAs} · affected ${parsed.data.affected?.length ?? 0} objects (not auto-approved)`,
      );
      await loadView();
    } else {
      setError(parsed.errorMessage ?? "Change capture failed");
    }
  }

  const gate = generation?.gate ?? view?.gate;

  return (
    <div className="space-y-6" data-testid="guided-engineering-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">
            Default mode · Guided Engineering
          </p>
          <h2 className="text-lg font-semibold text-slate-100">What are you trying to accomplish?</h2>
          <p className="text-sm text-slate-400">
            EOS prepares the project. You confirm material exceptions. Generated content is never auto-approved.
            {view?.setup?.description?.trim()
              ? " Existing project objective is shown below — edit if needed; do not re-enter from scratch."
              : null}
          </p>
        </div>
        <label className="text-xs text-slate-400">
          Experience level
          <select
            className="mt-1 block min-h-11 rounded-md border border-slate-600 bg-slate-950 px-2 text-sm text-slate-100"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
            data-testid="experience-level"
          >
            <option value="GUIDED">Level 1 — Guided Engineering</option>
            <option value="ENGINEERING_WORKSPACE">Level 2 — Engineering Workspace</option>
            <option value="GOVERNANCE_WORKSPACE">Level 3 — Governance Workspace</option>
          </select>
        </label>
      </div>

      {experienceLevel !== "GUIDED" ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
          <p>
            Advanced surfaces remain available.{" "}
            {experienceLevel === "ENGINEERING_WORKSPACE"
              ? "Open Requirements, Basis, Assumptions, Systems, Calculations, Decisions, Changes, Deliverables, Reviews, Digital Thread from the project navigation."
              : "Open Lifecycle, Evidence, Qualification, Audit, Configuration History, Trust from Governance navigation."}
          </p>
          <p className="mt-2">
            <Link href={workspaceHref(projectId, "requirements")} className="underline-offset-2 hover:underline">
              Open Engineering Workspace
            </Link>
            {" · "}
            <Link href={workspaceHref(projectId, "lifecycle")} className="underline-offset-2 hover:underline">
              Open Governance
            </Link>
          </p>
        </div>
      ) : null}

      <ol className="flex flex-wrap gap-2 text-xs" aria-label="Simplified project setup">
        {[
          "1. Tell EOS about the project",
          "2. Review what EOS prepared",
          "3. Confirm material assumptions & gaps",
          "4. Start engineering",
        ].map((label, i) => (
          <li
            key={label}
            className={`rounded-full border px-3 py-1 ${
              step === i + 1
                ? "border-amber-400/50 bg-amber-500/10 text-amber-100"
                : "border-slate-700 text-slate-400"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section className="space-y-3 rounded-lg border border-slate-700 bg-slate-950/60 p-4" data-testid="guided-step-1">
          {view?.setup?.description?.trim() ? (
            <p className="text-xs text-emerald-200" data-testid="guided-objective-reuse">
              Project objective already on record — shown for edit (not re-entry).
            </p>
          ) : null}
          <label className="block text-xs text-slate-400">
            What are you trying to do? <span className="text-rose-300">(required)</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              required
              data-testid="guided-objective-input"
              aria-label="Project objective"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Why is it needed? (only if not obvious)
            <Input className="mt-1" value={whyNeeded} onChange={(e) => setWhyNeeded(e.target.value)} />
          </label>
          <p className="text-xs text-slate-500">
            Project owner: defaulted from your signed-in account (not re-asked).
          </p>
          <label className="block text-xs text-slate-400">
            Optional supporting documents (comma-separated names)
            <Input
              className="mt-1"
              value={docs}
              onChange={(e) => setDocs(e.target.value)}
              placeholder="scope brief, datasheet, existing drawings…"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="button" disabled={busy || !objective.trim()} onClick={() => void generate()}>
            {busy ? "Preparing…" : "Prepare project definition"}
          </Button>
        </section>
      ) : null}

      {step >= 2 && generation ? (
        <section className="space-y-4" data-testid="guided-step-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-100">
            First useful engineering state ready in{" "}
            <strong data-testid="time-to-first-value">
              {(generation as GuidedGenerationResult & { timeToFirstValue?: string }).timeToFirstValue ??
                `${generation.durationMs}ms`}
            </strong>
            . Manual input reduction:{" "}
            <strong data-testid="manual-input-reduction">
              {generation.manualInputReductionPercent}%
            </strong>{" "}
            (baseline {generation.manualInputBaseline} → guided {generation.manualInputGuided}).
            Duplicate input requests: {generation.duplicateInputRequestCount}.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Project type" value={generation.setup.projectType || "—"} />
            <Stat label="Industry" value={generation.setup.industry || "—"} />
            <Stat
              label="Disciplines"
              value={generation.setup.disciplines.join(", ") || "—"}
            />
            <Stat
              label="Lifecycle"
              value={engineerFacingLifecycleLabel(generation.setup.lifecycleTemplate)}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              What EOS prepared — needs confirmation (not approved)
            </h3>
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto" data-testid="guided-proposals">
              {proposals.slice(0, 24).map((p) => {
                const material =
                  String(p.provenance.materiality).toUpperCase().includes("HIGH") ||
                  String(p.provenance.confidence).toUpperCase().includes("LOW") ||
                  Boolean(p.uncertainty);
                return (
                <li
                  key={p.id}
                  className="rounded border border-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="font-mono text-[11px] text-amber-200">{p.stableObjectId}</span>{" "}
                      {p.title}
                    </span>
                    <span className="text-[11px] text-amber-100/90" data-testid="guided-friendly-state">
                      Needs confirmation
                      <details className="inline ml-2 text-slate-500">
                        <summary className="inline cursor-pointer">Details</summary>
                        <span className="ml-1 font-mono">
                          {p.lifecycleState} · {p.provenance.confidence}/{p.provenance.materiality} ·{" "}
                          {p.provenance.disposition}
                        </span>
                      </details>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{p.summary}</p>
                  {material ? (
                    <details className="mt-1 text-xs text-slate-500" open data-testid="explainability-prominent">
                      <summary>Why?</summary>
                      <p className="mt-1">{engineerFacingExplanation(p.whySuggested)}</p>
                      <p>Source: {p.provenance.source}</p>
                      {p.uncertainty ? <p>Uncertainty: {p.uncertainty}</p> : null}
                    </details>
                  ) : (
                    <details className="mt-1 text-xs text-slate-500" data-testid="explainability-compact">
                      <summary>Why?</summary>
                      <p className="mt-1">{engineerFacingExplanation(p.whySuggested)}</p>
                      <p>Source: {p.provenance.source}</p>
                    </details>
                  )}
                  {step === 3 && p.accepted == null ? (
                    <div className="mt-2 flex gap-2">
                      <Button type="button" size="sm" onClick={() => void decide(p.stableObjectId, "CONFIRMED")}>
                        Accept draft
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void decide(p.stableObjectId, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : p.accepted != null ? (
                    <p className="mt-1 text-xs text-emerald-300">
                      {p.accepted ? "Draft accepted (still NOT_APPROVED)" : "Rejected"}
                    </p>
                  ) : null}
                </li>
                );
              })}
            </ul>
            {step === 3 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="guided-bulk-accept-safe"
                className="mt-3 border-slate-500 bg-slate-100 text-slate-900 hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:bg-slate-200 active:text-slate-950 disabled:pointer-events-none disabled:border-slate-500 disabled:bg-slate-700 disabled:text-slate-100 disabled:opacity-100"
                onClick={() => void bulkSafe()}
              >
                Bulk accept low-risk administrative proposals only
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {step === 2 ? (
              <Button type="button" onClick={() => setStep(3)}>
                Confirm material items
              </Button>
            ) : null}
            {step === 3 ? (
              <Button type="button" onClick={() => setStep(4)}>
                Start engineering
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 4 || (view && (view.counts?.Requirement ?? 0) > 0) ? (
        <section className="space-y-4" data-testid="guided-step-4">
          <h3 className="text-sm font-semibold text-slate-100">Project readiness</h3>
          {gate ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4" data-testid="simplified-gate">
              <p className="text-lg font-semibold text-slate-100">
                {gate.percentReady === null
                  ? gate.readinessMessage ?? "Readiness cannot yet be reliably calculated"
                  : `${gate.percentReady}% ready for Concept Definition`}
              </p>
              <p className="text-xs text-slate-400">{gate.stageLabel}</p>
              {gate.percentReady !== null && gate.readinessMessage ? (
                <p className="text-xs text-slate-500">{gate.readinessMessage}</p>
              ) : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-emerald-300">Completed</p>
                  <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">
                    {gate.completed.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-200">
                    Needs attention
                    {gate.blockers.length ? ` · ${gate.blockers.length} items prevent progression` : ""}
                  </p>
                  <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">
                    {gate.needsAttention.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-200">
                Recommended next action: {gate.recommendedNextAction}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm">
                  {gate.primaryActionLabel}
                </Button>
                <Link
                  href={workspaceHref(projectId, gate.advancedHrefSlug)}
                  className="inline-flex min-h-11 items-center text-sm underline-offset-2 hover:underline"
                >
                  View full gate evidence
                </Link>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-slate-100">Next recommended actions</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300" data-testid="next-best-actions">
              {(generation?.nextActions ?? view?.nextActions ?? []).map((a) => (
                <li key={a.id}>
                  <Link
                    href={workspaceHref(projectId, a.hrefSlug === "guided" ? "guided" : a.hrefSlug)}
                    className="underline-offset-2 hover:underline"
                  >
                    {a.label}
                  </Link>
                  <span className="text-xs text-slate-500"> — {a.reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">Engineering tasks</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2" data-testid="guided-tasks">
              {(generation?.tasks ?? view?.tasks ?? []).map((t) => (
                <li key={t.id} className="rounded border border-slate-800 px-3 py-2 text-sm text-slate-200">
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-slate-500">
                    {t.description} · ≤{t.interactionsEstimate} interactions · {t.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-700 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Natural engineering update</h3>
            <p className="text-xs text-slate-400">
              Describe a change in plain language. EOS proposes the governed change and impact — you retain authority.
            </p>
            <textarea
              className="min-h-16 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              placeholder={CHANGE_INPUT_PLACEHOLDER}
              data-testid="guided-change-input"
              aria-label="Natural engineering change"
            />
            <Button
              type="button"
              size="sm"
              disabled={busy || !utterance.trim()}
              onClick={() => void captureChange()}
            >
              Capture change
            </Button>
            {changeResult ? (
              <p className="text-sm text-emerald-300" data-testid="natural-change-result">
                {changeResult}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-700 p-4" data-testid="guided-information-gap-panel">
            <h3 className="text-sm font-semibold text-slate-100">Information gap</h3>
            <p className="text-xs text-slate-400">
              Equipment operating, test or dynamic load information has not been provided. EOS keeps this as an
              information gap rather than inventing an assumption. An assumption is only appropriate when an
              engineer explicitly proposes a provisional engineering value and basis.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
