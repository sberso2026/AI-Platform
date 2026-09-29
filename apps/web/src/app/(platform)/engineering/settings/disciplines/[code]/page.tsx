"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

type Capability = { key: string; declaredStatus: string; effectiveStatus: string; notes?: string };
type Profile = {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  ownerId: string | null;
  readiness: string;
  capabilities: Capability[];
  standards: Array<{ standardCode: string; sourceReference: string; status: string }>;
  toolBindings: Array<{ toolCode: string; certificationStatus: string }>;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default function DisciplineDetailPage() {
  const params = useParams<{ code: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/discipline-intelligence/${params.code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setProfile(json.data as Profile);
      })
      .catch((e) => setError(e.message));
  }, [params.code]);

  return (
    <>
      <Header title={profile?.name ?? "Discipline"} description="Capability profile. Not an AI persona. Not a mini operating system." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline-offset-2 hover:underline" href="/engineering/settings/disciplines">
            Back to Disciplines
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
                <Field label="Code" value={profile.code} />
                <Field label="Enabled" value={String(profile.enabled)} />
                <Field label="Owner" value={profile.ownerId ?? "—"} />
                <p className="text-sm text-muted-foreground">{profile.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{profile.readiness}</Badge>
                <p className="text-sm text-muted-foreground">READY_FOR_ANALYSIS is not claimed while required tools are NOT_CONFIGURED.</p>
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
                      <th className="py-2">Declared</th>
                      <th className="py-2">Effective</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.capabilities.map((cap) => (
                      <tr key={cap.key} className="border-b">
                        <td className="py-2">{cap.key}</td>
                        <td className="py-2">{cap.declaredStatus}</td>
                        <td className="py-2">{cap.effectiveStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">External tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.toolBindings.length === 0 && <p className="text-sm text-muted-foreground">No tool bindings.</p>}
                {profile.toolBindings.map((bind) => (
                  <Field key={bind.toolCode} label={bind.toolCode} value={bind.certificationStatus} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.standards.map((row) => (
                  <Field key={row.standardCode} label={row.standardCode} value={`${row.status} — ${row.sourceReference}`} />
                ))}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Certification / audit</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Capability CERTIFIED requires engineering admin. Interfaces and Engineering Review remain canonical. Optimization remains canonical. No discipline-specific findings tables.
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
