"use client";

import { Badge } from "@rtb/ui";
import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringCompaniesPage() {
  return (
    <EngineeringListPage
      title="Companies"
      description="Owner, consultant, contractor, vendor, and related companies"
      apiEndpoint="/api/engineering/companies"
      emptyMessage="No companies registered."
      renderItem={(item) => (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">{item.name as string}</p>
            <p className="text-xs text-muted-foreground">
              {(item.country as string) ?? "No country"}
            </p>
          </div>
          <Badge variant="secondary">{item.company_type as string}</Badge>
        </div>
      )}
    />
  );
}
