"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

export default function ProductHealthPage() {
  const params = useParams();
  const productSlug = params.productSlug as string;
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const catalog = await fetch("/api/platform/commerce/catalog").then((r) => r.json());
      const product = catalog.data?.products?.find(
        (p: { slug: string }) => p.slug === productSlug
      );
      const installations = await fetch("/api/platform/installations").then((r) => r.json());
      const inst = installations.data?.find(
        (i: { product_id: string }) => product && i.product_id === product.id
      );
      if (!inst?.id) {
        setError("No installation record found");
        return;
      }
      setInstallationId(inst.id);
      const res = await fetch(`/api/platform/installations/${inst.id}/health`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Health check failed");
        return;
      }
      setHealth(json.data);
    }
    void load();
  }, [productSlug]);

  return (
    <>
      <Header title="Installation Health" />
      <PageMain>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{productSlug} health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {health && (
              <pre className="overflow-auto rounded-md bg-slate-50 p-3 text-xs">
                {JSON.stringify(health, null, 2)}
              </pre>
            )}
            {installationId && (
              <Link
                href={`/system/products/${productSlug}`}
                className="text-sm text-primary hover:underline"
              >
                Back to product
              </Link>
            )}
          </CardContent>
        </Card>
      </PageMain>
    </>
  );
}
