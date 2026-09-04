"use client";

import Link from "next/link";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
} from "@/components/engineering/operational";
import { asList } from "@/lib/engineering/module-ops";
import { modelRows, useEmiWorkspaceSnapshot } from "@/components/engineering/emi-snapshot-page";

export default function EngineeringModelInteropOverviewPage() {
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();
  const models = modelRows(surfaces?.models?.data);
  const mappingCount = asList(surfaces?.mappings?.data).length;
  const resultCount = asList(surfaces?.results?.data).length;

  return (
    <section aria-labelledby="emi-overview-title" data-testid="engineering-model-interoperability-v1-ready">
      <h1 id="emi-overview-title" className="text-2xl font-semibold text-slate-900">
        Engineering Models
      </h1>
      <OperationalPageIntro
        purpose="What models are registered, which have results, and what needs mapping or review."
        primaryAction={
          <Link
            href="/engineering/apps/model-interoperability/models"
            className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
          >
            Open model register
          </Link>
        }
      />
      <AskEngineeringAI q="Summarize connected engineering models in this workspace." />

      {loading ? (
        <div className="mt-6">
          <OperationalSkeleton />
        </div>
      ) : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} onRetry={load} />
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

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Model register</h2>
      <div className="mt-3">
        {models.length === 0 && !loading ? (
          <EmptyOperationalState
            title="No engineering model is registered for this project."
            description="Imported IFC, SPACE GASS, and ETABS models appear here after federation. Live solver execution is not implied."
            testId="emi-empty-models"
          />
        ) : (
          <StatusTable
            testId="emi-models-table"
            columns={[
              { key: "model", label: "Model name", hrefKey: true },
              { key: "type", label: "Type" },
              { key: "project", label: "Project" },
              { key: "revision", label: "Revision" },
              { key: "source", label: "Source" },
              { key: "status", label: "Status", status: true },
              { key: "updated", label: "Last update" },
            ]}
            rows={models}
            emptyTitle="No engineering model is registered for this project."
            emptyDescription="Imported models appear here after federation."
          />
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Supported sources</h2>
      <p className="mt-1 text-sm text-slate-600">
        Review recorded models and results. Live solver execution is not implied.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
