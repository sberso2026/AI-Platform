"use client";

import { useEffect, useState } from "react";
import { displayWorkspaceRole } from "@rtb/platform-core";

type WorkspaceOption = {
  tenantId: string;
  tenantSlug: string;
  roleSlug: string;
  workspaceId: string;
  slug: string;
};

type ActiveContextResponse = {
  data?: {
    current?: { tenantId?: string; workspaceId?: string; roleSlug?: string; tenantSlug?: string } | null;
    reason?: string;
    memberships?: Array<{
      tenantId: string;
      tenantSlug: string;
      roleSlug: string;
      workspaces: Array<{ workspaceId: string; slug: string }>;
    }>;
  };
};

function optionsFrom(payload: ActiveContextResponse): WorkspaceOption[] {
  const rows = payload.data?.memberships ?? [];
  const options: WorkspaceOption[] = [];
  for (const membership of rows) {
    for (const workspace of membership.workspaces ?? []) {
      options.push({
        tenantId: membership.tenantId,
        tenantSlug: membership.tenantSlug,
        roleSlug: membership.roleSlug,
        workspaceId: workspace.workspaceId,
        slug: workspace.slug,
      });
    }
  }
  return options;
}

export function WorkspaceSwitcher({ compact = false }: { compact?: boolean }) {
  const [options, setOptions] = useState<WorkspaceOption[]>([]);
  const [current, setCurrent] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/platform/active-context", { credentials: "same-origin" });
      if (!response.ok) return;
      const payload = (await response.json()) as ActiveContextResponse;
      if (cancelled) return;
      const next = optionsFrom(payload);
      setOptions(next);
      const active = payload.data?.current;
      if (active?.tenantId && active.workspaceId) {
        setCurrent(`${active.tenantId}:${active.workspaceId}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (compact || options.length === 0) return null;

  const selected = options.find((option) => `${option.tenantId}:${option.workspaceId}` === current);

  async function onChange(value: string) {
    const option = options.find((item) => `${item.tenantId}:${item.workspaceId}` === value);
    if (!option) return;
    const { confirmLeaveIfUnsaved } = await import(
      "@/components/engineering/project-workspace/unsaved-changes-guard"
    );
    const allowed = await confirmLeaveIfUnsaved();
    if (!allowed) return;
    setPending(true);
    const response = await fetch("/api/platform/active-context", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: option.tenantId, workspaceId: option.workspaceId }),
    });
    setPending(false);
    if (!response.ok) return;
    setCurrent(value);
    window.location.assign("/engineering");
  }

  return (
    <div className="border-b border-sidebar-border px-4 py-2" data-testid="workspace-switcher">
      <label className="block text-[0.65rem] uppercase tracking-wide text-sidebar-foreground/50" htmlFor="active-workspace">
        Workspace
      </label>
      <p
        className="truncate text-[0.75rem] text-sidebar-foreground/80"
        data-testid="active-workspace-label"
        title={selected ? `${selected.tenantSlug} / ${selected.slug}` : undefined}
      >
        {selected ? selected.slug : "Select workspace"}
      </p>
      <p className="truncate text-[0.75rem] text-sidebar-foreground/70">
        {selected ? `Role ${displayWorkspaceRole(selected.roleSlug)}` : "Role follows the selected workspace"}
      </p>
      {options.length > 1 ? (
        <select
          id="active-workspace"
          className="mt-2 w-full rounded border border-sidebar-border bg-sidebar px-2 py-1 text-[0.8125rem] text-white"
          value={current}
          disabled={pending}
          aria-label="Active workspace"
          onChange={(event) => void onChange(event.target.value)}
        >
          <option value="">Select a workspace</option>
          {options.map((option) => (
            <option key={`${option.tenantId}:${option.workspaceId}`} value={`${option.tenantId}:${option.workspaceId}`}>
              {`${option.tenantSlug} / ${option.slug} (${displayWorkspaceRole(option.roleSlug)})`}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
