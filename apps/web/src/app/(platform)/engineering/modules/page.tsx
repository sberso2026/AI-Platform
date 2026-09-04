"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, StatusChip } from "@rtb/ui";
import {
  Boxes,
  Brain,
  ClipboardCheck,
  BarChart3,
  Box,
  Network,
  Activity,
  type LucideIcon,
} from "lucide-react";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  engineeringSystemsChipStatus,
  type EngineeringSystemsCommerceState,
} from "@/lib/engineering/certified-modules";

const ICONS: Record<string, LucideIcon> = {
  project_intelligence: Brain,
  inspection_intelligence: ClipboardCheck,
  asset_intelligence: Activity,
  project_controls: BarChart3,
  digital_twin: Box,
  engineering_model_interoperability: Network,
};

type ModuleAccess = {
  applicationKey: string;
  allowed: boolean;
  installed?: boolean;
  systemsState?: EngineeringSystemsCommerceState;
  name?: string;
  href?: string;
};

export default function EngineeringModuleLauncherPage() {
  const [modules, setModules] = useState<ModuleAccess[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/modules/access")
      .then(async (r) => {
        const json = await r.json().catch(() => null);
        if (!r.ok) throw new Error("access_failed");
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        const rows = Array.isArray(json?.data?.modules) ? (json.data.modules as ModuleAccess[]) : [];
        setModules(rows);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load Engineering Systems");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = ENGINEERING_CERTIFIED_V1_MODULES.map((mod) => {
    const access = modules.find((row) => row.applicationKey === mod.applicationKey);
    const state: EngineeringSystemsCommerceState | null = loaded
      ? (access?.systemsState ?? "Unavailable")
      : null;
    return { ...mod, state, open: Boolean(access?.allowed), href: access?.href ?? mod.href };
  });

  return (
    <>
      <Header
        title="Engineering Systems"
        description="Governed application launcher for Engineering OS — no application bypasses the OS"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-module-launcher"
      >
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Boxes className="h-4 w-4" />
          <span>Installed, available, and not-included applications from canonical Commerce</span>
        </div>
        {error ? (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {cards.map((mod) => {
            const Icon = ICONS[mod.applicationKey] ?? Boxes;
            const content = (
              <Card className="h-full transition hover:border-slate-400">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-700" />
                    <CardTitle className="text-base">{mod.name}</CardTitle>
                  </div>
                  {mod.state ? (
                    <StatusChip status={engineeringSystemsChipStatus(mod.state)}>{mod.state}</StatusChip>
                  ) : (
                    <span className="text-xs text-slate-500">Checking commerce…</span>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{mod.description}</p>
                </CardContent>
              </Card>
            );
            if (!mod.open) {
              return (
                <div key={mod.applicationKey} data-testid={`engineering-module-${mod.applicationKey}`}>
                  {content}
                </div>
              );
            }
            return (
              <Link
                key={mod.applicationKey}
                href={mod.href}
                data-testid={`engineering-module-${mod.applicationKey}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
