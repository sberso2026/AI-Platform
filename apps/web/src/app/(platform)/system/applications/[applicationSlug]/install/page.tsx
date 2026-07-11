"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

export default function ApplicationInstallPage() {
  const params = useParams();
  const router = useRouter();
  const applicationSlug = params.applicationSlug as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startInstall() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/app-installations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationKey: applicationSlug.replace(/-/g, "_") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Installation failed");
      const installationId = json.data?.id;
      if (installationId) {
        router.push(`/system/installations/${installationId}`);
      } else {
        router.push("/system/products/engineering-os");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Installation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Install Application" showEngineeringChrome={false} />
      <PageMain>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Install {applicationSlug}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Application installation requires an active parent Operating System, valid licence,
              and entitlement. Progress is recorded in the installation workflow.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={startInstall} disabled={loading}>
                {loading ? "Requesting…" : "Request Installation"}
              </Button>
              <Link href="/system/products/engineering-os" className="text-sm text-primary hover:underline">
                Cancel
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageMain>
    </>
  );
}
