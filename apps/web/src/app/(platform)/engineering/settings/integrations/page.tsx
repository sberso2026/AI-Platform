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

type Connection = {
  id: string;
  displayName: string;
  microsoftTenantId: string;
  applicationId: string;
  credentialSecretId: string;
  status: string;
  enabled: boolean;
};

type Health = {
  connections: Array<{ id: string; displayName: string; status: string; enabled: boolean; secretValuePresent: boolean }>;
  sync: {
    status: string;
    lastSuccessfulSyncAt: string | null;
    lastAttemptedSyncAt: string | null;
    itemsScanned: number;
    itemsChanged: number;
    lastError: string | null;
    resyncRequired: boolean;
  } | null;
};

export default function Microsoft365IntegrationsPage() {
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [displayName, setDisplayName] = useState("Company Microsoft 365");
  const [microsoftTenantId, setMicrosoftTenantId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [credentialSecretId, setCredentialSecretId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [driveId, setDriveId] = useState("");
  const [approvedRoot, setApprovedRoot] = useState("/Engineering");
  const [rootItemId, setRootItemId] = useState("");
  const [contentPolicy, setContentPolicy] = useState("METADATA_ONLY");
  const [repositories, setRepositories] = useState<Array<{ id: string; displayName: string; repositoryType: string; enabled: boolean; projectId?: string | null; approvedRoot?: string | null }>>([]);

  async function load() {
    const conn = await fetch("/api/engineering/work?action=m365Connections");
    const connJson = await parseApiJsonResponse<Connection[]>(conn);
    if (connJson.errorMessage) setError(connJson.errorMessage);
    setConnections(Array.isArray(connJson.data) ? connJson.data : []);
    const healthRes = await fetch("/api/engineering/work?action=m365Health");
    const healthJson = await parseApiJsonResponse<Health>(healthRes);
    if (!healthJson.errorMessage) setHealth(healthJson.data);
    if (projectId) {
      const repos = await fetch(`/api/engineering/work?action=repositories&projectId=${encodeURIComponent(projectId)}`);
      const reposJson = await parseApiJsonResponse<Array<{ id: string; displayName: string; repositoryType: string; enabled: boolean; projectId?: string | null; approvedRoot?: string | null }>>(repos);
      if (!reposJson.errorMessage) setRepositories(Array.isArray(reposJson.data) ? reposJson.data : []);
    }
  }

  useEffect(() => {
    void load();
  }, [projectId]);

  async function post(action: string, extra: Record<string, unknown>) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const json = await parseApiJsonResponse<Record<string, unknown>>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else setMessage("Saved.");
    await load();
    return json;
  }

  return (
    <>
      <Header
        title="Microsoft 365 / SharePoint"
        description="Register an approved SharePoint library as a Managed Engineering Repository. Default capture is DENY. Secrets stay in the platform Secrets service."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {message && <p className="mt-3 text-sm">{message}</p>}
        <p className="mt-3 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/settings/work-context">Managed repositories</Link></p>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Connection</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {connections.map((row) => (
              <p key={row.id}>{row.displayName} · {row.status} · tenant {row.microsoftTenantId} · {row.enabled ? "enabled" : "disabled"}</p>
            ))}
            {health?.connections[0] && <p className="text-muted-foreground">Secret value stored on this row: {health.connections[0].secretValuePresent ? "yes" : "no"}</p>}
            <div className="flex flex-wrap gap-3">
              <label>Display name<input className="eos-select mt-1 block" value={displayName} onChange={(event) => setDisplayName(event.target.value)} aria-label="Connection display name" /></label>
              <label>Microsoft tenant id<input className="eos-select mt-1 block" value={microsoftTenantId} onChange={(event) => setMicrosoftTenantId(event.target.value)} aria-label="Microsoft tenant id" /></label>
              <label>Application id<input className="eos-select mt-1 block" value={applicationId} onChange={(event) => setApplicationId(event.target.value)} aria-label="Application id" /></label>
              <label>Credential secret reference<input className="eos-select mt-1 block" value={credentialSecretId} onChange={(event) => setCredentialSecretId(event.target.value)} aria-label="Credential secret reference" /></label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!canWrite} onClick={() => void post("saveM365Connection", { connection: { displayName, microsoftTenantId, applicationId, credentialSecretId, authMode: "CLIENT_SECRET", enabled: true } })}>Register connection</Button>
              {connections[0] && <Button type="button" disabled={!canWrite} onClick={() => void post("testM365Connection", { connectionId: connections[0].id })}>Test connection</Button>}
            </div>
            {!canWrite && <p>Connection registration requires an authorized Engineering administrator at AAL2.</p>}
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Approved SharePoint library</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Why managed: explicit allowlist. Which project: the current Engineering project. What root: the approved folder below. Content policy: metadata-first unless changed. Disable stops further ingestion and keeps historical provenance.</p>
            <div className="flex flex-wrap gap-3">
              <label>Site id<input className="eos-select mt-1 block" value={siteId} onChange={(event) => setSiteId(event.target.value)} aria-label="SharePoint site id" /></label>
              <label>Library / drive id<input className="eos-select mt-1 block" value={driveId} onChange={(event) => setDriveId(event.target.value)} aria-label="SharePoint drive id" /></label>
              <label>Approved root path<input className="eos-select mt-1 block" value={approvedRoot} onChange={(event) => setApprovedRoot(event.target.value)} aria-label="Approved root path" /></label>
              <label>Approved root item id<input className="eos-select mt-1 block" value={rootItemId} onChange={(event) => setRootItemId(event.target.value)} aria-label="Approved root item id" /></label>
              <label>Content policy
                <select className="eos-select mt-1 block" value={contentPolicy} onChange={(event) => setContentPolicy(event.target.value)} aria-label="Content access policy">
                  <option value="METADATA_ONLY">METADATA_ONLY</option>
                  <option value="ON_DEMAND_CONTENT">ON_DEMAND_CONTENT</option>
                  <option value="INDEX_APPROVED_TYPES">INDEX_APPROVED_TYPES</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canWrite || !projectId || !connections[0]}
                onClick={() => void post("registerSharePointRepository", {
                  connectionId: connections[0]?.id,
                  externalSiteId: siteId,
                  externalDriveId: driveId,
                  approvedRootItemId: rootItemId || null,
                  contentAccessPolicy: contentPolicy,
                  publicationEnabled: true,
                  repository: {
                    id: crypto.randomUUID(),
                    projectId,
                    scope: "PROJECT",
                    repositoryType: "SHAREPOINT_LIBRARY",
                    displayName: `${displayName} library`,
                    approvedRoot,
                    enabled: true,
                    capturePolicy: "MANAGED",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                })}
              >
                Register approved repository
              </Button>
            {repositories.filter((row) => row.repositoryType === "SHAREPOINT_LIBRARY").map((row) => (
              <p key={row.id}>{row.displayName} · project {row.projectId ?? "none"} · root {row.approvedRoot ?? "library"} · {row.enabled ? "enabled" : "disabled"}
                <Button className="ml-2" type="button" disabled={!canWrite} onClick={() => void post("syncSharePointRepository", { repositoryId: row.id, mode: "initial" })}>Initial sync</Button>
                <Button className="ml-2" type="button" disabled={!canWrite} onClick={() => void post("syncSharePointRepository", { repositoryId: row.id, mode: "delta" })}>Delta sync</Button>
                <Button className="ml-2" type="button" disabled={!canWrite} onClick={() => void post("disableSharePointRepository", { repositoryId: row.id })}>Disable</Button>
              </p>
            ))}
            </div>
            {health?.sync && (
              <p>
                Last successful sync: {health.sync.lastSuccessfulSyncAt ?? "never"}. Last attempt: {health.sync.lastAttemptedSyncAt ?? "never"}.
                Scanned {health.sync.itemsScanned}, changed {health.sync.itemsChanged}. Status {health.sync.status}.
              </p>
            )}
            <p className="text-muted-foreground">Personal OneDrive, personal email, and tenant-wide SharePoint crawl remain prohibited. Teams and Outlook stay contract-only.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
