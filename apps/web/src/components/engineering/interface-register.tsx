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

type InterfaceDetail = {
  interface: Record<string, unknown>;
  endpoints: Record<string, unknown>[];
};

export function InterfaceRegister() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/interfaces");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InterfaceDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [objectType, setObjectType] = useState("asset");
  const [objectId, setObjectId] = useState("");

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/interfaces?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load interface");
      return;
    }
    setDetail(parsed.data as InterfaceDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/interfaces", {
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
        title="Interfaces"
        description="Governed boundaries between systems, assets, and other Core objects. Not a model mapping and not a review finding."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Interfaces" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} interfaces`}
          </p>
          <CreateForm
            fields={[
              { key: "name", label: "Name", required: true },
              { key: "interfaceType", label: "Type (PHYSICAL|FUNCTIONAL|…)", required: true },
              { key: "interfaceCode", label: "Interface code (optional)" },
              { key: "description", label: "Description", multiline: true },
              { key: "directionality", label: "Directionality (undirected|directed|bidirectional)" },
            ]}
            endpoint="/api/engineering/interfaces"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No interfaces"
            description="Create an interface, then add at least two CONNECTS endpoints before marking it agreed or verified."
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
                        {String(item.interface_code ?? "")} — {String(item.name ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {String(item.interface_type ?? "")} · {String(item.directionality ?? "")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <StatusChip value={String(item.criticality ?? "")} />
                      <StatusChip value={String(item.status ?? "")} />
                    </div>
                  </button>
                  {open ? (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      <p>Endpoints: {detail?.endpoints.length ?? 0}</p>
                      <ul className="list-disc pl-5">
                        {(detail?.endpoints ?? []).map((ep) => (
                          <li key={String(ep.id)}>
                            {String(ep.to_type)} {String(ep.to_id).slice(0, 8)} ·{" "}
                            {String((ep.metadata as { endpoint_role?: string } | undefined)?.endpoint_role ?? "")}
                          </li>
                        ))}
                      </ul>
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={objectType} onChange={(e) => setObjectType(e.target.value)} placeholder="system|asset|…" />
                          <Input value={objectId} onChange={(e) => setObjectId(e.target.value)} placeholder="Object id" />
                          <Button
                            type="button"
                            onClick={() =>
                              void post({ action: "add_endpoint", id, objectType, objectId, role: "participant" })
                            }
                          >
                            Add CONNECTS endpoint
                          </Button>
                          <Button type="button" onClick={() => void post({ action: "set_status", id, status: "defined" })}>
                            Status defined
                          </Button>
                        </div>
                      ) : null}
                      {selectedId ? <ObjectAssurancePanel objectType="interface" objectId={selectedId} /> : null}
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
