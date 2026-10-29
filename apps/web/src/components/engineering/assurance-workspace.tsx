"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
} from "@/components/engineering/operational";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Condition = {
  id: string;
  status: string;
  conditionType: string;
  conditionCode?: string;
  materiality: string;
  ruleId: string;
  ruleVersion: string;
  rootObjectType: string;
  rootObjectId: string;
  discipline?: string | null;
  explanation: string;
  wouldResolveIf: string;
  digitalThreadPath: string;
  evidencePath?: Array<{ objectType: string; objectId: string; relationship?: string | null; note?: string | null }>;
  disposition?: string | null;
  dispositionRationale?: string | null;
  reviewPackageId?: string | null;
  detectedAt: string;
  lastEvaluatedAt: string;
};

type EvaluationRun = {
  completeness: "COMPLETE" | "PARTIAL" | "FAILED";
  truncated: boolean;
  remainingScopeUnknown?: boolean;
  reason?: string | null;
  conditionsDetected?: number;
  objectsEvaluated?: number;
  rulesEvaluated?: number;
  linkCount?: number;
  linkLimit?: number;
};

type LinkedReview = {
  packages: Array<{ id: string; name?: string | null; status?: string | null }>;
  findings: Array<{ id: string; title: string; status: string; ownedBy: string }>;
  thread?: { path: string; automaticFinding: boolean } | null;
};

const VIEWS = [
  { id: "OPEN", label: "Open" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "ACCEPTED_WITH_JUSTIFICATION", label: "Accepted / Justified" },
  { id: "all", label: "All" },
] as const;

