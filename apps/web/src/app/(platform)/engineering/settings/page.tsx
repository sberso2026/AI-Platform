"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@rtb/ui";

export default function EngineeringSettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engineering/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const settings = data?.settings as Record<string, unknown> | null;
  const apps = (data?.applications as Record<string, unknown>[]) ?? [];

  return (
      <>
        <Header
        title="Engineering Settings"
        description="Engineering OS installation, applications, and preferences"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Installation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge
                  variant={
                    data?.installationStatus === "enabled" ? "success" : "secondary"
                  }
                >
                  {String(data?.installationStatus ?? "unknown")}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Feature Flag</span>
                <span>{String(data?.featureFlag ?? "engineering_os_enabled")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Document Numbering</span>
                <span>{String(settings?.document_numbering_format ?? "—")}</span>
              </div>
              <div className="flex justify-between">
                <span>Asset Tag Format</span>
                <span>{String(settings?.asset_tag_format ?? "—")}</span>
              </div>
              <div className="flex justify-between">
                <span>AI Review Threshold</span>
                <span>{String(settings?.ai_review_threshold ?? 0.7)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Engineering Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app.app_key as string}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{app.name as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.description as string}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {app.enabled ? "enabled" : "registered"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">External Tools & Integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Canonical configuration for SPACE GASS, ETABS, IFC, Microsoft 365, and other external systems.
              Installation, licence, and automation are platform/admin settings — not project options.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/external-tools">
                  Open External Tools & Integrations
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disciplines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Canonical Multidiscipline Intelligence Foundation. Capability status, standards references, and tool bindings.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/disciplines">
                  Open Disciplines
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assurance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Governed enable/disable of approved Assurance catalog rules. Rule logic stays in code. Ordinary
              engineers cannot change rule governance from the Assurance workspace.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/assurance">
                  Open Assurance rule settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Governed Engineering lifecycle profile, stage applicability, allowed transitions, and gate criteria.
              Profile logic stays in code. Ordinary engineers cannot authorize stage transitions from settings.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/lifecycle">
                  Open Lifecycle profile settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Governed deliverable definitions, lifecycle/discipline applicability, and maturity profile version.
              Example catalog items are not mandatory for every FEED project. Ordinary engineers cannot change
              catalog governance from the Deliverables workspace.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/deliverables">
                  Open Deliverable settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Governed information type catalog and purpose-specific source authority policy. Ordinary
              engineers can inspect effective authority but cannot silently redefine it.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/information">
                  Open Information settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work Context</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Managed engineering repositories and capture policy. Default capture is DENY. Ordinary
              engineers cannot silently broaden repository scope or enable desktop surveillance.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/work-context">
                  Open Managed Repositories
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Governed information-requirement templates and lifecycle profiles. Templates stay
              in the catalog. Ordinary engineers cannot silently redefine required information.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/information-requirements">
                  Open Information Requirement settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Artifact Templates</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Company official and project/client presentation templates. EOS Professional Default remains the SME fallback.
              Ordinary engineers cannot change template policy. Company shells do not certify calculation formulas.
              <div className="mt-3">
                <Link className="font-medium underline-offset-2 hover:underline" href="/engineering/settings/templates">
                  Open Artifact Template settings
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissions & Policies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Engineering permissions map to platform RBAC resource `engineering`.
              Default policies enforce review for engineering decisions.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompts & Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Engineering prompts and `engineering_os_enabled` are managed via Platform
              Intelligence registries.
            </CardContent>
          </Card>
        </div>
      </main>
      </>
  );
}
