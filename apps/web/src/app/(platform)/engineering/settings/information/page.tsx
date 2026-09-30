"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type Catalog = { types?: Array<{ code: string; name: string; description: string }> };
type Policy = {
  id: string;
  policyId: string;
  policyVersion: string;
  informationType: string;
  purpose: string;
  eligibleSourceKinds: string[];
};

export default function InformationSettingsPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";
  const [policyId, setPolicyId] = useState("INF-AUTH-DESIGN-CRITERIA");
  const [policyVersion, setPolicyVersion] = useState("v1");
  const [informationType, setInformationType] = useState("DESIGN_CRITERIA");
  const [purpose, setPurpose] = useState("FOR_ENGINEERING_REVIEW");

  useEffect(() => {
    fetch("/api/engineering/information?action=catalog")
      .then((response) => parseApiJsonResponse<{ data?: Catalog }>(response))
      .then((json) => setCatalog(json.data ?? null))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/engineering/information?action=policies&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<{ data?: Policy[] }>(response))
      .then((json) => setPolicies(Array.isArray(json.data) ? json.data : []))
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  async function savePolicy() {
    if (!projectId || !canWrite) return;
    const response = await fetch("/api/engineering/information", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "savePolicy",
        policy: {
          id: crypto.randomUUID(),
          tenantId: "",
          workspaceId: "",
          projectId,
          policyId,
          policyVersion,
          informationType,
          purpose,
          eligibleSourceKinds: ["DOCUMENT"],
          eligibleSourceObjectTypes: ["document"],
          requireAuthoritativeSource: true,
          createdAt: new Date().toISOString(),
        },
      }),
    });
    const json = await parseApiJsonResponse<{ error?: string }>(response);
    if (json.error) setError(json.error);
  }

  return (
    <>
      <Header title="Information settings" description="Governed information type catalog and purpose-specific authority policy. No executable rule scripting." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <p className="mt-3 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/information">Open Information workspace</Link></p>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Type catalog</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {(catalog?.types ?? []).map((row) => (
              <p key={row.code}><strong>{row.code}</strong> — {row.description}</p>
            ))}
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Authority policies</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {policies.map((row) => (
              <p key={row.id}>{row.policyId}@{row.policyVersion} · {row.informationType} / {row.purpose} · {row.eligibleSourceKinds.join(", ")}</p>
            ))}
            <div className="flex flex-wrap gap-3">
              <label>
                Policy id
                <input className="eos-select mt-1 block" value={policyId} onChange={(event) => setPolicyId(event.target.value)} aria-label="Policy id" />
              </label>
              <label>
                Version
                <input className="eos-select mt-1 block" value={policyVersion} onChange={(event) => setPolicyVersion(event.target.value)} aria-label="Policy version" />
              </label>
              <label>
                Type
                <select className="eos-select mt-1 block" value={informationType} onChange={(event) => setInformationType(event.target.value)} aria-label="Policy information type">
                  <option value="DESIGN_CRITERIA">DESIGN_CRITERIA</option>
                  <option value="LOAD_DATA">LOAD_DATA</option>
                </select>
              </label>
              <label>
                Purpose
                <select className="eos-select mt-1 block" value={purpose} onChange={(event) => setPurpose(event.target.value)} aria-label="Policy purpose">
                  <option value="FOR_ENGINEERING_REVIEW">FOR_ENGINEERING_REVIEW</option>
                  <option value="FOR_DESIGN_INPUT">FOR_DESIGN_INPUT</option>
                </select>
              </label>
              <Button type="button" onClick={() => void savePolicy()} disabled={!canWrite}>Save policy</Button>
            </div>
            {!canWrite && <p>Only authorized Engineering administrators may mutate authority policy, and AAL2 is required.</p>}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
