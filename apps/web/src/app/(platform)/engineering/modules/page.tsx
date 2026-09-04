"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CommandPageTitle, CommandPanel, StatusChip } from "@rtb/ui";
import {
  Activity,
  BarChart3,
  Box,
  Brain,
  ClipboardCheck,
  Network,
} from "lucide-react";
import type { CanonicalModuleAccess } from "@/lib/commerce/canonical-access";

const MODULES = [
  {
    key: "project_intelligence",
    name: "Project Intelligence",
    purpose: "Project reasoning and decision intelligence",
    relationship: "Reasons over Engineering OS, Project Controls, and published evidence",
    href: "/engineering/apps/project-intelligence",
    icon: Brain,
  },
  {
    key: "inspection_intelligence",
    name: "Inspection Intelligence",
    purpose: "Inspection planning, field capture, and review",
    relationship: "Feeds findings and condition into Engineering Core",
    href: "/engineering/apps/inspection-intelligence",
    icon: ClipboardCheck,
  },
  {
    key: "asset_intelligence",
    name: "Asset Intelligence",
    purpose: "Asset condition, criticality, and reliability signals",
    relationship: "Connects asset records to inspection and engineering evidence",
    href: "/engineering/apps/asset-intelligence",
    icon: Activity,
  },
  {
    key: "project_controls",
    name: "Project Controls",
    purpose: "Governed cost, schedule, and progress intelligence",
    relationship: "System of record for schedule and cost publications",
    href: "/engineering/apps/project-controls",
    icon: BarChart3,
  },
  {
    key: "digital_twin",
    name: "Digital Twin",
    purpose: "Twin identity, state, simulation, and digital thread",
    relationship: "Federates model and state evidence into Engineering OS",
    href: "/engineering/apps/digital-twin",
    icon: Box,
  },
  {
    key: "engineering_model_interoperability",
    name: "Engineering Models",
    purpose: "IFC / SPACE GASS / ETABS federation with governed mapping",
    relationship: "Interoperability layer — not a second model register",
    href: "/engineering/apps/model-interoperability",
    icon: Network,
  },
];

type AccessSnapshot = {
  modules: CanonicalModuleAccess[];
  canInstall: boolean;
  canReconcilePilot: boolean;
  needsPilotReconcile: boolean;
};

function matrixAction(module: (typeof MODULES)[number], access?: CanonicalModuleAccess) {
  if (!access) {
    return { href: undefined as string | undefined, label: "Checking access", kind: "none" as const };
  }
  if (access.matrixAction === "open") {
    return { href: module.href, label: "Open system", kind: "open" as const };
  }
  if (access.matrixAction === "install") {
    return { href: undefined, label: "Install", kind: "install" as const };
  }
  if (access.matrixAction === "view_plan") {
    return { href: "/system/subscriptions", label: "View plan", kind: "link" as const };
  }
  if (access.matrixAction === "view_details") {
    return { href: module.href, label: "View details", kind: "link" as const };
  }
  return { href: undefined, label: access.matrixActionLabel, kind: "none" as const };
}

export default function EngineeringModuleLauncherPage() {
  const [snapshot, setSnapshot] = useState<AccessSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/engineering/modules/access")
      .then((res) => res.json())
      .then((json) => {
        setSnapshot(json.data ?? null);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function install(applicationKey: string) {
    setBusyKey(applicationKey);
    setError(null);
    try {
      const res = await fetch("/api/platform/app-installations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Installation failed");
        return;
      }
      load();
    } finally {
      setBusyKey(null);
    }
  }

  async function reconcilePilot() {
    setBusyKey("reconcile");
    setError(null);
    try {
      const res = await fetch("/api/platform/commerce/licenses/reconcile-pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Pilot reconciliation failed");
        return;
      }
      load();
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <>
      <Header
        title="Engineering Systems"
        description="Certified modules hosted by Engineering OS"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-module-launcher"
      >
        <CommandPageTitle
          eyebrow="Engineering OS"
          title="Engineering systems matrix"
          description="Each system remains hosted by Engineering OS. No module bypasses the operating system."
        />
        {error && <p className="mb-4 text-sm text-[color:var(--eos-danger)]">{error}</p>}
        {snapshot?.canReconcilePilot && snapshot.needsPilotReconcile && (
          <CommandPanel
            title="Pilot applications"
            accent="cyan"
            className="mb-4"
            action={
              <button
                type="button"
                className="eos-shell-link"
                disabled={busyKey === "reconcile"}
                onClick={() => void reconcilePilot()}
              >
                {busyKey === "reconcile" ? "Reconciling…" : "Reconcile pilot applications"}
              </button>
            }
          >
            <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">
              Certified Engineering OS applications are missing from the current tenant licence set.
              Reconciliation issues tenant-scoped application licences and installs through Commerce.
            </p>
          </CommandPanel>
        )}
        <div className="grid gap-4 xl:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const access = snapshot?.modules.find((row) => row.applicationKey === mod.key);
            const action = matrixAction(mod, access);
            return (
              <CommandPanel
                key={mod.key}
                title={mod.name}
                accent="cyan"
                meta={
                  <span className="inline-flex items-center gap-2">
                    <StatusChip status={access?.chipStatus ?? "pending"}>
                      {access?.matrixBadge ?? "Checking"}
                    </StatusChip>
                  </span>
                }
                action={
                  action.kind === "open" && action.href ? (
                    <Link href={action.href} className="eos-shell-link" data-testid={`engineering-module-${mod.key}`}>
                      Open system
                    </Link>
                  ) : action.kind === "install" ? (
                    <button
                      type="button"
                      className="eos-shell-link"
                      data-testid={`engineering-module-${mod.key}`}
                      disabled={busyKey === mod.key}
                      onClick={() => void install(mod.key)}
                    >
                      {busyKey === mod.key ? "Installing…" : "Install"}
                    </button>
                  ) : action.kind === "link" && action.href ? (
                    <Link href={action.href} className="eos-shell-link" data-testid={`engineering-module-${mod.key}`}>
                      {action.label}
                    </Link>
                  ) : (
                    <span className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]" data-testid={`engineering-module-${mod.key}`}>
                      {action.label}
                    </span>
                  )
                }
              >
                <div className="flex items-start gap-4">
                  <Icon className="mt-1 h-6 w-6 text-[color:var(--eos-accent)]" aria-hidden />
                  <div className="min-w-0 space-y-2">
                    <p className="text-[1rem]">{mod.purpose}</p>
                    <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">{mod.relationship}</p>
                  </div>
                </div>
              </CommandPanel>
            );
          })}
        </div>
      </main>
    </>
  );
}
