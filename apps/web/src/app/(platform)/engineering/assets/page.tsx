"use client";

import Link from "next/link";
import { Badge } from "@rtb/ui";
import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringAssetsPage() {
  return (
    <EngineeringListPage
      title="Engineering Assets"
      description="Asset register with digital twin and knowledge graph links"
      apiEndpoint="/api/engineering/assets"
      createHref="/engineering/assets/new"
      createLabel="New Asset"
      emptyMessage="No assets registered."
      renderItem={(item) => (
        <Link
          href={`/engineering/assets/${item.id}`}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <p className="font-medium">
              {(item.asset_tag as string) ?? ""} — {(item.asset_name as string) ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {(item.system as string) ?? "No system"} · {(item.location as string) ?? ""}
            </p>
          </div>
          <Badge
            variant={
              item.criticality === "high" || item.criticality === "critical"
                ? "destructive"
                : "secondary"
            }
          >
            {item.criticality as string}
          </Badge>
        </Link>
      )}
    />
  );
}
