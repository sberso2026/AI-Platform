"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type TemplatePolicy = {
  id: string;
  templateCode: string;
  templateVersion: string;
  name: string;
  artifactType: string;
  sourceClass: string;
  status: string;
  projectId?: string | null;
  packagedAssetKey: string;
  fallbackPolicy: string;
  active: boolean;
};

type CatalogRow = {
  code: string;
  version: string;
  name: string;
  artifactType: string;
  sourceClass?: string;
};

export default function ArtifactTemplateSettingsPage() {
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";
  const [policies, setPolicies] = useState<TemplatePolicy[]>([]);
  const [defaults, setDefaults] = useState<CatalogRow[]>([]);
  const [fallbackPolicy, setFallbackPolicy] = useState("OFFICIAL_TEMPLATE_REQUIRED");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("ABC-ENG-REPORT");
  const [name, setName] = useState("Company Official Design Report");
  const [artifactType, setArtifactType] = useState("DESIGN_REPORT");
  const [packagedAssetKey, setPackagedAssetKey] = useState("EAT-REPORT-DESIGN");
  const [sourceClass, setSourceClass] = useState("COMPANY_OFFICIAL");
  const [projectId, setProjectId] = useState("");

  function load() {
    fetch("/api/engineering/work?action=templatePolicies")
      .then((response) => parseApiJsonResponse<{ policies: TemplatePolicy[]; packagedDefaults: CatalogRow[]; fallbackPolicy: string }>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setPolicies(json.data?.policies ?? []);
        setDefaults(json.data?.packagedDefaults ?? []);
        if (json.data?.fallbackPolicy) setFallbackPolicy(json.data.fallbackPolicy);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function savePolicy() {
    if (!canWrite) return;
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveTemplatePolicy",
        policy: {
          id: crypto.randomUUID(),
          templateCode: code,
          templateVersion: "1.0.0",
          name,
          artifactType,
          sourceClass,
          status: "ACTIVE",
          projectId: sourceClass === "PROJECT_CLIENT_APPROVED" ? projectId || null : null,
          packagedAssetKey,
          presentationKind: "COMBINED",
          branding: {},
          fallbackPolicy,
          disciplines: [],
          workTypes: [],
          lifecycleStages: [],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    const json = await parseApiJsonResponse<TemplatePolicy>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else load();
  }

  async function saveFallback() {
    if (!canWrite) return;
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveTemplateFallback",
        policy: {
          id: crypto.randomUUID(),
          fallbackPolicy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    const json = await parseApiJsonResponse<{ fallbackPolicy: string }>(response);
    if (json.errorMessage) setError(json.errorMessage);
  }

  return (
    <>
      <Header title="Artifact templates" description="Company and project presentation templates. Packaged EOS defaults remain available for SMEs. Ordinary engineers cannot change policy. Company templates do not certify calculation formulas." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <p className="mt-3 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/work">Open Engineering Workbench</Link></p>
        {!canWrite ? <p className="mt-3 text-sm text-muted-foreground">Template registration requires an authorized admin with AAL2. Current assurance: {assurance.aal ?? "unknown"}.</p> : null}

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Fallback policy</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <select className="eos-select block" value={fallbackPolicy} onChange={(event) => setFallbackPolicy(event.target.value)} aria-label="Template fallback policy">
              <option value="OFFICIAL_TEMPLATE_REQUIRED">Official template required (fail closed)</option>
              <option value="ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE">Allow EOS default if official unavailable</option>
            </select>
            <Button type="button" disabled={!canWrite} onClick={() => void saveFallback()}>Save fallback policy</Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Registered policies</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {policies.length === 0 ? <p className="text-muted-foreground">No company or project templates configured. EOS Professional Default will be used.</p> : (
              <ul className="space-y-2">
                {policies.map((row) => (
                  <li key={row.id} className="rounded border p-3">
                    <p className="font-medium">{row.name} · {row.templateCode}@{row.templateVersion}</p>
                    <p className="mt-1 text-muted-foreground">{row.sourceClass} · {row.artifactType} · {row.status} · asset {row.packagedAssetKey}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Register metadata (no binary upload)</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="block">Code<input className="eos-select mt-1 block w-full" value={code} onChange={(event) => setCode(event.target.value)} /></label>
            <label className="block">Name<input className="eos-select mt-1 block w-full" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="block">Artifact type<input className="eos-select mt-1 block w-full" value={artifactType} onChange={(event) => setArtifactType(event.target.value)} /></label>
            <label className="block">Packaged asset key<input className="eos-select mt-1 block w-full" value={packagedAssetKey} onChange={(event) => setPackagedAssetKey(event.target.value)} /></label>
            <label className="block">Source class
              <select className="eos-select mt-1 block" value={sourceClass} onChange={(event) => setSourceClass(event.target.value)} aria-label="Template source class">
                <option value="COMPANY_OFFICIAL">Company official</option>
                <option value="PROJECT_CLIENT_APPROVED">Project / client approved</option>
              </select>
            </label>
            {sourceClass === "PROJECT_CLIENT_APPROVED" ? (
              <label className="block">Project id<input className="eos-select mt-1 block w-full" value={projectId} onChange={(event) => setProjectId(event.target.value)} /></label>
            ) : null}
            <Button type="button" disabled={!canWrite} onClick={() => void savePolicy()}>Register template policy</Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">EOS default packaged templates</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {defaults.map((row) => (
              <p key={`${row.code}-${row.version}`}>{row.code}@{row.version} · {row.name} · {row.artifactType}</p>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
