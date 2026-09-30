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
};

export default function DeliverableSettingsPage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <Header
        title="Deliverable profile governance"
        description="Select the governed example deliverable catalog and maturity profile version. This is not a document register or executable rule editor."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/settings">
            Engineering Settings
          </Link>
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data?.maturityProfile?.profileId} {data?.maturityProfile?.profileVersion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Catalog origin is TEMPLATE / EXAMPLE unless selected into a project. These definitions are not mandatory for every FEED project.</p>
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
      </main>
    </>
  );
}
