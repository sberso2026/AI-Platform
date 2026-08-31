"use client";

import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringAssetsPage() {
  return (
    <EngineeringListPage
      title="Engineering Assets"
      description="Asset register — identity, condition, and linked engineering records"
      apiEndpoint="/api/engineering/assets"
      createHref="/engineering/assets/new"
      createLabel="New Asset"
      emptyTitle="No assets registered"
      emptyDescription="No assets are recorded in this workspace yet. Register an asset when it exists. Health scores are not invented here."
      columns={[
        { key: "asset", label: "Asset", hrefKey: true },
        { key: "system", label: "System" },
        { key: "location", label: "Location" },
        { key: "criticality", label: "Criticality", status: true },
        { key: "status", label: "Status", status: true },
        { key: "updated", label: "Last update" },
      ]}
      rowHref={(item) => `/engineering/assets/${item.id}`}
    />
  );
}
