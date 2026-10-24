"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type OnboardingDashboard = {
  microsoftOptional: boolean;
  setupState: string;
  userHealth: "CONNECTED" | "ATTENTION_REQUIRED" | "DISCONNECTED";
  message: string;
  organisationName: string | null;
  permissionMode: string;
  readOnly: boolean;
  writeEnabled: boolean;
  connectionId: string | null;
  sites: Array<{ repositoryId?: string; displayName: string; libraryName: string | null; projectId: string | null; enabled: boolean }>;
  lastSuccessfulSyncAt: string | null;
  lastAttemptedSyncAt: string | null;
  lastError: string | null;
  rtbMultitenantAppConfigured?: boolean;
  agent?: { message: string };
};

type LibraryOption = { name: string; driveId: string; driveType: string };

type Health = {
  userHealth?: string;
  setupState?: string;
  message?: string;
  diagnostics?: Record<string, unknown>;
};

function statusLabel(state: string, health: string) {
  if (health === "CONNECTED" || state === "READY") return "Connected";
  if (state === "NOT_CONNECTED") return "Not connected";
  if (state === "ADMIN_CONSENT_REQUIRED") return "Administrator approval required";
  if (state === "SITE_PERMISSION_REQUIRED") return "Site approval required";
  if (state === "AUTH_EXPIRED" || state === "PERMISSION_REVOKED") return "Attention required";
  if (state === "CONNECTED_NO_SITE" || state === "LIBRARY_SELECTION_REQUIRED") return "Choose a SharePoint site";
  return "Not connected";
}

