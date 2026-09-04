"use client";

import { EmiSnapshotTablePage } from "@/components/engineering/emi-snapshot-page";
import { pickString } from "@/lib/engineering/module-ops";

export default function EngineeringModelResultsPage() {
  return (
    <EmiSnapshotTablePage
      title="Results"
      purpose="Existing external result references. These are not RTB-certified live solver output."
      testId="emi-results-page"
      surfaceKey="results"
      emptyTitle="No result references are recorded for this project."
      emptyDescription="External results appear when a federated export includes result records. Execution unavailable until a certified host run exists."
      columns={[
        { key: "result", label: "Result" },
        { key: "model", label: "Model" },
        { key: "status", label: "Status", status: true },
        { key: "source", label: "Source" },
      ]}
      mapRow={(rec, index) => ({
        id: pickString(rec, ["id", "resultId"], String(index)),
        result: pickString(rec, ["displayName", "title", "id"]),
        model: pickString(rec, ["modelRefId"]),
        status: pickString(rec, ["status"], "External result"),
        source: pickString(rec, ["providerKey", "source"]),
      })}
    />
  );
}
