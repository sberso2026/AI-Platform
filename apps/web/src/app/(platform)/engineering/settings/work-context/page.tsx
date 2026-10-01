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

type Repository = {
  id: string;
  displayName: string;
  repositoryType: string;
  capturePolicy: string;
  enabled: boolean;
  projectId?: string | null;
  approvedRoot?: string | null;
};

export default function WorkContextSettingsPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";
  const [displayName, setDisplayName] = useState("Project A Structural Calculations");
  const [repositoryType, setRepositoryType] = useState("CORPORATE_SYNCED_FOLDER");
  const [approvedRoot, setApprovedRoot] = useState("C:\\Users\\User\\Company\\Project-A\\Engineering\\");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/engineering/work?action=repositories&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<Repository[]>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setRepositories(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  async function saveRepository() {
    if (!projectId || !canWrite) return;
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveRepository",
        repository: {
          id: crypto.randomUUID(),
          projectId,
          scope: "PROJECT",
          repositoryType,
          displayName,
          approvedRoot,
          enabled,
          capturePolicy: enabled ? "MANAGED" : "DENY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    const json = await parseApiJsonResponse<Repository>(response);
    if (json.errorMessage) setError(json.errorMessage);
  }

  return (
    <>
      <Header title="Managed repositories" description="Allowlisted engineering sources only. Default capture policy is DENY. Connector secrets are not stored here." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <p className="mt-3 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/work">Open Work workspace</Link></p>
        <p className="mt-1 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/settings/integrations">Microsoft 365 / SharePoint</Link></p>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Registered repositories</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {repositories.map((row) => (
              <p key={row.id}>{row.displayName} · {row.repositoryType} · {row.capturePolicy} · {row.enabled ? "enabled" : "disabled"}</p>
            ))}
            <div className="flex flex-wrap gap-3">
              <label>
                Display name
                <input className="eos-select mt-1 block" value={displayName} onChange={(event) => setDisplayName(event.target.value)} aria-label="Repository display name" />
              </label>
              <label>
                Type
                <select className="eos-select mt-1 block" value={repositoryType} onChange={(event) => setRepositoryType(event.target.value)} aria-label="Repository type">
                  <option value="CORPORATE_SYNCED_FOLDER">CORPORATE_SYNCED_FOLDER</option>
                  <option value="SHAREPOINT_LIBRARY">SHAREPOINT_LIBRARY</option>
                  <option value="ENGINEERING_EDMS">ENGINEERING_EDMS</option>
                  <option value="PROJECT_MAILBOX">PROJECT_MAILBOX</option>
                  <option value="PROJECT_TEAMS_CHANNEL">PROJECT_TEAMS_CHANNEL</option>
                </select>
              </label>
              <label>
                Approved root
                <input className="eos-select mt-1 block" value={approvedRoot} onChange={(event) => setApprovedRoot(event.target.value)} aria-label="Approved root" />
              </label>
              <label>
                Enabled
                <select className="eos-select mt-1 block" value={enabled ? "yes" : "no"} onChange={(event) => setEnabled(event.target.value === "yes")} aria-label="Repository enabled">
                  <option value="yes">Enabled</option>
                  <option value="no">Disabled</option>
                </select>
              </label>
              <Button type="button" onClick={() => void saveRepository()} disabled={!canWrite}>Save repository</Button>
            </div>
            {!canWrite && <p>Only authorized Engineering administrators may mutate repository policy, and AAL2 is required.</p>}
            <p className="text-muted-foreground">Personal OneDrive, personal email, local recursive scan, and unmanaged indexing remain prohibited. Drive letter alone is not a trust boundary.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
