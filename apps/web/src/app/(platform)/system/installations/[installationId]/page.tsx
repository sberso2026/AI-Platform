"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants } from "@rtb/ui";
import type { InstallationProgressView } from "@rtb/platform-core";
import { InstallationProgressPanel } from "@/components/commerce/installation-progress-panel";

export default function InstallationProgressPage() {
  const params = useParams();
  const installationId = params.installationId as string;
  const [progress, setProgress] = useState<InstallationProgressView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/platform/administration/installations/${installationId}/progress`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load progress");
        setProgress(json.data);
        setError(null);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, [installationId]);

  return (
    <>
      <Header
        title="Installation progress"
        description={
          progress?.productName
            ? `Workflow for ${progress.productName}`
            : "Real installation workflow steps from Commerce and Installation Lifecycle."
        }
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="mb-4">
          <Link href="/system/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ← Back to Installed Products
          </Link>
        </div>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {progress && (
          <InstallationProgressPanel
            progress={progress}
            onRetry={() => load()}
          />
        )}
      </PageMain>
    </>
  );
}
