import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import Link from "next/link";

/**
 * Cortex AI platform-only home. Valid when zero domain OS installations are active.
 * Readiness marker required by Phase 7A certification.
 */
export default function CortexPlatformHomePage() {
  return (
    <>
      <Header
        title="Cortex AI"
        description="Shared enterprise platform — install an Operating System to begin domain work"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div
          data-testid="cortex-platform-ready"
          className="mx-auto max-w-2xl space-y-6 py-10"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Cortex AI Platform
            </h1>
            <p className="text-sm text-slate-600">
              No domain Operating System is required to administer the platform. Browse the
              catalogue, manage workspaces and users, and install Engineering OS or other OS
              products when ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/system/marketplace"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300"
            >
              Browse Operating Systems
            </Link>
            <Link
              href="/system/products"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300"
            >
              Installed products
            </Link>
            <Link
              href="/workspaces"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300"
            >
              Workspaces
            </Link>
            <Link
              href="/platform/health"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300"
            >
              System health
            </Link>
          </div>

          <p className="text-xs text-slate-500" role="status">
            Empty platform state: domain navigation appears only after an OS is installed and
            entitled.
          </p>
        </div>
      </PageMain>
    </>
  );
}
