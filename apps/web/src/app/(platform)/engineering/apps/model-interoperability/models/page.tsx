"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";

function asRows(data: unknown): OperationalRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => {
    const rec = (item && typeof item === "object" ? item : { value: item }) as Record<string, unknown>;
    const id = String(rec.id ?? rec.modelId ?? index);
    return {
      id,
      model: String(rec.name ?? rec.modelName ?? rec.title ?? id),
      project: String(rec.projectName ?? rec.project_id ?? rec.asset_id ?? "—"),
      software: String(rec.sourceSoftware ?? rec.software ?? rec.provider ?? rec.format ?? "—"),
      revision: String(rec.revision ?? rec.version ?? "—"),
      status: String(rec.status ?? "recorded"),
      updated: String(rec.updatedAt ?? rec.updated_at ?? "—"),
      href: "/engineering/apps/model-interoperability/models",
    };
  });
}

export default function EngineeringModelModelsPage() {
  const [models, setModels] = useState<unknown[]>([]);
  const [versions, setVersions] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/model-interoperability/workspace-snapshot")
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setModels(Array.isArray(json.data?.surfaces?.models?.data) ? json.data.surfaces.models.data : []);
        setVersions(
          Array.isArray(json.data?.surfaces?.versions?.data) ? json.data.surfaces.versions.data : [],
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "load_failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = asRows(models);

  return (
    <section data-testid="emi-models-page" aria-labelledby="emi-models-title">
      <h1 id="emi-models-title" className="text-2xl font-semibold">
        Models
      </h1>
      <OperationalPageIntro
        purpose="Federated model references and revisions from hosted persistence."
        primaryAction={
          <Link
            href="/engineering/apps/model-interoperability/results"
            className="inline-flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm hover:border-slate-400"
          >
            Review results
          </Link>
        }
      />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} /> : null}
      <StatusTable
        columns={[
          { key: "model", label: "Model", hrefKey: true },
          { key: "project", label: "Project / Asset" },
          { key: "software", label: "Source software" },
          { key: "revision", label: "Revision" },
          { key: "status", label: "Status", status: true },
          { key: "updated", label: "Last updated" },
        ]}
        rows={rows}
        emptyTitle="No models"
        emptyDescription="No models. Truthful empty state."
        emptyTestId="emi-models-empty"
      />
      <p className="mt-4 text-xs text-slate-500">Revisions recorded: {versions.length}</p>
    </section>
  );
}