export function AssuranceWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [view, setView] = useState<string>(params?.get("status") ?? "OPEN");
  const [rows, setRows] = useState<Condition[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [selected, setSelected] = useState<Condition | null>(null);
  const [linked, setLinked] = useState<LinkedReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [projectId, setProjectId] = useState("");
  const [documentIds, setDocumentIds] = useState("");
  const [reviewPackageId, setReviewPackageId] = useState("");

  async function load() {
    setError(null);
    const statusQuery = view === "all" ? "" : `&status=${encodeURIComponent(view)}`;
    const list = await parseApiJsonResponse(await fetch(`/api/engineering/assurance?action=list${statusQuery}`));
    const summed = await parseApiJsonResponse(await fetch("/api/engineering/assurance?action=summary"));
    const status = await parseApiJsonResponse(await fetch("/api/engineering/assurance?action=evaluation-status"));
    if (!list.ok) {
      setError(list.errorMessage ?? "Unable to load assurance conditions");
      return;
    }
    setRows(Array.isArray(list.data) ? (list.data as Condition[]) : []);
    if (summed.ok) setSummary((summed.data as Record<string, unknown>) ?? null);
    if (status.ok) setEvaluation((status.data as EvaluationRun | null) ?? null);
  }

  useEffect(() => {
    void load();
  }, [view]);

  useEffect(() => {
    if (!selected) {
      setLinked(null);
      return;
    }
    void fetch(`/api/engineering/assurance?action=linked-reviews&id=${encodeURIComponent(selected.id)}`)
      .then((response) => parseApiJsonResponse(response))
      .then((parsed) => {
      if (parsed.ok) setLinked((parsed.data as LinkedReview) ?? null);
    });
  }, [selected]);

  const counts = useMemo(() => {
    const byType = (summary?.byType as Record<string, number> | undefined) ?? {};
    const byStatus = (summary?.byStatus as Record<string, number> | undefined) ?? {};
    return {
      openTraceability: byType.MISSING_ALLOCATION ?? 0,
      staleEvidence: byType.STALE_EVIDENCE_REFERENCE ?? 0,
      interfaceGaps: (byType.INCOMPLETE_INTERFACE_INFORMATION ?? 0) + (byType.CROSS_DISCIPLINE_INFORMATION_GAP ?? 0),
      underReview: byStatus.UNDER_REVIEW ?? 0,
    };
  }, [summary]);

  async function post(body: Record<string, unknown>) {
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/assurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Action failed");
      return;
    }
    if (body.action === "evaluate") {
      const data = parsed.data as EvaluationRun | undefined;
      if (data?.completeness) setEvaluation(data);
    }
    await load();
    if (selected) {
      const next = await parseApiJsonResponse(
        await fetch(`/api/engineering/assurance?id=${encodeURIComponent(selected.id)}`),
      );
      if (next.ok && next.data && typeof next.data === "object") {
        const payload = next.data as Condition & { linkedReviews?: LinkedReview };
        setSelected(payload);
        if (payload.linkedReviews) setLinked(payload.linkedReviews);
      }
    }
  }

  const completenessLabel =
    evaluation?.completeness === "PARTIAL"
      ? "Evaluation Partial"
      : evaluation?.completeness === "FAILED"
        ? "Evaluation Failed"
        : evaluation?.completeness === "COMPLETE"
          ? "Evaluation Complete"
          : "Evaluation status unknown";
  const emptyIsInconclusive = evaluation?.completeness !== "COMPLETE";

  return (
    <>
      <Header title="Engineering Assurance" />
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Assurance" }]} />
        <h1 className="text-2xl font-semibold">Engineering Assurance</h1>
        <p className="text-sm text-muted-foreground">
          Assurance Conditions identify where evidence, traceability, review, or coordination may require attention.
          They are not defects, non-compliances, or approvals. Engineers retain engineering authority.
        </p>
        <p className="text-sm font-medium">{completenessLabel}</p>
        {evaluation?.completeness === "PARTIAL" ? (
          <p className="text-sm text-muted-foreground">
            Evaluation incomplete. Absence of additional conditions is not conclusive. Truncated at{" "}
            {evaluation.linkCount}/{evaluation.linkLimit} links. Remaining scope is unknown.
          </p>
        ) : null}
        {evaluation?.completeness === "FAILED" ? (
          <p className="text-sm text-destructive">
            Evaluation failed{evaluation.reason ? `: ${evaluation.reason}` : ""}. Existing conditions were not
            auto-resolved from this scan.
          </p>
        ) : null}
        <p className="text-sm">
          {counts.openTraceability} Open Traceability Conditions · {counts.staleEvidence} Stale Evidence Conditions ·{" "}
          {counts.interfaceGaps} Interface Information Gaps · {counts.underReview} Conditions Under Review
        </p>
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Button key={item.id} variant={view === item.id ? "default" : "secondary"} onClick={() => setView(item.id)}>
              {item.label}
            </Button>
          ))}
          <Button onClick={() => void post({ action: "evaluate" })}>Evaluate workspace</Button>
        </div>
        {error ? <OperationalError message={error} /> : null}
        {!rows.length ? (
          <EmptyOperationalState
            title={
              emptyIsInconclusive
                ? "Evaluation incomplete — no conclusive zero-condition result."
                : "No assurance conditions in this view."
            }
            description={
              emptyIsInconclusive
                ? "A partial or failed evaluation cannot prove that additional Assurance Conditions do not exist."
                : "Authorized workspace members see conditions in the selected status view after evaluation."
            }
          />
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                className="w-full rounded border p-3 text-left text-sm"
                onClick={() => setSelected(row)}
              >
                <p className="font-medium">{row.conditionType}</p>
                <p className="text-muted-foreground">
                  {row.rootObjectType} {row.rootObjectId} · {row.status} · {row.materiality}
                </p>
              </button>
            ))}
          </div>
          {selected ? (
            <section className="space-y-2 rounded border p-4 text-sm">
              <h2 className="font-medium">Condition detail</h2>
              <p>Status: {selected.status}</p>
              <p>Type: {selected.conditionType}</p>
              <p>
                Root object: {selected.rootObjectType} {selected.rootObjectId}
              </p>
              <p>Discipline: {selected.discipline ?? "unassigned"}</p>
              <p>Materiality: {selected.materiality}</p>
              <p>
                Rule: {selected.ruleId} {selected.ruleVersion}
              </p>
              <p>Detected: {selected.detectedAt}</p>
              <p>Last evaluated: {selected.lastEvaluatedAt}</p>
              <p>{selected.explanation}</p>
              <p className="text-muted-foreground">Digital Thread path: {selected.digitalThreadPath}</p>
              {(selected.evidencePath ?? []).map((step, index) => (
                <p key={`${step.objectType}-${step.objectId}-${index}`}>
                  {step.objectType} {step.objectId}
                  {step.relationship ? ` — ${step.relationship}` : ""}
                  {step.note ? ` (${step.note})` : ""}
                </p>
              ))}
              <p>Would resolve if: {selected.wouldResolveIf}</p>
              {selected.disposition ? <p>Disposition: {selected.disposition}</p> : null}
              {selected.dispositionRationale ? <p>Rationale: {selected.dispositionRationale}</p> : null}
              <div className="space-y-2 rounded border p-3">
                <h3 className="font-medium">Review status</h3>
                <p>
                  {linked?.packages.length
                    ? `Linked Review Package: ${linked.packages.map((pkg) => pkg.name ?? pkg.id).join(", ")}`
                    : "No linked Review Package"}
                </p>
                {linked?.thread?.path ? <p className="text-muted-foreground">{linked.thread.path}</p> : null}
                {linked?.findings.length ? (
                  linked.findings.map((finding) => (
                    <p key={finding.id}>
                      Human Review Finding: {finding.title} ({finding.status}) — owned by Engineering Review
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">No Review Finding exists until a human reviewer creates one.</p>
                )}
                <input
                  className="w-full rounded border p-2"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  placeholder="Project ID"
                />
                <input
                  className="w-full rounded border p-2"
                  value={documentIds}
                  onChange={(event) => setDocumentIds(event.target.value)}
                  placeholder="Document IDs, comma-separated"
                />
                <Button
                  size="sm"
                  onClick={() =>
                    void post({
                      action: "create-review",
                      id: selected.id,
                      projectId,
                      documentIds: documentIds.split(",").map((item) => item.trim()).filter(Boolean),
                      name: `Assurance ${selected.ruleId}`,
                    })
                  }
                >
                  Create Review
                </Button>
                <input
                  className="w-full rounded border p-2"
                  value={reviewPackageId}
                  onChange={(event) => setReviewPackageId(event.target.value)}
                  placeholder="Existing Review Package ID"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    void post({ action: "link-review", id: selected.id, reviewPackageId })
                  }
                >
                  Link Existing Review
                </Button>
              </div>
              <textarea
                className="w-full rounded border p-2"
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                placeholder="Disposition rationale"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void post({ action: "acknowledge", id: selected.id })}>
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    void post({ action: "disposition", id: selected.id, disposition: "ACCEPT", rationale })
                  }
                >
                  Accept with justification
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    void post({ action: "disposition", id: selected.id, disposition: "NOT_APPLICABLE", rationale })
                  }
                >
                  Not applicable
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
