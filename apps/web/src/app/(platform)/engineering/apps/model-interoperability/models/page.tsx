"use client";

import {
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
} from "@/components/engineering/operational";
import { modelRows, useEmiWorkspaceSnapshot } from "@/components/engineering/emi-snapshot-page";

export default function EngineeringModelModelsPage() {
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();
  const rows = modelRows(surfaces?.models?.data);

  return (
    <section data-testid="emi-models-page" aria-labelledby="emi-models-title">
      <h1 id="emi-models-title" className="text-2xl font-semibold text-slate-900">
        Models
      </h1>
      <OperationalPageIntro purpose="Federated model references: name, type, project, revision, source, status, and last update." />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} onRetry={load} /> : null}
      {!loading && rows.length === 0 ? (
        <EmptyOperationalState
          title="No engineering model is registered for this project."
          description="IFC, SPACE GASS, and ETABS imports appear here after federation."
          testId="emi-models-empty"
        />
      ) : (
        <StatusTable
          testId="emi-models-register"
          columns={[
            { key: "model", label: "Model name", hrefKey: true },
            { key: "type", label: "Type" },
            { key: "project", label: "Project" },
            { key: "revision", label: "Revision" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status", status: true },
            { key: "updated", label: "Last update" },
          ]}
          rows={rows}
          emptyTitle="No engineering model is registered for this project."
          emptyDescription="Imported models appear after federation."
        />
      )}
    </section>
  );
}
