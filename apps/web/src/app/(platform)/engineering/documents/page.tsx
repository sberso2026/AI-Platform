"use client";

import { EngineeringListPage } from "@/components/engineering/engineering-list-page";

export default function EngineeringDocumentsPage() {
  return (
    <EngineeringListPage
      title="Engineering Documents"
      description="Document register — revision, type, and recorded status"
      apiEndpoint="/api/engineering/documents"
      createHref="/engineering/documents/upload"
      createLabel="Register Document"
      emptyTitle="No documents registered"
      emptyDescription="No documents are recorded in this scope yet. Register a document when one exists."
      columns={[
        { key: "title", label: "Document", hrefKey: true },
        { key: "document_number", label: "Number" },
        { key: "revision", label: "Revision" },
        { key: "document_type", label: "Type" },
        { key: "status", label: "Status", status: true },
        { key: "updated", label: "Last update" },
      ]}
      rowHref={(item) => `/engineering/documents/${item.id}`}
    />
  );
}
