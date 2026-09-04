"use client";

import { EmiSnapshotTablePage } from "@/components/engineering/emi-snapshot-page";
import { pickString } from "@/lib/engineering/module-ops";

export default function EngineeringModelElementsPage() {
  return (
    <EmiSnapshotTablePage
      title="Elements"
      purpose="Element references used for federation mapping and asset or spatial bindings."
      testId="emi-elements-page"
      surfaceKey="elements"
      emptyTitle="No model elements are recorded for this project."
      emptyDescription="Elements appear after a federated model version is ingested."
      columns={[
        { key: "element", label: "Element" },
        { key: "kind", label: "Kind" },
        { key: "asset", label: "Asset binding" },
        { key: "twin", label: "Twin" },
      ]}
      mapRow={(rec, index) => ({
        id: pickString(rec, ["elementRefId", "id"], String(index)),
        element: pickString(rec, ["displayName", "externalElementId", "globalId"]),
        kind: pickString(rec, ["elementKind", "ifcEntityType"]),
        asset: pickString(rec, ["assetId"]),
        twin: pickString(rec, ["twinId"]),
      })}
    />
  );
}
