"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type Catalog = {
  templates: Array<{ id: string; workType: string; lifecycleStage: string; title: string }>;
  lifecycleProfiles: Record<string, string[]>;
  engineeringRequirementSeparation: boolean;
};

export default function InformationRequirementSettingsPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const canWrite = canMutate && assurance.aal === "aal2";

  useEffect(() => {
    fetch("/api/engineering/information-requirements?action=catalog")
      .then((response) => parseApiJsonResponse<Catalog>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setCatalog(json.data);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <>
      <Header title="Information requirement templates" description="Governed lifecycle profiles and work-type templates. Templates are code-catalogued. Ordinary engineers cannot silently redefine them." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <p className="mt-3 text-sm"><Link className="underline-offset-2 hover:underline" href="/engineering/information-requirements">Open Information Requirements workspace</Link></p>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Work-type templates</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(catalog?.templates ?? []).map((row) => (
              <p key={row.id}>{row.workType} · {row.lifecycleStage} · {row.title}</p>
            ))}
            {!canWrite && <p>Only authorized Engineering administrators may mutate template governance, and AAL2 is required.</p>}
            {canWrite && <p>Templates remain code-governed in this phase. AAL2 is present; live silent rewrite of the catalog is not enabled.</p>}
            <p className="text-muted-foreground">Information Requirements are distinct from Engineering Requirements. Lifecycle profiles vary required information without hardcoding every project.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
