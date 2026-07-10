"use client";

import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringDisciplinesPage() {
  return (
    <EngineeringListPage
      title="Disciplines"
      description="Engineering disciplines (system + tenant)"
      apiEndpoint="/api/engineering/disciplines"
      emptyMessage="No disciplines seeded."
    />
  );
}
