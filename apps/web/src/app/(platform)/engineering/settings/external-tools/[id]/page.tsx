"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

type Capability = { key: string; availability: string; certification: string; notes?: string };
type Check = { action: string; status: string; detail: string };
type Profile = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  enabled: boolean;
  executionHostId: string | null;
  installedVersion: string | null;
  executablePath: string | null;
  installationStatus: string;
  licenceStatus: string;
  automationPermission: string;
  automationConfirmedBy: string | null;
  automationConfirmedAt: string | null;
  automationReference: string | null;
  adapterId: string | null;
  adapterVersion: string | null;
  compatibleToolVersions: string[];
  adapterCompatibilityStatus: string;
  capabilities: Capability[];
  lastValidation: { ranAt: string | null; overall: string; checks: Check[] };
  readiness: string;
  updatedAt: string;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default function ExternalToolDetailPage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/external-tools/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setProfile(json.data as Profile);
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  return (
    <>
      <Header title={profile?.name ?? "External tool"} description="Platform/admin configuration. Workspace settings cannot change executable, licence, or automation." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline-offset-2 hover:underline" href="/engineering/settings/external-tools">
            Back to External Tools & Integrations
          </Link>
        </p>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {profile && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Enabled" value={String(profile.enabled)} />
                <Field label="Tool" value={profile.name} />
                <Field label="Vendor" value={profile.vendor} />
                <Field label="Category" value={profile.category} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execution host</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Execution Host" value={profile.executionHostId ?? "NOT_CONFIGURED"} />
                <Field label="Host Status" value={profile.executionHostId ? "REFERENCED" : "UNAVAILABLE"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Installation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Installed Version" value={profile.installedVersion ?? "UNKNOWN"} />
                <Field label="Executable Path" value={profile.executablePath ?? "NOT_CONFIGURED"} />
                <Field label="Installation Status" value={profile.installationStatus} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Licence & automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Licence Status" value={profile.licenceStatus} />
                <Field label="Automation Permission" value={profile.automationPermission} />
                <Field label="Confirmed By" value={profile.automationConfirmedBy ?? "—"} />
                <Field label="Confirmed At" value={profile.automationConfirmedAt ?? "—"} />
                <Field label="Reference" value={profile.automationReference ?? "—"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adapter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Adapter" value={profile.adapterId ?? "—"} />
                <Field label="Adapter Version" value={profile.adapterVersion ?? "—"} />
                <Field label="Compatible Versions" value={profile.compatibleToolVersions.join(", ") || "—"} />
                <Field label="Compatibility Status" value={profile.adapterCompatibilityStatus} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{profile.readiness}</Badge>
                <p className="text-sm text-muted-foreground">READY is not claimed. Live solver certification remains outstanding.</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2">Capability</th>
                      <th className="py-2">Availability</th>
                      <th className="py-2">Certification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.capabilities.map((cap) => (
                      <tr key={cap.key} className="border-b">
                        <td className="py-2">{cap.key}</td>
                        <td className="py-2">{cap.availability}</td>
                        <td className="py-2">{cap.certification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(profile.lastValidation.checks ?? []).map((check) => (
                  <Field key={check.action} label={check.action} value={`${check.status} — ${check.detail}`} />
                ))}
                {profile.lastValidation.checks?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No validation run recorded.</p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    fetch(`/api/engineering/external-tools/${params.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "validate" }),
                    })
                      .then((r) => r.json())
                      .then((json) => {
                        if (json.error) setError(json.error);
                        else setProfile(json.data as Profile);
                      })
                      .catch((e) => setError(e.message));
                  }}
                >
                  Run validation
                </Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="Last Validation" value={profile.lastValidation.ranAt ?? "—"} />
                <Field label="Last Configuration Change" value={profile.updatedAt || "—"} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
