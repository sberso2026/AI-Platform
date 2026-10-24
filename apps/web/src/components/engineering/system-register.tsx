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

type SystemDetail = {
  system: Record<string, unknown>;
  children: Record<string, unknown>[];
  assets: Record<string, unknown>[];
  interfaces: Record<string, unknown>[];
  decisions: Record<string, unknown>[];
  assumptions: Record<string, unknown>[];
};

export function SystemRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/systems");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SystemDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [parentId, setParentId] = useState("");
  const [assetId, setAssetId] = useState("");

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/systems?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load system");
      return;
    }
    setDetail(parsed.data as SystemDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/systems", {
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
        title="Systems"
        description="Multidisciplinary functional systems. An asset is not a system; membership is CONTAINS or USES."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Systems" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} systems`}
          </p>
          <CreateForm
            fields={[
              { key: "name", label: "Name", required: true },
              { key: "systemCode", label: "System code (optional)" },
              { key: "description", label: "Description", multiline: true },
              { key: "parentSystemId", label: "Parent system id" },
              { key: "criticality", label: "Criticality (low|medium|high|critical)" },
            ]}
            endpoint="/api/engineering/systems"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No systems"
            description="Create a functional system such as Primary Crushing. Do not treat asset tags as systems."
          />
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="grid gap-3">
            {items.map((item) => {
              const id = String(item.id ?? "");
              const open = selectedId === id;
              const parent = item.parent_system_id ? String(item.parent_system_id).slice(0, 8) : "root";
              return (
                <div key={id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 text-left"
                    onClick={() => void openDetail(id)}
                  >
                    <div>
                      <p className="font-medium">
                        {String(item.system_code ?? "")} — {String(item.name ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">parent {parent}</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusChip value={String(item.criticality ?? "")} />
                      <StatusChip value={String(item.status ?? "")} />
                    </div>
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      <p>
                        Children: {detail?.children.length ?? 0} · Asset links: {detail?.assets.length ?? 0} ·
                        Interfaces: {detail?.interfaces.length ?? 0} · Decisions: {detail?.decisions.length ?? 0} ·
                        Assumptions: {detail?.assumptions.length ?? 0}
                      </p>
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={parentId} onChange={(e) => setParentId(e.target.value)} placeholder="Parent system id" />
                          <Button
                            type="button"
                            onClick={() => void post({ action: "set_parent", id, parentSystemId: parentId || null })}
                          >
                            Set parent
                          </Button>
                          <Input value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="Asset id" />
                          <Button
                            type="button"
                            onClick={() => void post({ action: "link_asset", id, assetId, relationship: "CONTAINS" })}
                          >
                            CONTAINS asset
                          </Button>
                          <Button
                            type="button"
                            onClick={() => void post({ action: "link_asset", id, assetId, relationship: "USES" })}
                          >
                            USES asset
                          </Button>
                        </div>
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
