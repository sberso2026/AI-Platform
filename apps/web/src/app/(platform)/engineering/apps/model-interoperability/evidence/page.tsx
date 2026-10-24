"use client";

import { EmiSnapshotTablePage } from "@/components/engineering/emi-snapshot-page";
import { pickString } from "@/lib/engineering/module-ops";

export default function EngineeringModelEvidencePage() {
  return (
    <EmiSnapshotTablePage
      title="Evidence"
      purpose="Change-impact and review records linked to federated models."
      testId="emi-evidence-page"
      surfaceKey="change_impacts"
      emptyTitle="No model evidence records are published for this project."
      emptyDescription="Change impact and review evidence appears after a mapping or federation review."
      columns={[
        { key: "impact", label: "Record" },
        { key: "model", label: "Model" },
        { key: "status", label: "Status", status: true },
      ]}
      mapRow={(rec, index) => ({
        id: pickString(rec, ["id", "changeImpactId"], String(index)),
        impact: pickString(rec, ["summary", "title", "id"]),
        model: pickString(rec, ["modelRefId"]),
        status: pickString(rec, ["status"], "recorded"),
      })}
    />
  );
}
