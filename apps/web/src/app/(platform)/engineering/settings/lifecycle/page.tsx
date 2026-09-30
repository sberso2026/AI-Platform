"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Catalog = {
  profile?: {
    profileId: string;
    profileVersion: string;
    name: string;
    stages: string[];
    allowedTransitions: Array<{ from: string; to: string }>;
    gates: Array<{ gateId: string; name: string; fromStage: string; toStage: string }>;
    criteria: Array<{ criterionId: string; name: string; gateId: string; type: string }>;
  };
  setting?: { profileId: string; profileVersion: string; enabledCriterionIds: string[] | null } | null;
};

export default function LifecycleSettingsPage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const parsed = await parseApiJsonResponse(await fetch("/api/engineering/settings/lifecycle"));
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load lifecycle settings");
      return;
    }
    setData((parsed.data as Catalog) ?? null);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    const profile = data?.profile;
    if (!profile) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/settings/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileVersion: profile.profileVersion,
          enabledCriterionIds: profile.criteria.map((row) => row.criterionId),
        }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to update lifecycle profile");
      return;
    }
    await load();
  }

  const profile = data?.profile;

  return (
    <>
      <Header
        title="Lifecycle profile governance"
        description="Select the governed Engineering lifecycle profile and catalog criteria. This is not a workflow or rule-code editor."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/settings">
            Engineering Settings
          </Link>
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {profile.profileId} {profile.profileVersion} — {profile.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Canonical stages: {profile.stages.join(", ")}</p>
              <p>Allowed transitions are explicit and may be non-linear, including Operations → Modification.</p>
              <p>Schedule mappings are administered separately. Completing a mapped milestone does not approve a gate or transition a stage.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Code-governed profile</Badge>
                <Badge variant="secondary">No executable DSL</Badge>
              </div>
              <div className="space-y-2">
                {profile.criteria.map((row) => (
                  <p key={row.criterionId}>
                    {row.criterionId} · {row.gateId} · {row.type} — {row.name}
                  </p>
                ))}
              </div>
              <Button size="sm" onClick={() => void save()}>
                Apply catalog criteria
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </>
  );
}
