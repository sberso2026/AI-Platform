"use client";

import { useState } from "react";
import { Button, Input, StatusChip } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  CreateForm,
  useRegisterList,
} from "@/components/engineering/register-shell";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { ObjectThreadPanel } from "@/components/engineering/object-thread-panel";

type DecisionDetail = {
  decision: Record<string, unknown>;
  alternatives: Record<string, unknown>[];
  approvals: Record<string, unknown>[];
  assumptionLinks: Record<string, unknown>[];
};

export function DecisionRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/decisions");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DecisionDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [altName, setAltName] = useState("");
  const [assumptionTitle, setAssumptionTitle] = useState("");
  const [assumptionStatement, setAssumptionStatement] = useState("");

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/decisions?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load decision");
      return;
    }
    setDetail(parsed.data as DecisionDetail);
  }

  async function postDecision(body: Record<string, unknown>) {
    await fetch("/api/engineering/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (selectedId) await openDetail(selectedId);
    reload();
  }

  return (
    <>
      <Header
        title="Decision Register"
        description="Engineering decisions require human approval — no autonomous engineering approval"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Decision Register" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} records`}
            {projectId ? " · selected project" : " · workspace"}
          </p>
          <CreateForm
            fields={[
              { key: "title", label: "Title", required: true },
              { key: "decisionQuestion", label: "Decision question", multiline: true },
              { key: "decisionType", label: "Decision Type" },
              { key: "recommendation", label: "Recommendation", multiline: true },
              { key: "rationale", label: "Rationale", multiline: true },
              { key: "confidence", label: "Confidence (0–1)" },
            ]}
            endpoint="/api/engineering/decisions"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No pending decisions"
            description="No decisions requiring review are recorded in this scope yet."
          />
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="grid gap-3">
            {items.map((item) => {
              const id = String(item.id ?? "");
              const open = selectedId === id;
              return (
                <div key={id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 text-left"
                    onClick={() => void openDetail(id)}
                  >
                    <div>
                      <p className="font-medium">
                        {String(item.decision_number ?? "")} — {String(item.title ?? "")}
                      </p>
                      {item.decision_question ? (
                        <p className="mt-1 text-sm text-muted-foreground">{String(item.decision_question)}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      {item.confidence != null ? <StatusChip value={`conf ${String(item.confidence)}`} /> : null}
                      <StatusChip value={String(item.approval_status ?? item.status ?? "")} />
                    </div>
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-4 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      {detail?.decision ? (
                        <>
                          <p>
                            <span className="text-muted-foreground">Rationale: </span>
                            {String(detail.decision.rationale ?? "—")}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Authority: </span>
                            {String(detail.decision.authority_id ?? detail.decision.owner_id ?? "—")}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Supersedes: </span>
                            {String(detail.decision.supersedes_decision_id ?? "—")}
                          </p>
                          <div>
                            <p className="mb-2 font-medium">Alternatives</p>
                            {(detail.alternatives ?? []).length === 0 ? <p className="text-muted-foreground">None recorded</p> : null}
                            {(detail.alternatives ?? []).map((alt) => (
                              <div key={String(alt.id)} className="mb-2 flex items-center justify-between gap-2">
                                <span>
                                  {String(alt.alternative_code)} — {String(alt.name)}
                                  {alt.is_selected ? " (selected)" : ""}
                                </span>
                                {canMutate && !alt.is_selected ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      void postDecision({
                                        action: "select_alternative",
                                        id,
                                        alternativeId: alt.id,
                                      })
                                    }
                                  >
                                    Select
                                  </Button>
                                ) : null}
                              </div>
                            ))}
                            {canMutate ? (
                              <form
                                className="mt-2 flex gap-2"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!altName.trim()) return;
                                  void postDecision({ action: "create_alternative", id, name: altName }).then(
                                    () => setAltName(""),
                                  );
                                }}
                              >
                                <Input
                                  value={altName}
                                  onChange={(e) => setAltName(e.target.value)}
                                  placeholder="New alternative"
                                />
                                <Button type="submit" size="sm">
                                  Add
                                </Button>
                              </form>
                            ) : null}
                          </div>
                          <div>
                            <p className="mb-2 font-medium">Approvals</p>
                            {(detail.approvals ?? []).length === 0 ? (
                              <p className="text-muted-foreground">No approval events yet</p>
                            ) : null}
                            {(detail.approvals ?? []).map((row) => (
                              <p key={String(row.id)}>
                                {String(row.action)} · {String(row.actor_id)} · {String(row.created_at)}
                              </p>
                            ))}
                            {canMutate ? (
                              <Button
                                className="mt-2"
                                size="sm"
                                onClick={() => void postDecision({ action: "approve", id })}
                              >
                                Record human approval
                              </Button>
                            ) : null}
                          </div>
                          <div>
                            <p className="mb-2 font-medium">Related assumptions</p>
                            {(detail.assumptionLinks ?? []).length === 0 ? (
                              <p className="text-muted-foreground">None linked. Create below to attach USED_BY/BASED_ON.</p>
                            ) : (
                              (detail.assumptionLinks ?? []).map((link) => (
                                <p key={String(link.id)}>
                                  {String(link.relationship)} · {String(link.from_type)} → {String(link.to_type)}
                                </p>
                              ))
                            )}
                            {canMutate ? (
                              <form
                                className="mt-2 grid gap-2"
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  if (!assumptionTitle.trim() || !assumptionStatement.trim()) return;
                                  const created = await fetch("/api/engineering/assumptions", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      title: assumptionTitle,
                                      statement: assumptionStatement,
                                      projectId,
                                    }),
                                  });
                                  const parsed = await parseApiJsonResponse(created);
                                  const assumptionId =
                                    parsed.ok && parsed.data && typeof parsed.data === "object"
                                      ? String((parsed.data as { id?: unknown }).id ?? "")
                                      : "";
                                  if (assumptionId) {
                                    await fetch("/api/engineering/assumptions", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        action: "link",
                                        id: assumptionId,
                                        toType: "decision",
                                        toId: id,
                                        relationship: "BASED_ON",
                                      }),
                                    });
                                  }
                                  setAssumptionTitle("");
                                  setAssumptionStatement("");
                                  await openDetail(id);
                                }}
                              >
                                <Input
                                  value={assumptionTitle}
                                  onChange={(e) => setAssumptionTitle(e.target.value)}
                                  placeholder="Assumption title"
                                />
                                <Input
                                  value={assumptionStatement}
                                  onChange={(e) => setAssumptionStatement(e.target.value)}
                                  placeholder="Assumption statement"
                                />
                                <Button type="submit" size="sm">
                                  Add assumption and link
                                </Button>
                              </form>
                            ) : null}
                          </div>
                          {selectedId ? <ObjectThreadPanel objectType="decision" objectId={selectedId} /> : null}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </main>
    </>
  );
}