export default function Microsoft365IntegrationsPage() {
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate, canAdministerEngineering } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";
  const canConnectMicrosoft = canAdministerEngineering && assurance.aal === "aal2";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingDashboard | null>(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [libraries, setLibraries] = useState<LibraryOption[]>([]);
  const [libraryName, setLibraryName] = useState("");
  const [health, setHealth] = useState<Health | null>(null);
  const [addingSite, setAddingSite] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
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

  const queryHint = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("m365") ?? "";
  }, []);

  async function load() {
    const dash = await fetch("/api/engineering/work?action=m365Onboarding");
    const dashJson = await parseApiJsonResponse<OnboardingDashboard>(dash);
    if (dashJson.errorMessage) setError(dashJson.errorMessage);
    if (dashJson.data) setOnboarding(dashJson.data);
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

  async function resolveSite() {
    const json = await post("resolveSharePointSite", { siteUrl });
    const data = json.data as { libraries?: LibraryOption[]; message?: string; setupState?: string } | undefined;
    setLibraries(Array.isArray(data?.libraries) ? data.libraries : []);
    if (data?.message) setMessage(data.message);
  }

  async function confirmLibrary() {
    const selected = libraries.find((row) => row.name === libraryName) ?? libraries[0];
    await post("selectSharePointLibrary", {
      siteUrl,
      libraryName: selected?.name,
      driveId: selected?.driveId,
      projectId: projectId || null,
    });
  }

  async function testConnection() {
    const json = await post("testM365Health", { connectionId: onboarding?.connectionId });
    setHealth((json.data as Health | undefined) ?? null);
  }

  const setupState = onboarding?.setupState ?? "NOT_CONNECTED";
  const needsSite = addingSite || ["CONNECTED_NO_SITE", "SITE_PERMISSION_REQUIRED", "SITE_CONNECTED", "LIBRARY_SELECTION_REQUIRED"].includes(setupState);

  return (
    <>
      <Header
        title="Integrations"
        description="Connect approved engineering repositories. Microsoft 365 is optional. RTB Managed Repository works without Microsoft."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {message && <p className="mt-3 text-sm">{message}</p>}
        {queryHint === "admin_consent" && <p className="mt-3 text-sm">Microsoft requires an administrator to approve read-only access for this organisation.</p>}
        {queryHint === "not_configured" && <p className="mt-3 text-sm">Microsoft connection is not available in this environment yet. You can continue with RTB Managed Repository.</p>}
        <p className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link className="underline-offset-2 hover:underline" href="/engineering/settings/work-context">Use RTB Managed Repository</Link>
          <span>Connect Microsoft 365</span>
          <a className="underline-offset-2 hover:underline" href="#other-edms">Connect another EDMS</a>
          <span>Configure later</span>
        </p>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Microsoft 365 / SharePoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Connect your organisation&apos;s approved SharePoint engineering repositories. RTB will use read-only access for the initial Engineering OS pilot and will not modify SharePoint documents.</p>
            <div className="flex flex-wrap items-center gap-2">
              Status: <Badge>{statusLabel(setupState, onboarding?.userHealth ?? "DISCONNECTED")}</Badge>
              <Badge>Read only</Badge>
            </div>
            {onboarding?.organisationName && <p>Organisation: {onboarding.organisationName}</p>}
            {onboarding?.message && <p className="text-muted-foreground">{onboarding.message}</p>}
            <div className="flex flex-wrap gap-2">
              {(setupState === "NOT_CONNECTED" || setupState === "MICROSOFT_SIGN_IN_REQUIRED" || setupState === "AUTH_EXPIRED") && (
                <Button type="button" disabled={!canConnectMicrosoft} onClick={() => { window.location.href = "/api/engineering/m365/oauth/start"; }}>Connect Microsoft 365</Button>
              )}
              {setupState === "ADMIN_CONSENT_REQUIRED" && (
                <Button type="button" disabled={!canConnectMicrosoft} onClick={() => { window.location.href = "/api/engineering/m365/oauth/start?adminConsent=1"; }}>Request administrator approval</Button>
              )}
              {onboarding?.connectionId && (
                <Button type="button" disabled={!canWrite} onClick={() => void testConnection()}>Test connection</Button>
              )}
              {onboarding?.sites[0]?.repositoryId && (
                <Button type="button" disabled={!canConnectMicrosoft} onClick={() => void post("indexSharePointRepository", { repositoryId: onboarding.sites[0].repositoryId })}>Index repository</Button>
              )}
              {onboarding?.connectionId && (
                <Button type="button" disabled={!canWrite} onClick={() => void post("disconnectM365", { connectionId: onboarding.connectionId })}>Disconnect</Button>
              )}
              {onboarding?.connectionId && setupState === "READY" && !addingSite && (
                <Button type="button" disabled={!canWrite} onClick={() => { setAddingSite(true); setSiteUrl(""); setLibraries([]); }}>Add SharePoint site</Button>
              )}
            </div>
            {needsSite && (
              <div className="space-y-2">
                <label className="block">Approved SharePoint site
                  <input className="eos-select mt-1 block w-full max-w-xl" value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} placeholder="https://contoso.sharepoint.com/sites/ProjectAlpha" aria-label="Approved SharePoint site URL" />
                </label>
                <Button type="button" disabled={!canWrite || !siteUrl.trim()} onClick={() => void resolveSite()}>Continue</Button>
                {setupState === "SITE_PERMISSION_REQUIRED" && (
                  <p>Microsoft requires an administrator to authorize this SharePoint site for RTB. After approval, check again.</p>
                )}
                {libraries.length > 0 && (
                  <label className="block">Document library
                    <select className="eos-select mt-1 block" value={libraryName} onChange={(event) => setLibraryName(event.target.value)} aria-label="Approved document library">
                      <option value="">Select a library</option>
                      {libraries.map((row) => (
                        <option key={row.driveId} value={row.name}>{row.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                {libraries.length > 0 && (
                  <Button type="button" disabled={!canWrite || !libraryName} onClick={() => void confirmLibrary()}>Confirm connection</Button>
                )}
              </div>
            )}
            {onboarding?.sites.map((row) => (
              <p key={`${row.displayName}-${row.projectId ?? "workspace"}`}>
                {row.displayName} · {row.libraryName} · {row.projectId ? "project" : "workspace"} · {row.enabled ? "active" : "disconnected"}
              </p>
            ))}
            {health?.message && <p>{health.message}</p>}
            <p>Last successful sync: {onboarding?.lastSuccessfulSyncAt ?? "never"}.</p>
            <details>
              <summary className="cursor-pointer" onClick={() => setShowDiagnostics((value) => !value)}>Technical details</summary>
              {showDiagnostics && (
                <div className="mt-2 text-muted-foreground">
                  <p>Permission mode: {onboarding?.permissionMode ?? "Sites.Selected"}</p>
                  <p>Read only: yes. SharePoint write: disabled.</p>
                  <p>Health: {onboarding?.userHealth ?? "DISCONNECTED"}</p>
                  {health?.diagnostics && <p>Authentication checked: {String(health.diagnostics.microsoftAuthentication ?? false)}</p>}
                </div>
              )}
            </details>
            {!canConnectMicrosoft && <p>Connecting Microsoft 365 requires an authorized Engineering administrator.</p>}
          </CardContent>
        </Card>
        <Card className="mt-4" id="other-edms">
          <CardHeader><CardTitle className="text-base">Engineering / construction connectors</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Connect another engineering document system when your organisation does not use SharePoint. Default write policy is read-only.</p>
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
              <Button type="button" disabled={!canWrite} onClick={() => void post("saveEngineeringConnection", { connection: { displayName: `${connectorVendor} ${connectorCategory}`, category: connectorCategory, vendor: connectorVendor, credentialSecretId: "secret:edms-oauth", authMode: "OAUTH", writePolicy: "READ_ONLY", enabled: true } })}>Register connector</Button>
              <Button type="button" disabled={!canWrite || !projectId || !engineeringConnections[0]} onClick={() => void post("bindEngineeringProject", { connectionId: engineeringConnections[0]?.id, eosProjectId: projectId, externalAccountId: "acct-epcm-01", externalProjectId, externalScope: "Engineering", repository: { id: crypto.randomUUID(), displayName: `${connectorVendor} ${projectId}`, repositoryType: connectorCategory === "ENGINEERING_APPLICATION" ? "ENGINEERING_APPLICATION" : connectorCategory === "EDMS" || connectorCategory === "CONSTRUCTION_MANAGEMENT" ? "ENGINEERING_EDMS" : "OTHER_APPROVED_ENTERPRISE_SOURCE" } })}>Bind external project</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("setEngineeringConnectorWritePolicy", { connectionId: engineeringConnections[0]?.id, writePolicy })}>Set write policy</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("syncEngineeringConnector", { connectionId: engineeringConnections[0]?.id })}>Sync</Button>
              <Button type="button" disabled={!canWrite || !engineeringConnections[0]} onClick={() => void post("disableEngineeringConnector", { connectionId: engineeringConnections[0]?.id })}>Disable</Button>
            </div>
            {engineeringConnections.map((row) => (
              <p key={row.id}>{row.displayName} · {row.vendor} · {row.category} · {row.writePolicy} · {row.status} · {row.enabled ? "enabled" : "disabled"}</p>
            ))}
            {engineeringHealth?.connections.map((row) => (
              <p key={row.connection.id} className="text-muted-foreground">
                Last successful sync: {row.state?.lastSuccessfulSyncAt ?? "never"}. Last attempt: {row.state?.lastAttemptedSyncAt ?? "never"}.
              </p>
            ))}
            {!canWrite && <p>Connector administration requires an authorized Engineering administrator.</p>}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
