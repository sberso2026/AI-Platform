"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, SectionHeader } from "@rtb/ui";
import { Briefcase } from "lucide-react";

type Capability = {
  id: string;
  name: string;
  description: string;
  implemented: boolean;
  activationStatus: string;
};

type StatusPayload = {
  osId: string;
  name: string;
  version: string;
  phase: string;
  foundationState: string;
  catalogStatus: string;
  featureKey: string;
  implementsOwnAiStack: boolean;
  capabilities: Capability[];
};

export default function BusinessOsFoundationPage() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/business/status")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(typeof json.error === "string" ? json.error : "Access denied");
        else setData(json.data as StatusPayload);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <Header
        title="Business OS"
        description="Foundation preview — domain capabilities are registered, not operational"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="business-os-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}

        <section className="mb-8" data-testid="business-os-identity">
          <SectionHeader
            title="Business Operating System"
            description="First-class OS on RTB AI Platform. BOS-0 establishes identity, access, and capability registration only."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="OS id" value={data?.osId ?? "business"} />
            <Fact label="Phase" value={data?.phase ?? "BOS-0"} />
            <Fact label="State" value={data?.foundationState ?? "preview"} />
            <Fact label="Catalog" value={data?.catalogStatus ?? "coming_soon"} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Internal preview requires the experimental{" "}
            <code className="rounded bg-slate-100 px-1">{data?.featureKey ?? "business_os"}</code>
            {" "}feature flag (default off) and <code className="rounded bg-slate-100 px-1">business_os.view</code>.
            Catalog remains coming_soon — this is not a commercial install.
            Independent AI stacks are forbidden
            {data ? ` (implementsOwnAiStack=${String(data.implementsOwnAiStack)})` : ""}.
          </p>
        </section>

        <section aria-label="Future capabilities">
          <SectionHeader
            title="Registered capabilities"
            description="These identifiers are reserved for later BOS modules. They are not working features."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(data?.capabilities ?? []).map((cap) => (
              <Card key={cap.id} className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-900">{cap.name}</CardTitle>
                  <Badge variant="secondary">Not available</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>{cap.description}</p>
                  <p className="mt-2 font-mono text-xs text-slate-500">{cap.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {!data && !error && (
            <EmptyState
              title="Loading Business OS"
              description="Resolving foundation status for this tenant."
              icon={<Briefcase className="h-5 w-5" />}
            />
          )}
        </section>

        <p className="mt-8 text-sm text-slate-600">
          <Link href="/business/settings" className="font-semibold text-blue-700 hover:underline">
            Open Business OS settings
          </Link>
        </p>
      </PageMain>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-sm text-slate-900">{value}</div>
    </div>
  );
}
