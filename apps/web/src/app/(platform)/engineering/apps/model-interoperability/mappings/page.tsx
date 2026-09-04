"use client";

import {
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
} from "@/components/engineering/operational";
import { asList, asRecord, pickString } from "@/lib/engineering/module-ops";
import { useEmiWorkspaceSnapshot } from "@/components/engineering/emi-snapshot-page";

export default function EngineeringModelMappingsPage() {
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();
  const mappings = asList(surfaces?.mappings?.data).map((item, index) => {
    const rec = asRecord(item);
    return {
      id: pickString(rec, ["id", "mappingId"], String(index)),
      mapping: pickString(rec, ["displayName", "title", "id"]),
      status: pickString(rec, ["status"], "Mapping required"),
    };
  });

  return (
    <section data-testid="emi-mappings-page" aria-labelledby="emi-mappings-title">
      <h1 id="emi-mappings-title" className="text-2xl font-semibold text-slate-900">
        Mappings
      </h1>
      <OperationalPageIntro purpose="Governed element mappings. Candidates require human review before they become canonical." />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} onRetry={load} /> : null}
      {!loading && mappings.length === 0 ? (
        <EmptyOperationalState
          title="No mappings are recorded for this project."
          description="Mappings appear after federation when element bindings are proposed or reviewed."
          testId="emi-mappings-empty"
        />
      ) : (
        <StatusTable
          columns={[
            { key: "mapping", label: "Mapping" },
            { key: "status", label: "Status", status: true },
          ]}
          rows={mappings}
          emptyTitle="No mappings are recorded for this project."
          emptyDescription="Mappings appear after federation."
        />
      )}
    </section>
  );
}
