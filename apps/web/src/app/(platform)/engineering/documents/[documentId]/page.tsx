"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge } from "@rtb/ui";

export default function EngineeringDocumentDetailPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/documents/${documentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setDoc(json.data);
      })
      .catch((e) => setError(e.message));
  }, [documentId]);

  return (
    <>
      <Header
        title={
          doc
            ? `${doc.document_number as string} — ${doc.title as string}`
            : "Document"
        }
        description="Engineering document register"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {doc && (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <div className="flex gap-2">
                <Badge>{doc.status as string}</Badge>
                <Badge variant="secondary">Rev {doc.revision as string}</Badge>
              </div>
              <Row label="Type" value={doc.document_type as string} />
              <Row label="File" value={doc.file_name as string} />
              <Row label="Project" value={(doc.engineering_project_id as string)?.slice(0, 8)} />
              <Row label="Asset" value={(doc.asset_id as string)?.slice(0, 8)} />
              <Row label="Knowledge Node" value={(doc.knowledge_node_id as string)?.slice(0, 8)} />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
