"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Catalog = {
  definitions?: Array<{ definitionId: string; code: string; name: string; origin: string; responsibleDiscipline: string }>;
  maturityProfile?: { profileId: string; profileVersion: string; name: string };
  setting?: { maturityProfileId: string; maturityProfileVersion: string } | null;
  mappings?: Array<{
    id: string;
    rawStatusCode: string;
    semantic: string;
    mappingVersion: string;
    projectId?: string | null;
    sourceSystem: string;
    enabled: boolean;
  }>;
  statusSemantics?: string[];
};

export default function DeliverableSettingsPage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [rawStatusCode, setRawStatusCode] = useState("");
  const [semantic, setSemantic] = useState("FOR_REVIEW");
  const [mappingVersion, setMappingVersion] = useState("v1");
  const [sourceSystem, setSourceSystem] = useState("project");

  async function load() {
    const parsed = await parseApiJsonResponse(await fetch("/api/engineering/settings/deliverables"));
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load deliverable settings");
      return;
    }
    setData((parsed.data as Catalog) ?? null);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    const profile = data?.maturityProfile;
    if (!profile) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/settings/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maturityProfileId: profile.profileId,
          maturityProfileVersion: profile.profileVersion,
          enabledDefinitionIds: (data?.definitions ?? []).map((row) => row.definitionId),
        }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to update deliverable settings");
      return;
    }
    await load();
  }

  async function saveMapping() {
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/settings/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configureMapping",
          projectId: projectId || null,
          sourceSystem,
          rawStatusCode,
          semantic,
          mappingVersion,
        }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to update status mapping");
      return;
    }
    setRawStatusCode("");
    await load();
  }

  return (
    <>
      <Header
        title="Deliverable profile governance"
        description="Templates stay examples until a project adopts them. Document status mappings are project/workspace governed and are not IFC/approval shortcuts."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/settings">
            Engineering Settings
          </Link>
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">
              {data?.maturityProfile?.profileId} {data?.maturityProfile?.profileVersion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Catalog origin is TEMPLATE / EXAMPLE unless adopted into a project. These definitions are not mandatory for every FEED project.</p>
            {(data?.definitions ?? []).map((row) => (
              <div key={row.definitionId} className="rounded border p-2">
                <Badge variant="secondary">{row.origin}</Badge> {row.code} — {row.name} ({row.responsibleDiscipline})
              </div>
            ))}
            <Button size="sm" onClick={() => void save()}>
              Save governed catalog selection
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document status mappings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Raw source codes have no universal meaning. IFR/IFA/IFC are not hard-coded. Unknown codes stay UNMAPPED.</p>
            {(data?.mappings ?? []).map((row) => (
              <div key={row.id} className="rounded border p-2">
                {row.sourceSystem}:{row.rawStatusCode} → {row.semantic} ({row.mappingVersion}
                {row.projectId ? `, project ${row.projectId}` : ", workspace"}) {row.enabled ? "enabled" : "disabled"}
              </div>
            ))}
            <label className="block">
              Project id (optional workspace-wide if empty)
              <input className="mt-1 w-full rounded border px-2 py-1" value={projectId} onChange={(event) => setProjectId(event.target.value)} />
            </label>
            <label className="block">
              Source system
              <input className="mt-1 w-full rounded border px-2 py-1" value={sourceSystem} onChange={(event) => setSourceSystem(event.target.value)} />
            </label>
            <label className="block">
              Raw status code
              <input className="mt-1 w-full rounded border px-2 py-1" value={rawStatusCode} onChange={(event) => setRawStatusCode(event.target.value)} />
            </label>
            <label className="block">
              EOS semantic
              <select className="mt-1 w-full rounded border px-2 py-1" value={semantic} onChange={(event) => setSemantic(event.target.value)}>
                {(data?.statusSemantics ?? ["FOR_REVIEW", "FOR_COORDINATION", "FOR_CONSTRUCTION_USE"]).map((row) => (
                  <option key={row} value={row}>
                    {row}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Mapping version
              <input className="mt-1 w-full rounded border px-2 py-1" value={mappingVersion} onChange={(event) => setMappingVersion(event.target.value)} />
            </label>
            <Button size="sm" onClick={() => void saveMapping()}>
              Save status mapping
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
