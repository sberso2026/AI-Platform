"use client";

import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringDocumentsPage() {
  return (
    <EngineeringListPage
      title="Engineering Documents"
      description="Document register — revision, source, and AI searchable status"
      apiEndpoint="/api/engineering/documents"
      createHref="/engineering/documents/upload"
      createLabel="Register Document"
      emptyTitle="No documents registered"
      emptyDescription="No documents are recorded in this scope yet. Register a document when one exists."
      columns={[
        { key: "title", label: "Document", hrefKey: true },
        { key: "document_number", label: "Number" },
        { key: "revision", label: "Revision" },
        { key: "source_status", label: "Source" },
        { key: "ingestion_status", label: "Ingestion" },
        { key: "ai_searchable_label", label: "AI searchable" },
        { key: "status", label: "Status", status: true },
        { key: "updated", label: "Last update" },
      ]}
      rowHref={(item) => `/engineering/documents/${item.id}`}
    />
  );
}
