"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";
import { asList, asRecord, pickString, readOperationalJson, truthfulModelStatus } from "@/lib/engineering/module-ops";

type Surfaces = Record<string, { present?: boolean; data?: unknown }>;

export function useEmiWorkspaceSnapshot() {
  const [surfaces, setSurfaces] = useState<Surfaces | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    readOperationalJson<{ surfaces?: Surfaces }>("/api/engineering/model-interoperability/workspace-snapshot").then(
      (res) => {
        if (!res.ok) {
          setError(res.error ?? "load_failed");
          setSurfaces(null);
        } else {
          setSurfaces(res.data?.surfaces ?? null);
          setError(null);
        }
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { surfaces, error, loading, load };
}

export function modelRows(data: unknown): OperationalRow[] {
  return asList(data).map((item, index) => {
    const rec = asRecord(item);
    const id = pickString(rec, ["modelRefId", "id", "modelId"], String(index));
    return {
      id,
      model: pickString(rec, ["displayName", "name", "modelName", "externalModelId"], id),
      type: pickString(rec, ["formatFamily", "providerKey", "schemaHint"], "—"),
      project: pickString(rec, ["projectId", "assetId"], "—"),
      revision: pickString(rec, ["versionLabel", "revision", "version"], "—"),
      source: humanSource(pickString(rec, ["providerKey", "formatFamily"], "")),
      status: truthfulModelStatus(rec),
      updated: pickString(rec, ["updatedAt", "updated_at"], "—"),
      href: `/engineering/apps/model-interoperability/models/${id}`,
    };
  });
}

export function humanSource(raw: string): string {
  const key = raw.toLowerCase();
  if (key.includes("etabs")) return "ETABS";
  if (key.includes("space") && key.includes("gass")) return "SPACE GASS";
  if (key.includes("spacegass")) return "SPACE GASS";
  if (key.includes("ifc")) return "IFC";
  return raw || "—";
}

export function EmiSnapshotTablePage({
  title,
  purpose,
  testId,
  surfaceKey,
  columns,
  emptyTitle,
  emptyDescription,
  mapRow,
}: {
  title: string;
  purpose: string;
  testId: string;
  surfaceKey: string;
  columns: Array<{ key: string; label: string; hrefKey?: boolean; status?: boolean }>;
  emptyTitle: string;
  emptyDescription: string;
  mapRow: (rec: Record<string, unknown>, index: number) => OperationalRow;
}) {
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();
  const rows = asList(surfaces?.[surfaceKey]?.data).map((item, index) => mapRow(asRecord(item), index));

  return (
    <section data-testid={testId} aria-labelledby={`${testId}-title`}>
      <h1 id={`${testId}-title`} className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <OperationalPageIntro
        purpose={purpose}
        primaryAction={
          <Link
            href="/engineering/apps/model-interoperability/models"
            className="inline-flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm hover:border-slate-400"
          >
            Model register
          </Link>
        }
      />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} onRetry={load} /> : null}
      {!loading && rows.length === 0 ? (
        <EmptyOperationalState title={emptyTitle} description={emptyDescription} testId={`${testId}-empty`} />
      ) : (
        <StatusTable
          testId={`${testId}-table`}
          columns={columns}
          rows={rows}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}
    </section>
  );
}
