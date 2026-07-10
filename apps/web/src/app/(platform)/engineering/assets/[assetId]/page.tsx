"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@rtb/ui";

export default function EngineeringAssetDetailPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const [tab, setTab] = useState("overview");
  const [asset, setAsset] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/assets/${assetId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setAsset(json.data);
      })
      .catch((e) => setError(e.message));
  }, [assetId]);

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
            <div className="mb-4 flex gap-2">
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
                  <Row label="Project" value={(asset.engineering_project_id as string)?.slice(0, 8)} />
                </CardContent>
              </Card>
            )}
            {tab === "digital twin" && (
              <Card>
                <CardContent className="p-6 text-sm">
                  Digital Twin ID: {(asset.digital_twin_id as string) ?? "Not linked"}
                </CardContent>
              </Card>
            )}
            {tab === "knowledge" && (
              <Card>
                <CardContent className="p-6 text-sm">
                  Knowledge Node: {(asset.knowledge_node_id as string) ?? "Not linked"}
                </CardContent>
              </Card>
            )}
            {(tab === "documents" || tab === "history" || tab === "settings") && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {tab} shell — Inspection Intelligence comes in a later batch.
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
