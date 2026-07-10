"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

export default function ProductInstallPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.productSlug as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startInstall() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/installations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Installation failed");
      router.push(`/system/products/${productSlug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Installation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Install Product" />
      <PageMain>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Install {productSlug}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This runs the entitlement-gated installation workflow: verify subscription and licence,
              validate dependencies, provision Engineering OS configuration, assign workspaces, and activate access.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={startInstall} disabled={loading}>
                {loading ? "Installing…" : "Start Installation"}
              </Button>
              <Link href={`/system/products/${productSlug}`} className="text-sm text-primary hover:underline">
                Cancel
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageMain>
    </>
  );
}
