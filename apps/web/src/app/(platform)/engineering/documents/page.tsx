"use client";

import Link from "next/link";
import { Badge } from "@rtb/ui";
import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringDocumentsPage() {
  return (
    <EngineeringListPage
      title="Engineering Documents"
      description="Document register shell — Document Intelligence comes later"
      apiEndpoint="/api/engineering/documents"
      createHref="/engineering/documents/upload"
      createLabel="Register Document"
      emptyMessage="No documents registered."
      renderItem={(item) => (
        <Link
          href={`/engineering/documents/${item.id}`}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <p className="font-medium">
              {(item.document_number as string) ?? ""} — {(item.title as string) ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Rev {(item.revision as string) ?? "A"} · {(item.document_type as string) ?? "general"}
            </p>
          </div>
          <Badge variant="secondary">{item.status as string}</Badge>
        </Link>
      )}
    />
  );
}
