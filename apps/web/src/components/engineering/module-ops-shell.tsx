"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ModuleSectionNav, type ModuleNavLink } from "@/components/engineering/module-section-nav";
import { useEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";

export type ModuleOpsShellProps = {
  title: string;
  description: string;
  testId: string;
  primaryLinks: readonly ModuleNavLink[];
  adminLinks: readonly ModuleNavLink[];
  adminLabel?: string;
  returnHref?: string;
  children: ReactNode;
  moduleVersionAttr?: string;
  moduleStatusAttr?: string;
};

/**
 * Shared operational chrome for Engineering OS applications.
 * Reuses Header (workspace + project command interface) and existing nav tokens.
 * Release / diagnostics stay under Administration, not primary tabs.
 */
export function ModuleOpsShell({
  title,
  description,
  testId,
  primaryLinks,
  adminLinks,
  adminLabel = "Administration",
  returnHref = "/engineering",
  children,
  moduleVersionAttr,
  moduleStatusAttr,
}: ModuleOpsShellProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid={testId}
      {...(moduleVersionAttr ? { "data-module-version": moduleVersionAttr } : {})}
      {...(moduleStatusAttr ? { "data-module-status": moduleStatusAttr } : {})}
    >
      <Header title={title} description={description} />
      <main
        className="page-main min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        data-testid="page-main"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="module-shell-back"
              className="inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:border-slate-400"
              onClick={() => router.back()}
            >
              Back
            </button>
            <Link
              href={returnHref}
              data-testid="module-shell-return"
              className="inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:border-slate-400"
            >
              Return
            </Link>
          </div>

          <Suspense fallback={null}>
            <ModuleContextStrip />
          </Suspense>

          <ModuleSectionNav links={primaryLinks} ariaLabel={`${title} sections`} />

          <details className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2" data-testid="module-administration">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              {adminLabel}
            </summary>
            <nav className="mt-2 flex flex-wrap gap-3 text-sm" aria-label={`${title} administration`}>
              {adminLinks.map((link) => {
                const path = link.href.split("?")[0] ?? link.href;
                const active = pathname === path || pathname.startsWith(`${path}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={active ? "true" : "false"}
                    className={
                      active
                        ? "inline-flex min-h-11 items-center font-medium text-slate-900 underline"
                        : "inline-flex min-h-11 items-center text-slate-700 underline-offset-2 hover:underline"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </details>

          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function ModuleContextStrip() {
  const searchParams = useSearchParams();
  const projectId = useEngineeringProjectFilter();
  const assetId = searchParams.get("assetId");
  const twinId = searchParams.get("twinId");

  return (
    <div
      className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600"
      data-testid="module-context-strip"
    >
      <span>
        Workspace <strong className="font-medium text-slate-900">RTB Engineering</strong>
      </span>
      <span>
        Project{" "}
        <strong className="font-medium text-slate-900">{projectId ?? "All projects"}</strong>
      </span>
      {assetId ? (
        <span>
          Asset <strong className="font-medium text-slate-900">{assetId}</strong>
        </span>
      ) : null}
      {twinId ? (
        <span>
          Twin <strong className="font-medium text-slate-900">{twinId}</strong>
        </span>
      ) : null}
    </div>
  );
}
