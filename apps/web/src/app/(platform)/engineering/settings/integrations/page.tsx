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
  const [engineeringConnections, setEngineeringConnections] = useState<Array<{
    id: string;
    displayName: string;
    category: string;
    vendor: string;
    writePolicy: string;
    status: string;
    enabled: boolean;
  }>>([]);
  const [engineeringHealth, setEngineeringHealth] = useState<{
    connections: Array<{ connection: { id: string; displayName: string; vendor: string; category?: string; writePolicy: string; status: string; enabled: boolean }; state: { lastSuccessfulSyncAt: string | null; lastAttemptedSyncAt: string | null; itemsChanged: number; cursor: string | null; status: string } | null }>;
    matrix: Array<{ connector: string; vendor: string; contract: string; fixture: string; liveRead: string; liveWrite: string; status: string }>;
  } | null>(null);
  const [connectorVendor, setConnectorVendor] = useState("ACONEX");
  const [connectorCategory, setConnectorCategory] = useState("EDMS");
  const [externalProjectId, setExternalProjectId] = useState("ext-project-a");
  const [writePolicy, setWritePolicy] = useState("READ_ONLY");

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
    const engConn = await fetch("/api/engineering/work?action=engineeringConnectorConnections");
    const engConnJson = await parseApiJsonResponse<Array<{ id: string; displayName: string; category: string; vendor: string; writePolicy: string; status: string; enabled: boolean }>>(engConn);
    if (!engConnJson.errorMessage) setEngineeringConnections(Array.isArray(engConnJson.data) ? engConnJson.data : []);
    const engHealth = await fetch("/api/engineering/work?action=engineeringConnectorHealth");
    const engHealthJson = await parseApiJsonResponse<{
      connections: Array<{ connection: { id: string; displayName: string; vendor: string; category?: string; writePolicy: string; status: string; enabled: boolean }; state: { lastSuccessfulSyncAt: string | null; lastAttemptedSyncAt: string | null; itemsChanged: number; cursor: string | null; status: string } | null }>;
      matrix: Array<{ connector: string; vendor: string; contract: string; fixture: string; liveRead: string; liveWrite: string; status: string }>;
    }>(engHealth);
    if (!engHealthJson.errorMessage) setEngineeringHealth(engHealthJson.data);
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
        title="Integrations"
        description="Register approved SharePoint libraries and engineering/construction connectors. Default capture is DENY. Secrets stay in the platform Secrets service."
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
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Engineering / construction connectors</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">EDMS, BIM/CAD metadata, and planning connectors reuse the A13A foundation. Live Aconex, ACC, and P6 remain NOT_TESTED until approved credentials exist. Default write policy is READ_ONLY. Certification is shown as contract / fixture / live-read / live-write, not a single connected flag.</p>
            <div className="flex flex-wrap gap-3">
              <label>Category
                <select className="eos-select mt-1 block" value={connectorCategory} onChange={(event) => setConnectorCategory(event.target.value)} aria-label="Connector category">
                  <option value="EDMS">EDMS</option>
                  <option value="CONSTRUCTION_MANAGEMENT">CONSTRUCTION_MANAGEMENT</option>
                  <option value="BIM_DOCUMENT_SYSTEM">BIM_DOCUMENT_SYSTEM</option>
                  <option value="PLANNING_SCHEDULE">PLANNING_SCHEDULE</option>
                  <option value="ENGINEERING_APPLICATION">ENGINEERING_APPLICATION</option>
                  <option value="OTHER_APPROVED_ENTERPRISE_SOURCE">OTHER_APPROVED_ENTERPRISE_SOURCE</option>
                </select>
              </label>
              <label>Vendor
                <select className="eos-select mt-1 block" value={connectorVendor} onChange={(event) => setConnectorVendor(event.target.value)} aria-label="Connector vendor">
                  <option value="ACONEX">ACONEX</option>
                  <option value="ACC">ACC</option>
                  <option value="P6">P6</option>
                  <option value="MSPROJECT">MSPROJECT</option>
                  <option value="SPACE_GASS">SPACE_GASS</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label>External project id<input className="eos-select mt-1 block" value={externalProjectId} onChange={(event) => setExternalProjectId(event.target.value)} aria-label="External project id" /></label>
              <label>Write policy
                <select className="eos-select mt-1 block" value={writePolicy} onChange={(event) => setWritePolicy(event.target.value)} aria-label="Connector write policy">
                  <option value="READ_ONLY">READ_ONLY</option>
                  <option value="SUBMIT_DRAFT_RESPONSE">SUBMIT_DRAFT_RESPONSE</option>
                  <option value="PUBLISH_DOCUMENT">PUBLISH_DOCUMENT</option>
                  <option value="UPDATE_REFERENCE_METADATA">UPDATE_REFERENCE_METADATA</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!canWrite} onClick={() => void post("saveEngineeringConnection", { connection: { displayName: `${connectorVendor} ${connectorCategory}`, category: connectorCategory, vendor: connectorVendor, credentialSecretId: credentialSecretId || "secret:edms-oauth", authMode: "OAUTH", writePolicy: "READ_ONLY", enabled: true } })}>Register connector</Button>
              <Button type="button" disabled={!canWrite || !projectId || !engineeringConnections[0]} onClick={() => void post("bindEngineeringProject", { connectionId: engineeringConnections[0]?.id, eosProjectId: projectId, externalAccountId: "acct-epcm-01", externalProjectId, externalScope: "Engineering", repository: { id: crypto.randomUUID(), displayName: `${connectorVendor} ${projectId}`, repositoryType: connectorCategory === "ENGINEERING_APPLICATION" ? "ENGINEERING_APPLICATION" : connectorCategory === "EDMS" || connectorCategory === "CONSTRUCTION_MANAGEMENT" ? "ENGINEERING_EDMS" : "OTHER_APPROVED_ENTERPRISE_SOURCE" } })}>Bind external project</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("setEngineeringConnectorWritePolicy", { connectionId: engineeringConnections[0]?.id, writePolicy })}>Set write policy</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("syncEngineeringConnector", { connectionId: engineeringConnections[0]?.id })}>Sync</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("disableEngineeringConnector", { connectionId: engineeringConnections[0]?.id })}>Disable</Button>
            </div>
            {engineeringConnections.map((row) => (
              <p key={row.id}>{row.displayName} · {row.vendor} · {row.category} · {row.writePolicy} · {row.status} · {row.enabled ? "enabled" : "disabled"} · live NOT_TESTED</p>
            ))}
            {engineeringHealth?.connections.map((row) => (
              <p key={row.connection.id} className="text-muted-foreground">
                Last successful sync: {row.state?.lastSuccessfulSyncAt ?? "never"}. Last attempt: {row.state?.lastAttemptedSyncAt ?? "never"}.
                Changed {row.state?.itemsChanged ?? 0}. Cursor {row.state?.cursor ?? "none"}. Auth/health {row.state?.status ?? row.connection.status}. Secrets are not shown.
              </p>
            ))}
            <p className="text-muted-foreground">Certification is not operational health. A connector may be FIXTURE_CERTIFIED and READY, or LIVE_CERTIFIED_READ and AUTHENTICATION_REQUIRED. Default write policy is READ_ONLY.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Connector</th>
                    <th>Vendor</th>
                    <th>Project / scope</th>
                    <th>Operational state</th>
                    <th>Read certification</th>
                    <th>Write certification</th>
                    <th>Last sync</th>
                    <th>Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((row) => (
                    <tr key={row.id}>
                      <td>SHAREPOINT_LIBRARY</td>
                      <td>SHAREPOINT</td>
                      <td>{repositories.find((item) => item.repositoryType === "SHAREPOINT_LIBRARY")?.approvedRoot ?? "managed library"}</td>
                      <td>{health?.sync?.status ?? row.status}</td>
                      <td>FIXTURE_CERTIFIED / live NOT_TESTED</td>
                      <td>FIXTURE_CERTIFIED / live NOT_TESTED</td>
                      <td>{health?.sync?.lastSuccessfulSyncAt ?? "never"}</td>
                      <td>READ_ONLY unless publication enabled</td>
                    </tr>
                  ))}
                  {engineeringHealth?.connections.map((row) => {
                    const cert = engineeringHealth.matrix.find((item) => item.vendor === row.connection.vendor);
                    return (
                      <tr key={row.connection.id}>
                        <td>{cert?.connector ?? row.connection.category}</td>
                        <td>{row.connection.vendor}</td>
                        <td>{projectId ?? "unbound"}</td>
                        <td>{row.state?.status ?? row.connection.status}{row.connection.enabled ? "" : " / disabled"}</td>
                        <td>{cert?.liveRead === "NOT_TESTED" ? `${cert.fixture} / live NOT_TESTED` : cert?.liveRead ?? "NOT_TESTED"}</td>
                        <td>{cert?.liveWrite ?? "NOT_TESTED"}</td>
                        <td>{row.state?.lastSuccessfulSyncAt ?? "never"}</td>
                        <td>{row.connection.writePolicy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {engineeringHealth?.matrix.map((row) => (
              <p key={`${row.connector}-${row.vendor}`}>{row.connector} / {row.vendor}: contract {row.contract} · fixture {row.fixture} · live read {row.liveRead} · live write {row.liveWrite} · operational health is separate</p>
            ))}
            {!canWrite && <p>Connector administration requires an authorized Engineering administrator at AAL2.</p>}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
