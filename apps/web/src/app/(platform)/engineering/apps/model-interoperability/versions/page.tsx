"use client";

import { EmiSnapshotTablePage } from "@/components/engineering/emi-snapshot-page";
import { pickString } from "@/lib/engineering/module-ops";

export default function EngineeringModelVersionsPage() {
  return (
    <EmiSnapshotTablePage
      title="Versions"
      purpose="Model version lineage recorded in hosted persistence."
      testId="emi-versions-page"
      surfaceKey="versions"
      emptyTitle="No model versions are recorded for this project."
      emptyDescription="Versions appear when a model revision is ingested."
      columns={[
        { key: "version", label: "Revision" },
        { key: "model", label: "Model" },
        { key: "updated", label: "Last update" },
      ]}
      mapRow={(rec, index) => ({
        id: pickString(rec, ["modelVersionId", "id"], String(index)),
        version: pickString(rec, ["versionLabel", "revision", "version"]),
        model: pickString(rec, ["modelRefId", "displayName"]),
        updated: pickString(rec, ["updatedAt", "ingestedAt"]),
      })}
    />
  );
}
