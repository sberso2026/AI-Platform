"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

type ToolRow = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  integrationModes: string[];
  installedVersion: string | null;
  adapterId: string | null;
  executionHostId: string | null;
  licenceStatus: string;
  licenceType?: string;
  productionUsePermitted?: boolean;
  automationPermission: string;
  lastValidation: { overall?: string } | null;
  readiness: string;
};

export default function ExternalToolsSettingsPage() {
  const [rows, setRows] = useState<ToolRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("ALL");
  const [readiness, setReadiness] = useState("ALL");

  useEffect(() => {
    fetch("/api/engineering/external-tools")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setRows((json.data as ToolRow[]) ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((row) => (category === "ALL" || row.category === category) && (readiness === "ALL" || row.readiness === readiness)),
    [rows, category, readiness],
  );

  return (
    <>
      <Header
        title="External Tools & Integrations"
        description="Governed configuration for external engineering, analysis, and enterprise systems. SPACE GASS trial discovery is recorded; production use is not permitted."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">SPACE GASS trial governance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>EXTERNAL_SOFTWARE_INSTALLATION: DISCOVERED_WHERE_PRESENT</p>
            <p>LICENCE_TYPE: recorded on the profile (TRIAL / UNKNOWN / other generic values)</p>
            <p>PRODUCTION_USE_PERMITTED: NO for trial</p>
            <p>READY_FOR_PRODUCTION: NO</p>
            <p>SPACE GASS overlay: discovered install is recorded when present. API, automation, trial expiry, and production use remain fail-closed. READY is not claimed.</p>
          </CardContent>
        </Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <select className="rounded border px-2 py-1 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">All categories</option>
            <option value="ANALYSIS_SIMULATION">Analysis / Simulation</option>
            <option value="CAD_BIM">CAD / BIM</option>
            <option value="COLLABORATION">Collaboration</option>
            <option value="DOCUMENT_INFORMATION">Documents</option>
          </select>
          <select className="rounded border px-2 py-1 text-sm" value={readiness} onChange={(e) => setReadiness(e.target.value)}>
            <option value="ALL">All readiness</option>
            <option value="NOT_CONFIGURED">Not configured</option>
            <option value="READY">Ready</option>
            <option value="BLOCKED">Blocked</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              fetch("/api/engineering/external-tools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "ensure_spacegass" }),
              })
                .then((r) => r.json())
                .then((json) => {
                  if (json.error) setError(json.error);
                  else window.location.reload();
                })
                .catch((e) => setError(e.message));
            }}
          >
            Persist SPACE GASS profile (discovered, not READY)
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approved external tools</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-3">Tool</th>
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Mode</th>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Adapter</th>
                  <th className="py-2 pr-3">Host / Connection</th>
                  <th className="py-2 pr-3">Licence</th>
                  <th className="py-2 pr-3">Licence type</th>
                  <th className="py-2 pr-3">Automation</th>
                  <th className="py-2 pr-3">Validation</th>
                  <th className="py-2 pr-3">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 pr-3">
                      <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/settings/external-tools/${row.id}`}>
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{row.vendor}</td>
                    <td className="py-2 pr-3">{row.category}</td>
                    <td className="py-2 pr-3">{row.integrationModes.join(", ")}</td>
                    <td className="py-2 pr-3">{row.installedVersion ?? "UNKNOWN"}</td>
                    <td className="py-2 pr-3">{row.adapterId ?? "—"}</td>
                    <td className="py-2 pr-3">{row.executionHostId ?? "NOT_CONFIGURED"}</td>
                    <td className="py-2 pr-3">{row.licenceStatus}</td>
                    <td className="py-2 pr-3">{row.licenceType ?? "UNKNOWN"}{row.productionUsePermitted ? "" : " · eval only"}</td>
                    <td className="py-2 pr-3">{row.automationPermission}</td>
                    <td className="py-2 pr-3">{row.lastValidation?.overall ?? "NOT_RUN"}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={row.readiness === "READY" ? "success" : "secondary"}>{row.readiness}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="pt-3 text-sm text-muted-foreground">No external tool profiles match the filter.</p>}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
