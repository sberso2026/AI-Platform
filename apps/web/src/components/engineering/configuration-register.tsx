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

type BaselineDetail = {
  baseline: Record<string, unknown>;
  items: Record<string, unknown>[];
  itemCount: number;
};

export function ConfigurationRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/configuration");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BaselineDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [objectType, setObjectType] = useState("document");
  const [objectId, setObjectId] = useState("");
  const [revisionRef, setRevisionRef] = useState("");
  const [supersedeName, setSupersedeName] = useState("");

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/configuration?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load baseline");
      return;
    }
    setDetail(parsed.data as BaselineDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/configuration", {
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
        title="Configuration"
        description="Named valid sets of engineering objects. A baseline is not a change and not a single document revision."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Configuration" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} baselines`}
          </p>
          <CreateForm
            fields={[
              { key: "name", label: "Name", required: true },
              { key: "baselineType", label: "Type (DESIGN|FEED|IFC|AS_BUILT|…)", required: true },
              { key: "baselineCode", label: "Baseline code (optional)" },
              { key: "description", label: "Description", multiline: true },
            ]}
            endpoint="/api/engineering/configuration"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No configuration baselines"
            description="Freeze a coordinated set of objects. Document revision remains a single information-object version."
          />
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="grid gap-3">
            {items.map((item) => {
              const id = String(item.id ?? "");
              const open = selectedId === id;
              const superseded = item.supersedes_baseline_id ? "supersedes prior" : "root";
              return (
                <div key={id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 text-left"
                    onClick={() => void openDetail(id)}
                  >
                    <div>
                      <p className="font-medium">
                        {String(item.baseline_code ?? "")} — {String(item.name ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {String(item.baseline_type ?? "")} · {item.effective_at ? String(item.effective_at) : "no effective date"} · {superseded}
                      </p>
                    </div>
                    <StatusChip value={String(item.status ?? "")} />
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      <p>Items: {detail?.itemCount ?? 0}</p>
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={objectType} onChange={(e) => setObjectType(e.target.value)} placeholder="object type" />
                          <Input value={objectId} onChange={(e) => setObjectId(e.target.value)} placeholder="object id" />
                          <Input value={revisionRef} onChange={(e) => setRevisionRef(e.target.value)} placeholder="revision (optional)" />
                          <Button
                            type="button"
                            onClick={() =>
                              void post({
                                action: "add_item",
                                id,
                                objectType,
                                objectId,
                                revisionRef: revisionRef || null,
                              })
                            }
                          >
                            Add item
                          </Button>
                          <Button type="button" onClick={() => void post({ action: "freeze", id })}>
                            Freeze
                          </Button>
                          <Input value={supersedeName} onChange={(e) => setSupersedeName(e.target.value)} placeholder="New baseline name" />
                          <Button
                            type="button"
                            onClick={() => void post({ action: "supersede", id, name: supersedeName })}
                          >
                            Supersede
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
