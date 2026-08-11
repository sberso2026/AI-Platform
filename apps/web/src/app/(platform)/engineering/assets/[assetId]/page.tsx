"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";

export default function EngineeringAssetDetailPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const [tab, setTab] = useState("overview");
  const [asset, setAsset] = useState<Record<string, unknown> | null>(null);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/assets/${assetId}`)
      .then((r) => parseApiJsonResponse<Record<string, unknown>>(r))
      .then((parsed) => {
        if (!parsed.ok) setError(parsed.errorMessage ?? "Failed to load asset");
        else setAsset(parsed.data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load asset"),
      );
  }, [assetId]);

  useEffect(() => {
    if (tab !== "documents") return;
    setDocsLoading(true);
    setDocsError(null);
    const qs = new URLSearchParams({ assetId });
    const projectId = asset?.engineering_project_id;
    if (typeof projectId === "string" && projectId) {
      qs.set("projectId", projectId);
    }
    fetch(`/api/engineering/documents?${qs.toString()}`)
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setDocsError(parsed.errorMessage ?? "Failed to load documents");
          setDocuments([]);
        } else {
          setDocuments(asRecordArray(parsed.data));
        }
        setDocsLoading(false);
      })
      .catch((e: unknown) => {
        setDocsError(e instanceof Error ? e.message : "Failed to load documents");
        setDocsLoading(false);
      });
  }, [tab, assetId, asset?.engineering_project_id]);

  const tabs = ["overview", "documents", "digital twin", "knowledge", "history", "settings"];

  return (
    <>
      <Header
        title={
          asset
            ? `${asset.asset_tag as string} — ${asset.asset_name as string}`
            : "Asset"
        }
        description="Engineering asset register"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {asset && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{asset.status as string}</Badge>
              <Badge
                variant={
                  asset.criticality === "high" || asset.criticality === "critical"
                    ? "destructive"
                    : "secondary"
                }
              >
                {asset.criticality as string}
              </Badge>
              <AskThisObjectLink
                label="Ask this asset"
                projectId={(asset.engineering_project_id as string | null) ?? null}
                objectType="asset"
                objectId={assetId}
                q="What information do we currently have about this asset?"
                testId="ask-this-asset"
              />
            </div>
            <div className="mb-4 flex gap-2 border-b">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-sm capitalize ${
                    tab === t
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Tag" value={asset.asset_tag as string} />
                  <Row label="Location" value={asset.location as string} />
                  <Row label="System" value={asset.system as string} />
                  <Row label="Subsystem" value={asset.subsystem as string} />
                  <Row
                    label="Project"
                    value={
                      (asset.presentation as { projectLabel?: string | null } | undefined)
                        ?.projectLabel ?? undefined
                    }
                  />
                </CardContent>
              </Card>
            )}
            {tab === "documents" && (
              <Card data-testid="asset-documents-panel">
                <CardHeader>
                  <CardTitle className="text-base">Engineering Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {docsLoading ? (
                    <p className="text-muted-foreground">Loading documents...</p>
                  ) : null}
                  {docsError ? (
                    <p className="text-destructive">{docsError}</p>
                  ) : null}
                  {!docsLoading && !docsError && documents.length === 0 ? (
                    <p className="text-muted-foreground">
                      No engineering documents are linked to this asset.
                    </p>
                  ) : null}
                  {documents.map((doc) => (
                    <div
                      key={doc.id as string}
                      className="flex items-start justify-between gap-4 border-b pb-2 last:border-0"
                      data-testid="asset-document-row"
                    >
                      <div>
                        <Link
                          href={`/engineering/documents/${doc.id as string}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {(doc.document_number as string) ?? ""} —{" "}
                          {(doc.title as string) ?? ""}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {(doc.document_type as string) ?? "document"} · revision{" "}
                          {(doc.revision as string) ?? "—"}
                        </p>
                      </div>
                      <Badge variant="secondary">{(doc.status as string) ?? "—"}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {tab === "digital twin" && (
              <Card>
                <CardContent className="p-6 text-sm">
                  {(asset.digital_twin_id as string)
                    ? "Digital twin linked"
                    : "Digital twin not linked"}
                </CardContent>
              </Card>
            )}
            {tab === "knowledge" && (
              <Card>
                <CardContent className="p-6 text-sm">
                  {(asset.presentation as { knowledgeLinkStatus?: string; knowledgeNodeTitle?: string | null } | undefined)
                    ?.knowledgeLinkStatus === "linked"
                    ? (asset.presentation as { knowledgeNodeTitle?: string | null })
                        .knowledgeNodeTitle
                      ? `Linked — ${(asset.presentation as { knowledgeNodeTitle?: string | null }).knowledgeNodeTitle}`
                      : "Knowledge linked"
                    : "Knowledge not linked"}
                </CardContent>
              </Card>
            )}
            {(tab === "history" || tab === "settings") && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {tab} shell — available in a later batch.
                </CardContent>
              </Card>
            )}
          </>
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
