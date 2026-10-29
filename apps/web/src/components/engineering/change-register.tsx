"use client";

import { useState } from "react";
import { Button, Input, StatusChip } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { CreateForm, useRegisterList } from "@/components/engineering/register-shell";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type ChangeDetail = {
  change: Record<string, unknown>;
  affected: Record<string, unknown>[];
  impacts: Record<string, unknown>[];
  affectedCount: number;
  impactCount: number;
};

export function ChangeRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/changes");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChangeDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [targetType, setTargetType] = useState("requirement");
  const [targetId, setTargetId] = useState("");
  const [impactTitle, setImpactTitle] = useState("");
  const [candidates, setCandidates] = useState<Record<string, unknown>[]>([]);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/changes?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load change");
      return;
    }
    setDetail(parsed.data as ChangeDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (selectedId) await openDetail(selectedId);
    reload();
  }

  async function discover(id: string) {
    const response = await fetch("/api/engineering/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "discover_impacts", id }),
    });
    const parsed = await parseApiJsonResponse(response);
    setCandidates(Array.isArray(parsed.data) ? (parsed.data as Record<string, unknown>[]) : []);
  }

  async function createImpact(changeId: string) {
    const created = await fetch("/api/engineering/impacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: impactTitle,
        impactType: "TECHNICAL",
        projectId,
      }),
    });
    const parsed = await parseApiJsonResponse(created);
    const impact = parsed.data as Record<string, unknown> | undefined;
    if (impact?.id) {
      await fetch("/api/engineering/impacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link_cause", id: impact.id, changeId }),
      });
    }
    setImpactTitle("");
    await openDetail(changeId);
    reload();
  }

  return (
    <>
      <Header
        title="Changes"
        description="Controlled engineering modifications. A change is not an impact and not a configuration baseline. Impacts are confirmed separately."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Changes" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} changes`}</p>
          <CreateForm
            fields={[
              { key: "title", label: "Title", required: true },
              { key: "changeType", label: "Type (DESIGN|SCOPE|TECHNICAL|…)", required: true },
              { key: "source", label: "Source" },
              { key: "reason", label: "Reason" },
              { key: "priority", label: "Criticality (low|medium|high|critical)" },
            ]}
            endpoint="/api/engineering/changes"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No changes"
            description="Record a controlled modification. Do not treat Project Controls advisory change candidates as this register."
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
                        {String(item.change_code ?? "")} — {String(item.title ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {String(item.change_type ?? "")} · {String(item.source ?? "unspecified source")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <StatusChip value={String(item.priority ?? "")} />
                      <StatusChip value={String(item.status ?? "")} />
                    </div>
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      <p>
                        Affected objects: {detail?.affectedCount ?? 0} · Confirmed/recorded impacts:{" "}
                        {detail?.impactCount ?? 0}
                      </p>
                      {(detail?.impacts ?? []).map((impact) => (
                        <p key={String(impact.id)}>
                          {String(impact.impact_code ?? "")} {String(impact.title ?? "")} ({String(impact.status ?? "")})
                        </p>
                      ))}
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="requirement|system|asset" />
                          <Input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Affected object id" />
                          <Button type="button" onClick={() => void post({ action: "link_affected", id, targetType, targetId })}>
                            AFFECTS
                          </Button>
                          <Button type="button" onClick={() => void discover(id)}>
                            Discover candidates
                          </Button>
                          <Input value={impactTitle} onChange={(e) => setImpactTitle(e.target.value)} placeholder="Confirm impact title" />
                          <Button type="button" onClick={() => void createImpact(id)}>
                            Record impact
                          </Button>
                        </div>
                      ) : null}
                      {candidates.length > 0 ? (
                        <p className="text-muted-foreground">
                          Discovered dependencies (not confirmed): {candidates.length}. Confirm by recording an Impact.
                        </p>
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
