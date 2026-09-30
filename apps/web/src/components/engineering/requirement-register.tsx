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
import { ObjectAssurancePanel } from "@/components/engineering/object-assurance-panel";

type RequirementDetail = {
  requirement: Record<string, unknown>;
  allocations: Record<string, unknown>[];
  assumptions: Record<string, unknown>[];
  evidence: Record<string, unknown>[];
};

export function RequirementRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/requirements");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RequirementDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [targetType, setTargetType] = useState("system");
  const [targetId, setTargetId] = useState("");
  const [assumptionId, setAssumptionId] = useState("");

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/requirements?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load requirement");
      return;
    }
    setDetail(parsed.data as RequirementDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/requirements", {
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
        title="Requirements"
        description="Governed engineering obligations. A requirement is not a document paragraph, finding, or assumption."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Requirements" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} requirements`}
          </p>
          <CreateForm
            fields={[
              { key: "title", label: "Title", required: true },
              { key: "statement", label: "Statement", required: true, multiline: true },
              { key: "requirementType", label: "Type (FUNCTIONAL|PERFORMANCE|SAFETY|…)", required: true },
              { key: "requirementCode", label: "Requirement code (optional)" },
              { key: "acceptanceCriteria", label: "Acceptance criteria" },
              { key: "verificationMethod", label: "Verification method (ANALYSIS|TEST|…)" },
            ]}
            endpoint="/api/engineering/requirements"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No requirements"
            description="Create a governed obligation such as foundation bearing capacity. Documents may evidence requirements; they are not the requirement."
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
                        {String(item.requirement_code ?? "")} — {String(item.title ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{String(item.requirement_type ?? "")}</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusChip value={String(item.verification_status ?? "")} />
                      <StatusChip value={String(item.status ?? "")} />
                    </div>
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      <p>
                        Allocated: {detail?.allocations.length ?? 0} · Assumptions: {detail?.assumptions.length ?? 0} ·
                        Evidence: {detail?.evidence.length ?? 0}
                      </p>
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="system|asset|interface" />
                          <Input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target id" />
                          <Button type="button" onClick={() => void post({ action: "allocate", id, targetType, targetId })}>
                            ALLOCATED_TO
                          </Button>
                          <Input value={assumptionId} onChange={(e) => setAssumptionId(e.target.value)} placeholder="Assumption id" />
                          <Button
                            type="button"
                            onClick={() => void post({ action: "link_assumption", id, assumptionId })}
                          >
                            USED_BY assumption
                          </Button>
                        </div>
                      ) : null}
                      {selectedId ? <ObjectAssurancePanel objectType="requirement" objectId={selectedId} /> : null}
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
