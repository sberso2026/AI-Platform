"use client";

import { useEffect, useState } from "react";

type ActiveContextPayload = {
  data?: {
    current?: { tenantId?: string; tenantSlug?: string; workspaceId?: string } | null;
    memberships?: Array<{
      tenantId: string;
      workspaces: Array<{ workspaceId: string; slug: string }>;
    }>;
  };
};

export function ActiveWorkspaceLabel() {
  const [label, setLabel] = useState("Selected workspace");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/platform/active-context", { credentials: "same-origin" });
      if (!response.ok) return;
      const payload = (await response.json()) as ActiveContextPayload;
      const current = payload.data?.current;
      if (!current?.tenantSlug || !current.workspaceId) return;
      const membership = payload.data?.memberships?.find((row) => row.tenantId === current.tenantId);
      const workspace = membership?.workspaces?.find((row) => row.workspaceId === current.workspaceId);
      if (!cancelled) setLabel(`${current.tenantSlug} / ${workspace?.slug ?? "default"}`);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <strong className="font-medium text-[color:var(--eos-text-primary)]" data-testid="active-workspace-name">
      {label}
    </strong>
  );
}
