"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AskEngineeringAI,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";

type SurfaceBlock = {
  surface: string;
  present: boolean;
  data: unknown;
};

function asRows(data: unknown): OperationalRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => {
    const rec = (item && typeof item === "object" ? item : { value: item }) as Record<string, unknown>;
    const id = String(rec.id ?? rec.modelId ?? rec.model_id ?? index);
    const software = String(
      rec.sourceSoftware ?? rec.source_software ?? rec.software ?? rec.provider ?? rec.format ?? "—",
    );
    return {
      id,
      model: String(rec.name ?? rec.modelName ?? rec.title ?? rec.fileName ?? id),
      project: String(rec.projectName ?? rec.project_id ?? rec.assetId ?? rec.asset_id ?? "—"),
      software: humanSoftware(software),
      revision: String(rec.revision ?? rec.version ?? rec.revisionId ?? "—"),
      status: String(rec.status ?? rec.federationStatus ?? "recorded"),
      updated: String(rec.updatedAt ?? rec.updated_at ?? rec.lastUpdated ?? "—"),
      href: "/engineering/apps/model-interoperability/models",
    };
  });
}

function humanSoftware(raw: string): string {
  const key = raw.toLowerCase();
  if (key.includes("etabs")) return "ETABS";
  if (key.includes("space") && key.includes("gass")) return "SPACE GASS";
  if (key.includes("spacegass")) return "SPACE GASS";
  if (key.includes("ifc")) return "IFC";
  return raw === "—" ? "—" : raw;
}

export default function EngineeringModelInteropOverviewPage() {
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceBlock> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    fetch("/api/engineering/model-interoperability/workspace-snapshot")
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) {
          setSurfaces(json.data?.surfaces ?? null);
          console.info(`[eos-ux-1] model-interoperability wall_ms=${Math.round(performance.now() - started)}`);
        }
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

  const models = asRows(surfaces?.models?.data);
  const mappingCount = Array.isArray(surfaces?.mappings?.data)
    ? (surfaces?.mappings?.data as unknown[]).length
    : 0;
  const resultCount = Array.isArray(surfaces?.results?.data)
    ? (surfaces?.results?.data as unknown[]).length
    : 0;

  return (
    <section aria-labelledby="emi-overview-title">
      <h1 id="emi-overview-title" className="text-2xl font-semibold text-slate-900">
        Engineering Models
      </h1>
      <OperationalPageIntro
        purpose="Connected and imported models, revisions, and available review actions."
        primaryAction={
          <Link
            href="/engineering/apps/model-interoperability/models"
            className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
          >
            Import / view models
          </Link>
        }
      />
      <AskEngineeringAI q="Summarize connected engineering models in this workspace." />

      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <OperationalMetricCard
          label="Models"
          value={models.length}
          href="/engineering/apps/model-interoperability/models"
          testId="emi-model-count"
        />
        <OperationalMetricCard
          label="Mappings"
          value={mappingCount}
          href="/engineering/apps/model-interoperability/mappings"
        />
        <OperationalMetricCard
          label="Results"
          value={resultCount}
          href="/engineering/apps/model-interoperability/results"
        />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Connected / imported models</h2>
      <div className="mt-3">
        <StatusTable
          testId="emi-models-table"
          columns={[
            { key: "model", label: "Model", hrefKey: true },
            { key: "project", label: "Project / Asset" },
            { key: "software", label: "Source software" },
            { key: "revision", label: "Revision" },
            { key: "status", label: "Status", status: true },
            { key: "updated", label: "Last updated" },
          ]}
          rows={models}
          emptyTitle="No federated models yet"
          emptyDescription="Imported models appear here. This empty state is truthful."
          emptyTestId="emi-empty-models"
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <IntegrationCard
          name="ETABS"
          body="Model import and exported-result federation available. Live ETABS execution is not currently certified."
          href="/engineering/apps/model-interoperability/results"
        />
        <IntegrationCard
          name="SPACE GASS"
          body="Model import and exported-result federation available. Live SPACE GASS execution is not currently certified."
          href="/engineering/apps/model-interoperability/results"
        />
        <IntegrationCard
          name="IFC"
          body="Bounded IFC federation is available. A full BIM viewer is not part of this workspace."
          href="/engineering/apps/model-interoperability/federation"
        />
      </div>
    </section>
  );
}

function IntegrationCard({ name, body, href }: { name: string; body: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400">
      <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </Link>
  );
}
